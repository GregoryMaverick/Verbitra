import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Hostname of the machine running Metro (same machine as api-server in local dev).
 * `@expo/cli` sets `expoConfig.hostUri` (e.g. `192.168.1.5:8081`) so devices can reach the packager.
 */
function getMetroBundlerHostname(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri && typeof hostUri === "string") {
    const host = hostUri.split(":")[0]?.trim();
    if (host) return host;
  }

  const go = Constants.expoGoConfig as { debuggerHost?: string } | null;
  if (go?.debuggerHost && typeof go.debuggerHost === "string") {
    return go.debuggerHost.split(":")[0]?.trim() ?? null;
  }

  const legacy = (Constants.manifest as { debuggerHost?: string } | null | undefined)?.debuggerHost;
  if (legacy && typeof legacy === "string") {
    return legacy.split(":")[0]?.trim() ?? null;
  }

  return null;
}

/** True when Metro's host is something we can safely swap in for `localhost` (your LAN machine). */
function isLanStyleDevHost(host: string): boolean {
  if (host === "10.0.2.2") return true; // Android emulator → host loopback
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
  if (host.endsWith(".local")) return true;
  // Tunnel hostnames point at Expo's proxy, not your machine's API port — do not rewrite.
  if (/exp\.direct|ngrok/i.test(host)) return false;
  return false;
}

/**
 * On a physical device, `http://localhost:4000` is the phone itself, not your Mac.
 * In dev on native, rewrite localhost / 127.0.0.1 to the Metro LAN host (e.g. 192.168.x.x
 * or 10.0.2.2) so api-server on the dev machine is reachable. Web and production unchanged.
 */
function rewriteLocalhostForNativeDev(url: string): string {
  if (Platform.OS === "web" || !__DEV__) return url;

  const lan = getMetroBundlerHostname();
  if (!lan || lan === "localhost" || lan === "127.0.0.1" || !isLanStyleDevHost(lan)) return url;

  let out = url.replace(/(^https?:\/\/)localhost(?=:|\/)/i, `$1${lan}`);
  out = out.replace(/(^https?:\/\/)127\.0\.0\.1(?=:|\/)/i, `$1${lan}`);
  return out;
}

/** Raw `EXPO_PUBLIC_API_BASE_URL` with dev-only localhost → LAN host rewrite. */
export function getResolvedExpoPublicApiBase(): string {
  const raw = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ?? "";
  if (!raw) return "";
  return rewriteLocalhostForNativeDev(raw);
}
