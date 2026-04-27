# Verbitra — Android Build Guide

This guide walks you through producing a distributable Android APK (for sideloading/testing) or AAB (for Play Store submission) using Expo Application Services (EAS).

---

## Prerequisites

1. **Expo account** — Sign up at https://expo.dev if you don't have one.
2. **EAS CLI** — Install globally:
   ```bash
   npm install -g eas-cli
   ```
3. **Log in to EAS:**
   ```bash
   eas login
   ```
4. **Link this project** (first time only, from the `artifacts/memorizer-app` directory):
   ```bash
   eas init
   ```
   This will write the `extra.eas.projectId` into `app.json`.

---

## Step 1 — Set EAS Secrets

`eas.json` declares `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` in each build profile with placeholder values. **EAS secrets override these placeholders at build time**, so you must create matching secrets before triggering a build.

Add secrets in the EAS dashboard:

**https://expo.dev/accounts/[your-account]/projects/verbitra/secrets**

| Secret name | Value |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Full HTTPS URL of your deployed API, e.g. `https://api.verbitra.app/api` |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | Your RevenueCat Android public API key (found in the RevenueCat dashboard under your Android app) |

Or via the EAS CLI (from `artifacts/memorizer-app`):

```bash
eas secret:create --scope project --name EXPO_PUBLIC_API_BASE_URL --value "https://api.verbitra.app/api"
eas secret:create --scope project --name EXPO_PUBLIC_REVENUECAT_ANDROID_KEY --value "your_revenuecat_android_key"
```

> **Important:** `EXPO_PUBLIC_API_BASE_URL` must be a publicly accessible HTTPS URL. A Replit dev-domain URL will not work in production builds — the build environment cannot reach the Replit dev server.

---

## Step 2 — Build an APK (sideloading / internal testing)

From the `artifacts/memorizer-app` directory:

```bash
eas build --platform android --profile production
```

This produces an `.apk` file. Download it from the EAS dashboard and install it directly on any Android device (enable "Install unknown apps" in device settings first).

---

## Step 3 — Build an AAB (Google Play Store submission)

```bash
eas build --platform android --profile store
```

This produces an `.aab` (Android App Bundle) ready for upload to the Google Play Console.

---

## Build Profiles Summary

| Profile | Output | Purpose |
|---|---|---|
| `production` | APK | Sideloading, internal testing, Firebase App Distribution |
| `store` | AAB | Google Play Store submission |

---

## Notes

- **Package name:** `com.verbitra.app` (set in `app.json`)
- **Version code:** `1` — increment `app.json → android.versionCode` for each new Play Store release, then rebuild
- **RevenueCat:** The app reads `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` at runtime on Android and `EXPO_PUBLIC_REVENUECAT_IOS_KEY` on iOS. Add them as separate EAS secrets
- **Missing API URL:** If `EXPO_PUBLIC_API_BASE_URL` is absent or the placeholder is not overridden by a secret, the app logs a `console.error` on startup and all API calls will fail
- **iOS builds:** iOS configuration is out of scope for this guide — it requires an Apple Developer account, certificates, and provisioning profiles

### Expo Go tunnel reliability note (local development)

If Expo tunnel startup fails with messages like:

- `failed to start tunnel`
- `remote gone away`
- `Cannot read properties of undefined (reading 'body')`

start the app with:

```bash
pnpm run dev:tunnel
```

This script uses a known-good local workaround:

- Node 24 runtime for Expo CLI
- `EXPO_FORCE_WEBCONTAINER_ENV=1` to avoid unstable ngrok behavior in this environment
