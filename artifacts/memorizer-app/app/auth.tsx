// Backwards-compatible redirect from `/auth` to the new sign-in screen.
//
// Why this file exists:
// Several places in the app (settings, the AuthGate, deep links) push to
// `/auth`. Rather than chase down every caller, we keep this stub and
// redirect to the new `(auth)/sign-in` route. The `required` query param is
// preserved so the new sign-in screen can decide whether to show its
// dismiss button.

import { Redirect, useLocalSearchParams } from "expo-router";

export default function AuthRedirect() {
  const params = useLocalSearchParams<{ required?: string }>();
  const href = params.required === "1"
    ? "/(auth)/sign-in?required=1"
    : "/(auth)/sign-in";
  return <Redirect href={href as never} />;
}
