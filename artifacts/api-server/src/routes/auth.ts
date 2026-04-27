import * as oidc from "openid-client";
import crypto from "crypto";
import { Router, type IRouter, type Request, type Response } from "express";
import {
  GetCurrentAuthUserResponse,
  ExchangeMobileAuthorizationCodeBody,
  ExchangeMobileAuthorizationCodeResponse,
  LogoutMobileSessionResponse,
} from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  clearSession,
  getOidcConfig,
  getSessionId,
  createSession,
  deleteSession,
  SESSION_COOKIE,
  SESSION_TTL,
  ISSUER_URL,
  type SessionData,
} from "../lib/auth";

const OIDC_COOKIE_TTL = 10 * 60 * 1000;
const TRANSFER_TTL_MS = 5 * 60 * 1000;

interface TransferEntry {
  sessionData: SessionData;
  expiresAt: number;
}
const transferStore = new Map<string, TransferEntry>();

function setTransfer(code: string, sessionData: SessionData) {
  transferStore.set(code, { sessionData, expiresAt: Date.now() + TRANSFER_TTL_MS });
}

function takeTransfer(code: string): SessionData | null {
  const entry = transferStore.get(code);
  if (!entry) return null;
  transferStore.delete(code);
  if (entry.expiresAt < Date.now()) return null;
  return entry.sessionData;
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of transferStore.entries()) {
    if (v.expiresAt < now) transferStore.delete(k);
  }
}, 60 * 1000).unref?.();

function isAllowedMobileRedirect(uri: string): boolean {
  return /^(verbitra|exp|exps):\/\//.test(uri);
}

function appendQueryParam(uri: string, key: string, value: string): string {
  const sep = uri.includes("?") ? "&" : "?";
  return `${uri}${sep}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}

const router: IRouter = Router();

function getOrigin(req: Request): string {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host =
    req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
  return `${proto}://${host}`;
}

function setSessionCookie(res: Response, sid: string) {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

function setOidcCookie(res: Response, name: string, value: string) {
  res.cookie(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: OIDC_COOKIE_TTL,
  });
}

function getSafeReturnTo(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}

async function upsertUser(claims: Record<string, unknown>) {
  const replitId = claims.sub as string;
  const profileData = {
    replitId,
    email: (claims.email as string) || null,
    firstName: (claims.first_name as string) || null,
    lastName: (claims.last_name as string) || null,
    profileImageUrl: ((claims.profile_image_url || claims.picture) as string) || null,
    updatedAt: new Date(),
  };

  const existing = await db.query.usersTable.findFirst({
    where: eq(usersTable.replitId, replitId),
  });

  if (existing) {
    const [updated] = await db
      .update(usersTable)
      .set(profileData)
      .where(eq(usersTable.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(usersTable)
    .values(profileData)
    .returning();
  return created;
}

router.get("/auth/user", (req: Request, res: Response) => {
  res.json(
    GetCurrentAuthUserResponse.parse({
      user: req.isAuthenticated() ? req.user : null,
    }),
  );
});

router.get("/login", async (req: Request, res: Response) => {
  const config = await getOidcConfig();
  const callbackUrl = `${getOrigin(req)}/api/callback`;

  const returnTo = getSafeReturnTo(req.query.returnTo);

  const state = oidc.randomState();
  const nonce = oidc.randomNonce();
  const codeVerifier = oidc.randomPKCECodeVerifier();
  const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);

  const redirectTo = oidc.buildAuthorizationUrl(config, {
    redirect_uri: callbackUrl,
    scope: "openid email profile offline_access",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    prompt: "login consent",
    state,
    nonce,
  });

  setOidcCookie(res, "code_verifier", codeVerifier);
  setOidcCookie(res, "nonce", nonce);
  setOidcCookie(res, "state", state);
  setOidcCookie(res, "return_to", returnTo);

  res.redirect(redirectTo.href);
});

// Query params not validated — OIDC provider may include extra params
router.get("/callback", async (req: Request, res: Response) => {
  const config = await getOidcConfig();
  const callbackUrl = `${getOrigin(req)}/api/callback`;

  const codeVerifier = req.cookies?.code_verifier;
  const nonce = req.cookies?.nonce;
  const expectedState = req.cookies?.state;

  if (!codeVerifier || !expectedState) {
    res.redirect("/api/login");
    return;
  }

  const currentUrl = new URL(
    `${callbackUrl}?${new URL(req.url, `http://${req.headers.host}`).searchParams}`,
  );

  let tokens: oidc.TokenEndpointResponse & oidc.TokenEndpointResponseHelpers;
  try {
    tokens = await oidc.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: codeVerifier,
      expectedNonce: nonce,
      expectedState,
      idTokenExpected: true,
    });
  } catch {
    res.redirect("/api/login");
    return;
  }

  const returnTo = getSafeReturnTo(req.cookies?.return_to);

  res.clearCookie("code_verifier", { path: "/" });
  res.clearCookie("nonce", { path: "/" });
  res.clearCookie("state", { path: "/" });
  res.clearCookie("return_to", { path: "/" });

  const claims = tokens.claims();
  if (!claims) {
    res.redirect("/api/login");
    return;
  }

  const dbUser = await upsertUser(claims as unknown as Record<string, unknown>);

  const now = Math.floor(Date.now() / 1000);
  const sessionData: SessionData = {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      profileImageUrl: dbUser.profileImageUrl,
    },
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: tokens.expiresIn() ? now + tokens.expiresIn()! : claims.exp,
  };

  const sid = await createSession(sessionData);
  setSessionCookie(res, sid);
  res.redirect(returnTo);
});

router.get("/logout", async (req: Request, res: Response) => {
  const config = await getOidcConfig();
  const origin = getOrigin(req);

  const sid = getSessionId(req);
  await clearSession(res, sid);

  const endSessionUrl = oidc.buildEndSessionUrl(config, {
    client_id: process.env.REPL_ID!,
    post_logout_redirect_uri: origin,
  });

  res.redirect(endSessionUrl.href);
});

router.get("/mobile-auth/start", async (req: Request, res: Response) => {
  const appRedirect =
    typeof req.query.app_redirect === "string" ? req.query.app_redirect : "";
  if (!isAllowedMobileRedirect(appRedirect)) {
    res.status(400).send("Invalid app_redirect");
    return;
  }

  const config = await getOidcConfig();
  const callbackUrl = `${getOrigin(req)}/api/mobile-auth/callback`;

  const state = oidc.randomState();
  const nonce = oidc.randomNonce();
  const codeVerifier = oidc.randomPKCECodeVerifier();
  const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);

  const redirectTo = oidc.buildAuthorizationUrl(config, {
    redirect_uri: callbackUrl,
    scope: "openid email profile offline_access",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    prompt: "login consent",
    state,
    nonce,
  });

  setOidcCookie(res, "m_code_verifier", codeVerifier);
  setOidcCookie(res, "m_nonce", nonce);
  setOidcCookie(res, "m_state", state);
  setOidcCookie(res, "m_app_redirect", appRedirect);

  res.redirect(redirectTo.href);
});

router.get("/mobile-auth/callback", async (req: Request, res: Response) => {
  const config = await getOidcConfig();
  const callbackUrl = `${getOrigin(req)}/api/mobile-auth/callback`;

  const codeVerifier = req.cookies?.m_code_verifier;
  const nonce = req.cookies?.m_nonce;
  const expectedState = req.cookies?.m_state;
  const appRedirect = req.cookies?.m_app_redirect;

  res.clearCookie("m_code_verifier", { path: "/" });
  res.clearCookie("m_nonce", { path: "/" });
  res.clearCookie("m_state", { path: "/" });
  res.clearCookie("m_app_redirect", { path: "/" });

  if (
    !codeVerifier ||
    !expectedState ||
    !appRedirect ||
    !isAllowedMobileRedirect(appRedirect)
  ) {
    res
      .status(400)
      .send("Mobile auth session expired. Please return to the app and try logging in again.");
    return;
  }

  const currentUrl = new URL(
    `${callbackUrl}?${new URL(req.url, `http://${req.headers.host}`).searchParams}`,
  );

  let tokens: oidc.TokenEndpointResponse & oidc.TokenEndpointResponseHelpers;
  try {
    tokens = await oidc.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: codeVerifier,
      expectedNonce: nonce,
      expectedState,
      idTokenExpected: true,
    });
  } catch (err) {
    req.log.error({ err }, "Mobile callback OIDC error");
    res.status(401).send("Authentication failed. Please return to the app and try again.");
    return;
  }

  const claims = tokens.claims();
  if (!claims) {
    res.status(401).send("Authentication failed.");
    return;
  }

  const dbUser = await upsertUser(claims as unknown as Record<string, unknown>);

  const now = Math.floor(Date.now() / 1000);
  const sessionData: SessionData = {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      profileImageUrl: dbUser.profileImageUrl,
    },
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: tokens.expiresIn() ? now + tokens.expiresIn()! : claims.exp,
  };

  const transferCode = crypto.randomBytes(32).toString("hex");
  setTransfer(transferCode, sessionData);

  res.redirect(appendQueryParam(appRedirect, "transfer", transferCode));
});

router.post("/mobile-auth/redeem-transfer", async (req: Request, res: Response) => {
  const transfer = typeof req.body?.transfer === "string" ? req.body.transfer : "";
  if (!transfer) {
    res.status(400).json({ error: "Missing transfer code" });
    return;
  }
  const sessionData = takeTransfer(transfer);
  if (!sessionData) {
    res.status(401).json({ error: "Invalid or expired transfer code" });
    return;
  }
  const sid = await createSession(sessionData);
  res.json(ExchangeMobileAuthorizationCodeResponse.parse({ token: sid }));
});

router.post("/mobile-auth/token-exchange", async (req: Request, res: Response) => {
  const parsed = ExchangeMobileAuthorizationCodeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Missing or invalid required parameters" });
    return;
  }

  const { code, code_verifier, redirect_uri, state, nonce } = parsed.data;

  try {
    const config = await getOidcConfig();

    const callbackUrl = new URL(redirect_uri);
    callbackUrl.searchParams.set("code", code);
    callbackUrl.searchParams.set("state", state);
    callbackUrl.searchParams.set("iss", ISSUER_URL);

    const tokens = await oidc.authorizationCodeGrant(config, callbackUrl, {
      pkceCodeVerifier: code_verifier,
      expectedNonce: nonce ?? undefined,
      expectedState: state,
      idTokenExpected: true,
    });

    const claims = tokens.claims();
    if (!claims) {
      res.status(401).json({ error: "No claims in ID token" });
      return;
    }

    const dbUser = await upsertUser(claims as unknown as Record<string, unknown>);

    const now = Math.floor(Date.now() / 1000);
    const sessionData: SessionData = {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        profileImageUrl: dbUser.profileImageUrl,
      },
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expiresIn() ? now + tokens.expiresIn()! : claims.exp,
    };

    const sid = await createSession(sessionData);
    res.json(ExchangeMobileAuthorizationCodeResponse.parse({ token: sid }));
  } catch (err) {
    req.log.error({ err }, "Mobile token exchange error");
    res.status(500).json({ error: "Token exchange failed" });
  }
});

router.post("/mobile-auth/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  if (sid) {
    await deleteSession(sid);
  }
  res.json(LogoutMobileSessionResponse.parse({ success: true }));
});

export default router;
