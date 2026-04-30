// Auth HTTP routes.
//
// Why this file exists:
// The mobile app talks to Supabase Auth directly for signup/sign-in/refresh —
// it has the public anon key embedded in the build, which is the standard
// Supabase pattern. So why does the API expose any auth routes at all?
//
//   1. `/auth/user` — the app already calls this on launch to learn whether
//      its stored session is still valid AND to fetch the *local* user id
//      (which is a different UUID from the Supabase user id, because the
//      `users` table predates Supabase). Other tables in this DB store rows
//      keyed by that local id.
//   2. `/auth/sign-up`, `/auth/sign-in`, `/auth/sign-out` — thin proxies to
//      Supabase. Useful because (a) it gives us a single audit point if we
//      later add rate-limiting, captcha, or analytics, and (b) it lets the
//      mobile app stick to the same `${API_BASE}/...` URL pattern for every
//      call. The mobile app *can* skip these and call Supabase directly via
//      the JS client; both work.
//
// The previous Replit OIDC routes (mobile-auth/start, mobile-auth/callback,
// mobile-auth/redeem-transfer, /login, /callback, /logout) have been removed.

import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase";
import { resolveSupabaseUser, getBearerToken } from "../lib/auth";

const router: IRouter = Router();

// Zod schema for the signup/signin bodies. Kept loose: we let Supabase enforce
// password strength via its own dashboard config (Auth → Policies).
const Credentials = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.get("/auth/user", async (req: Request, res: Response) => {
  // Backwards-compatible shape: `{ user: AuthUser | null }`.
  // The mobile app's `lib/auth.tsx` reads `data.user`.
  const jwt = getBearerToken(req);
  if (!jwt) {
    res.json({ user: null });
    return;
  }

  try {
    const user = await resolveSupabaseUser(jwt);
    res.json({ user: user ?? null });
  } catch (err) {
    req.log?.error({ err }, "GET /auth/user failed");
    res.status(500).json({ error: "Failed to load user" });
  }
});

router.post("/auth/sign-up", async (req: Request, res: Response) => {
  const parsed = Credentials.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Invalid email or password", details: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;
  const { data, error } = await supabaseAdmin.auth.signUp({ email, password });

  if (error) {
    // Supabase already returns a useful, user-safe message (e.g. "User already
    // registered") so we surface it directly. The status mapping is best-effort.
    res.status(error.status ?? 400).json({ error: error.message });
    return;
  }

  res.status(201).json({ user: data.user, session: data.session });
});

router.post("/auth/sign-in", async (req: Request, res: Response) => {
  const parsed = Credentials.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Invalid email or password", details: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    res.status(error.status ?? 401).json({ error: error.message });
    return;
  }

  res.json({ user: data.user, session: data.session });
});

router.post("/auth/sign-out", async (req: Request, res: Response) => {
  // Sign-out is mostly handled client-side by `supabase.auth.signOut()`, which
  // clears the local session. We still expose this endpoint so we have a place
  // to revoke server-side state if we ever add it (e.g. push-token cleanup).
  // For now it's a no-op that always returns 200.
  void req;
  res.status(200).json({ success: true });
});

export default router;
