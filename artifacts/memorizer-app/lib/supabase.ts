// Mobile Supabase client.
//
// Why this file exists:
// The app uses Supabase Auth for email + password sign-in. supabase-js needs
// somewhere to persist the user's session (access token + refresh token) so
// that closing and reopening the app doesn't sign the user out, and so that
// the SDK can silently refresh tokens before they expire.
//
// Why AsyncStorage and NOT expo-secure-store:
// supabase-js reads and writes the session many times per app lifecycle
// (every refresh, every getSession() call). expo-secure-store on iOS goes
// through the Keychain, which is intentionally slow and synchronous-ish, and
// it has a per-value size limit (~2KB on Android Keystore for older devices)
// that the Supabase session JSON occasionally bumps into. AsyncStorage is the
// pattern Supabase officially recommends for React Native, and the access
// tokens it holds are already short-lived (one hour by default) — so the
// security trade-off is mild. If you ever want defense-in-depth here, look at
// `@supabase/auth-js` `storage` option with a custom encrypted-storage adapter.

import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // We log loudly rather than throwing so the app still boots in environments
  // where auth isn't configured yet (e.g. a fresh checkout). Calls into the
  // client will simply fail at request time.
  console.error(
    "[Supabase] EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are required. " +
      "Add them to .env.local locally and to EAS env vars for builds. " +
      "Get the values from the Supabase dashboard → Project Settings → API.",
  );
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl ?? "",
  supabaseAnonKey ?? "",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // We are NOT a web app — there is no URL fragment containing a session
      // for the SDK to detect. Setting this to false avoids a warning and a
      // pointless `window.location` poke on web builds.
      detectSessionInUrl: false,
    },
  },
);
