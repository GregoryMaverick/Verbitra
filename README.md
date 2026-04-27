# Verbitra

Verbitra is an Expo React Native mobile app with a Node/Express API and shared TypeScript packages. This repository has been migrated away from Replit-specific runtime configuration so it can run locally, deploy to a normal host, and build Android releases with EAS.

## Quick Reference 

### Deployed production URLs
- **API**: `https://verbitra-api.onrender.com`
- **Landing**: `https://verbitra-landing.onrender.com`

### “Key decisions” we made
- **Database**: Supabase Postgres is the source of truth (Render Postgres is a leftover and can be deleted once you confirm `verbitra-api` uses Supabase `DATABASE_URL`).
- **Beta auth**: Sign-in is **not required** for beta; Replit OIDC code is still present server-side as a **follow-up** to replace before a full public launch.
- **EAS config**: The app reads the API URL from `EXPO_PUBLIC_API_BASE_URL` (must include the `/api` suffix).

### Most common commands
- **Install**: `corepack enable && pnpm install`
- **Run API**: `pnpm --filter @workspace/api-server run dev`
- **Run mobile (Expo)**: `pnpm --filter @workspace/memorizer-app run dev`
- **Run landing**: `pnpm --filter @workspace/landing run dev`
- **Build Android AAB (Play Store)**:
  - `cd artifacts/memorizer-app && eas build --platform android --profile store`

## Prerequisites

- Node.js 24.x
- pnpm 10.x through Corepack
- Docker, for local Postgres
- Expo and EAS access for Android builds

## Local Setup

```bash
corepack enable
pnpm install
docker compose up -d postgres
```

Create local env files from the committed examples:

```bash
cp artifacts/api-server/.env.example artifacts/api-server/.env
cp artifacts/memorizer-app/.env.example artifacts/memorizer-app/.env.local
```

Set real values in those local files. Do not commit `.env` or `.env.local`; they are ignored on purpose.

## Run The API

The API reads `artifacts/api-server/.env` through `dotenv`.

```bash
pnpm --filter @workspace/api-server run dev
```

The local Postgres connection in the example env file matches `docker-compose.yml`:

```env
DATABASE_URL=postgres://verbitra:verbitra@localhost:5432/verbitra
```

The server runs startup migrations automatically. If you change Drizzle schema files, run:

```bash
pnpm --filter @workspace/db push
```

## Run The Mobile App

Set this in `artifacts/memorizer-app/.env.local`:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

Then start Expo:

```bash
pnpm --filter @workspace/memorizer-app run dev
```

### Expo Go (iPhone) — how to open the app
- **Install**: Expo Go from the App Store
- **Start Expo**: run the command above
- **Open on iPhone**:
  - If you see a **QR code** in your terminal: scan with the iPhone Camera → opens Expo Go
  - If you don’t see a QR code on your Wi‑Fi: start Expo with tunnel mode:

```bash
cd artifacts/memorizer-app
pnpm exec expo start --tunnel --clear --go
```

For physical Android testing, your phone must be able to reach the API host. If `localhost` does not work from the device, use your computer's LAN IP in `EXPO_PUBLIC_API_BASE_URL`.

## Android And Play Store Builds

The production Android config lives in `artifacts/memorizer-app/app.json` and `artifacts/memorizer-app/eas.json`.

Before building, set these EAS project secrets:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_API_BASE_URL --value "https://api.yourdomain.app/api"
eas secret:create --scope project --name EXPO_PUBLIC_REVENUECAT_ANDROID_KEY --value "goog_your_revenuecat_key"
```

If you’re using the Render API, set:
- `EXPO_PUBLIC_API_BASE_URL=https://verbitra-api.onrender.com/api`

Build an APK for testing:

```bash
cd artifacts/memorizer-app
eas build --platform android --profile production
```

Build an AAB for the Play Store:

```bash
cd artifacts/memorizer-app
eas build --platform android --profile store
```

Increment `expo.android.versionCode` in `artifacts/memorizer-app/app.json` for every Play Store upload.

## Important Production Blocker

The Replit runtime has been removed, but auth replacement is intentionally deferred. The current login code still defaults to Replit OIDC in `artifacts/api-server/src/lib/auth.ts` and `artifacts/api-server/src/routes/auth.ts`.

Before a real Play Store launch, replace that auth flow. For a cheap indie-friendly path, finish the existing magic-link foundation and use an email sender such as Resend, Postmark, or SMTP.

## Optional Web Artifacts

The retained Vite artifacts now use normal local defaults:

- `@workspace/landing` on port `5173`
- `@workspace/product-spec` on port `5174`
- `@workspace/pitch-deck` on port `5175`
- `@workspace/competitive-analysis` on port `5176`
- `@workspace/mockup-sandbox` on port `5177`

Run any of them with:

```bash
pnpm --filter @workspace/landing run dev
```
