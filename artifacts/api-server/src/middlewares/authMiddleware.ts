// Per-request auth middleware.
//
// Why this file exists:
// Express runs this middleware on every API request. Its job is to look at the
// `Authorization: Bearer <jwt>` header (if present), validate the token with
// Supabase, and attach a `req.user` object plus an `req.isAuthenticated()`
// helper. Routes that *require* a logged-in user wrap themselves with the
// `requireAuth` middleware in `./auth.ts`; routes that are public-but-aware
// just check `req.isAuthenticated()`.
//
// This middleware is "best-effort": a missing or invalid token does NOT throw
// — it just leaves `req.user` undefined and lets the request continue. That
// matches the mobile app's beta posture where most endpoints are open and only
// some routes (sync, /texts, etc.) gate themselves with `requireAuth`.

import { type Request, type Response, type NextFunction } from "express";
import type { AuthUser } from "@workspace/api-zod";
import { getBearerToken, resolveSupabaseUser } from "../lib/auth";

declare global {
  namespace Express {
    interface User extends AuthUser {}

    interface Request {
      isAuthenticated(): this is AuthedRequest;
      user?: User | undefined;
    }

    export interface AuthedRequest {
      user: User;
    }
  }
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  // The helper is defined per-request so it always closes over the latest
  // `req.user`. (We can't put a single closure on the prototype because we
  // need TypeScript's `this is AuthedRequest` narrowing.)
  req.isAuthenticated = function (this: Request) {
    return this.user != null;
  } as Request["isAuthenticated"];

  const jwt = getBearerToken(req);
  if (!jwt) {
    next();
    return;
  }

  try {
    const user = await resolveSupabaseUser(jwt);
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // We deliberately swallow the error and continue unauthenticated. Throwing
    // here would 500 every request that has a stale token, which is far worse
    // UX than letting `requireAuth` 401 the user back to sign-in.
    req.log?.warn({ err }, "authMiddleware: Supabase user lookup failed");
  }

  next();
}
