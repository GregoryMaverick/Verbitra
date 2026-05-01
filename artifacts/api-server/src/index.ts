import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Ensure we load the API server's own `.env` file even when the process is
// started from the monorepo root (e.g. `pnpm --filter @workspace/api-server ...`).
//
// Using import.meta.url makes this resilient after bundling to `dist/`.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// IMPORTANT (ESM nuance):
// Static imports are evaluated before this module's body runs, so any module
// that reads `process.env` at import time would see *unset* variables if we
// used `import app from "./app"` here.
//
// We dynamic-import after loading dotenv so env-dependent modules initialize
// with the correct values.
const [{ default: app }, { logger }, { runMigrations }] = await Promise.all([
  import("./app"),
  import("./lib/logger"),
  import("./lib/migrate"),
]);

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

if (process.env.NODE_ENV === "production" && !process.env.API_PUBLIC_URL) {
  logger.warn(
    "API_PUBLIC_URL is not set in production. Magic-link verification URLs may point to the wrong " +
    "origin. Set API_PUBLIC_URL to the base URL of this API server (e.g. https://api.memorizer.app).",
  );
}

runMigrations()
  .then(() => {
    // Bind explicitly to IPv4 so mobile devices on the LAN can reach the server
    // via your machine's LAN IP (e.g. 192.168.x.x). On some systems, omitting
    // the host can result in an IPv6-only listener.
    app.listen(port, "0.0.0.0", (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }

      logger.info({ port }, "Server listening");
    });
  })
  .catch((err) => {
    logger.error({ err }, "Failed to run migrations");
    process.exit(1);
  });
