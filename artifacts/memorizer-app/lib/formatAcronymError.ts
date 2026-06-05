/** Title shown on the acronym-builder error card. */
export const ACRONYM_ERROR_TITLE = "Couldn't load your acronym";

export function formatAcronymServerError(): string {
  return "We couldn't create your acronym. Tap to try again.";
}

export function formatAcronymTimeoutError(): string {
  return "This is taking longer than expected. Tap to try again.";
}

export function formatAcronymNotFoundError(): string {
  return "No acronym found for this text.";
}

export function formatAcronymSessionError(): string {
  return "Your session expired. Go back and try again.";
}

export function formatAcronymGenericError(): string {
  return formatAcronymServerError();
}

export function formatAcronymSkipHint(): string {
  return 'You can tap "Got it!" below to continue without it.';
}

/** Maps fetch / network errors to user-facing copy for the acronym-builder activity. */
export function formatAcronymFetchError(err: unknown): string {
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
    return formatAcronymSessionError();
  }

  if (normalized.includes("404") || normalized.includes("not found")) {
    return formatAcronymNotFoundError();
  }

  if (normalized.includes("ordered-list")) {
    return "Acronyms are only available for ordered lists.";
  }

  return "Couldn't reach the server. Check your connection and tap to try again.";
}
