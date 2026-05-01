// Server-side Supabase client.
//
// Why this file exists:
// The API server needs to validate JWTs that the mobile app receives from
// Supabase Auth, and (in the future) perform privileged user-management
// operations like force-signing a user out. Both of these require a client
// authenticated with the Supabase *service role* key. The service role bypasses
// Row Level Security, so it must NEVER be sent to the mobile app or any other
// public client. We read it from the server's environment only.
//
// All HTTP routes that need to verify a user's identity should call
// `supabase.auth.getUser(jwt)` from this client — that endpoint hits Supabase's
// auth server, which checks the JWT's signature against Supabase's keys for us
// (so we don't have to manage JWT secrets locally).

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set. " +
      "Find these in the Supabase dashboard under Project Settings → API. " +
      "The service role key is sensitive — keep it server-side only.",
  );
}

// We disable session persistence on the server because the server is stateless
// per-request: each call to `getUser(jwt)` is a one-shot validation. There is
// no "logged-in server" to keep tokens around for.
export const supabaseAdmin: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
