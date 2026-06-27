/** Google ログインを許可するか判定 */
export function isEmailAllowedForSignIn(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  const allowAny =
    process.env.ALLOW_ANY_GOOGLE_USER === "true" ||
    process.env.ALLOW_ANY_GOOGLE_USER === "1";

  const allowedRaw = process.env.ALLOWED_EMAIL?.trim();
  if (allowAny || !allowedRaw) {
    return true;
  }

  const list = allowedRaw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (list.length === 0) return true;
  return list.includes(normalized);
}

export function isPublicMultiUserMode(): boolean {
  return (
    process.env.ALLOW_ANY_GOOGLE_USER === "true" ||
    process.env.ALLOW_ANY_GOOGLE_USER === "1" ||
    !process.env.ALLOWED_EMAIL?.trim()
  );
}
