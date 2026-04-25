// Maps backend / auth errors to safe, user-friendly messages.
// Always log the raw error to the console for debugging; never surface it directly.

export function friendlyAuthError(err: unknown, fallback = "Something went wrong. Please try again."): string {
  // Log internally for debugging; never shown to users.
  // eslint-disable-next-line no-console
  console.error(err);

  const raw = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  const msg = raw.toLowerCase();

  if (!msg) return fallback;

  if (msg.includes("invalid login credentials") || msg.includes("invalid_credentials")) {
    return "Sign-in failed. Please request a new code and try again.";
  }
  if (msg.includes("rate limit") || msg.includes("too many")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (msg.includes("network") || msg.includes("failed to fetch")) {
    return "Network error. Please check your connection and try again.";
  }
  if (msg.includes("user already") || msg.includes("already registered")) {
    return "This account already exists. Please sign in instead.";
  }
  if (msg.includes("duplicate key") || msg.includes("unique constraint")) {
    return "This information is already on file.";
  }
  if (msg.includes("permission denied") || msg.includes("row-level security")) {
    return "You don't have permission to do that.";
  }
  return fallback;
}
