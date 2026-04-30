// Auth helpers for the API server.
//
// Why this file exists:
// The mobile app authenticates with Supabase Auth and sends the resulting
// access token to this API in an `Authorization: Bearer <jwt>` header. This
// module centralizes:
//   1. Reading that bearer token off the request.
//   2. Calling Supabase to validate it and pull the corresponding user.
//   3. Linking the Supabase user to a row in our local `users` table — every
//      other table in this codebase has a `user_id` foreign key pointing at
//      `users.id`, so without a local row the rest of the API can't store any
//      data for that user.
//
// We deliberately keep this small and mechanical; the routing logic lives in
// `routes/auth.ts` and the per-request middleware lives in
// `middlewares/authMiddleware.ts`.

import { type Request } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import type { AuthUser } from "@workspace/api-zod";
import { supabaseAdmin } from "./supabase";

export const SESSION_COOKIE = "sid";

export function getBearerToken(req: Request): string | undefined {
  const authHeader = req.headers["authorization"];
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim() || undefined;
  }
  return undefined;
}

// Validate a Supabase JWT and resolve it to the matching row in our local
// `users` table. Returns null if the token is missing, invalid, or expired.
//
// We link Supabase users to local users by *email* rather than by Supabase's
// UUID because:
//   - The legacy users table already has a unique index on `email`, which means
//     any pre-existing rows from the Replit OIDC era can be re-attached to a
//     Supabase identity simply by signing up with the same email address.
//   - Storing the Supabase UUID in `replit_id` would conflict with rows that
//     still hold a real Replit subject there.
// If you ever need a stricter link (e.g. a user changes their email in
// Supabase), add a dedicated `supabase_id` column and migrate.
export async function resolveSupabaseUser(
  jwt: string,
): Promise<AuthUser | null> {
  const { data, error } = await supabaseAdmin.auth.getUser(jwt);
  if (error || !data?.user) return null;

  const supaUser = data.user;
  const email = supaUser.email ?? null;

  // Without an email we can't safely upsert: the legacy schema's only unique
  // identifier (besides the random UUID PK) is `email`. In practice every
  // email/password Supabase signup has an email — but guard anyway.
  if (!email) return null;

  const existing = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });

  if (existing) {
    return {
      id: existing.id,
      email: existing.email,
      firstName: existing.firstName,
      lastName: existing.lastName,
      profileImageUrl: existing.profileImageUrl,
    };
  }

  // First time we see this Supabase user — create the local row. We pull
  // optional profile fields from `user_metadata` if the signup form provided
  // them. Note: `user_metadata` is user-editable in Supabase, so we only ever
  // use it for *display* fields like names. Authorization decisions must never
  // rely on `user_metadata`.
  const meta = (supaUser.user_metadata ?? {}) as Record<string, unknown>;
  const [created] = await db
    .insert(usersTable)
    .values({
      email,
      firstName: typeof meta.first_name === "string" ? meta.first_name : null,
      lastName: typeof meta.last_name === "string" ? meta.last_name : null,
      profileImageUrl: null,
    })
    .returning();

  return {
    id: created.id,
    email: created.email,
    firstName: created.firstName,
    lastName: created.lastName,
    profileImageUrl: created.profileImageUrl,
  };
}
