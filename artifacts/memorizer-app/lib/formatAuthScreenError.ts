/** Maps thrown auth / network errors to copy for sign-in and sign-up screens. */
export function formatAuthScreenError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const normalized = msg.toLowerCase();

  if (normalized.includes("invalid api key")) {
    return (
      "Sign-in is misconfigured (Supabase rejected the API key).\n\n" +
      "Fix: set the correct EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY for this build " +
      "(EAS → your project's Environment variables), then rebuild the app."
    );
  }

  return msg || "Something went wrong. Try again.";
}
