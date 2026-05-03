// Server-side Supabase client.
//
// Why this file exists:
// The API server needs to validate JWTs that the mobile app receives from
// Supabase Auth. Supabase's `auth.getUser(jwt)` needs a project API key for the
// same Supabase project that issued the token. A service-role key works, but an
// anon/publishable key is enough for token validation and email/password auth.
//
// All HTTP routes that need to verify a user's identity should call
// `supabase.auth.getUser(jwt)` from this client — that endpoint hits Supabase's
// auth server, which checks the JWT's signature against Supabase's keys for us
// (so we don't have to manage JWT secrets locally).

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_AUTH_KEY =
  process.env.SUPABASE_AUTH_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_AUTH_KEY) {
  throw new Error(
    "SUPABASE_URL and a Supabase API key must be set. " +
      "Find these in the Supabase dashboard under Project Settings → API. " +
      "Use SUPABASE_AUTH_KEY or SUPABASE_ANON_KEY for token validation; if you use " +
      "SUPABASE_SERVICE_ROLE_KEY, keep it server-side only.",
  );
}

const supabaseUrl = SUPABASE_URL;
const supabaseAuthKey = SUPABASE_AUTH_KEY;

export function getConfiguredSupabaseProjectRef(): string | null {
  try {
    return new URL(supabaseUrl).hostname.split(".")[0] ?? null;
  } catch {
    return null;
  }
}

// We disable session persistence on the server because the server is stateless
// per-request: each call to `getUser(jwt)` is a one-shot validation. There is
// no "logged-in server" to keep tokens around for.
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAuthKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
