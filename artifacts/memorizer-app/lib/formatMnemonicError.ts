/** Title shown on the mnemonic screen error card. */
export const MNEMONIC_ERROR_TITLE = "Couldn't load your memory device";

export function formatMnemonicServerError(): string {
  return "We couldn't create your memory device. Tap to try again.";
}

export function formatMnemonicTimeoutError(): string {
  return "This is taking longer than expected. Tap to try again.";
}

export function formatMnemonicNotFoundError(): string {
  return "No memory device found for this text.";
}

export function formatMnemonicGenericError(): string {
  return formatMnemonicServerError();
}

/** Maps fetch / network errors to user-facing copy for the mnemonic screen. */
export function formatMnemonicFetchError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const normalized = msg.toLowerCase();

  if (normalized.includes("api base url not configured")) {
    return "This build isn't connected to the server. Try updating the app or contact support.";
  }

  if (
    normalized.includes("401") ||
    normalized.includes("unauthorized") ||
    normalized.includes("403") ||
    normalized.includes("forbidden")
  ) {
    return "Your session expired. Go back and try again.";
  }

  if (normalized.includes("404") || normalized.includes("not found")) {
    return formatMnemonicNotFoundError();
  }

  return "Couldn't reach the server. Check your connection and tap to try again.";
}
