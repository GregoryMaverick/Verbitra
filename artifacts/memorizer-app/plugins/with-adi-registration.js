/**
 * Expo config plugin: writes `adi-registration.properties` into the
 * generated Android project's assets folder during prebuild.
 *
 * Why this exists:
 *   Google Play Console verifies that we own the `com.verbitra.app`
 *   package by asking us to upload a signed APK that contains a unique
 *   token at the path:
 *
 *     assets/adi-registration.properties   (inside the APK)
 *
 *   In an Expo *managed* project we don't keep an `android/` folder in
 *   the repo — Expo regenerates it on every build via prebuild. So we
 *   can't just drop the file in by hand; it would be deleted. This
 *   plugin hooks into the prebuild step and writes the file each time
 *   the native project is generated.
 *
 * After Google has verified ownership (one-time step), this plugin can
 * be left in place harmlessly or removed.
 *
 * Usage in app.json:
 *   "plugins": [
 *     ["./plugins/with-adi-registration.js", { "snippet": "<token>" }]
 *   ]
 */

const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

function withAdiRegistration(config, options) {
  const snippet = options && options.snippet;
  if (!snippet || typeof snippet !== "string") {
    throw new Error(
      "[with-adi-registration] Missing required `snippet` option. " +
        "Pass the token from Google Play Console's ADI verification screen.",
    );
  }

  // Google expects the *exact* snippet, with no extra whitespace.
  // We also add a trailing newline because some verification checks treat
  // this as a normal text file (it doesn't show in the Play UI, but it can
  // matter for byte-for-byte comparisons).
  const tokenFileContents = `${snippet.trim()}\n`;

  // `withDangerousMod` lets us touch the generated native project directly.
  // It runs after Expo has finished writing the standard android/ folder
  // but before the build proper begins, which is exactly when we need to
  // drop the file in.
  return withDangerousMod(config, [
    "android",
    async (cfg) => {
      const assetsDir = path.join(
        cfg.modRequest.platformProjectRoot, // e.g. /tmp/.../android
        "app",
        "src",
        "main",
        "assets",
      );

      fs.mkdirSync(assetsDir, { recursive: true });

      const filePath = path.join(assetsDir, "adi-registration.properties");
      fs.writeFileSync(filePath, tokenFileContents, "utf8");

      console.log(
        `[with-adi-registration] Wrote ${filePath} (${tokenFileContents.length} bytes)`,
      );

      return cfg;
    },
  ]);
}

module.exports = withAdiRegistration;
