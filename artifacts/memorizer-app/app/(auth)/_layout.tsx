// Layout for the (auth) route group.
//
// Why this file exists:
// expo-router uses any file named `_layout.tsx` inside a folder as the
// wrapper around every screen in that folder. Here we host sign-in and
// sign-up under `(auth)/` so they share a single Stack with no header and
// the same dark background, and so the URL stays clean (the parens mean the
// segment name is not added to the URL — `/sign-in`, not `/auth/sign-in`).

import { Stack } from "expo-router";
import { T } from "@/constants/tokens";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: T.bg },
        animation: "slide_from_right",
      }}
    />
  );
}
