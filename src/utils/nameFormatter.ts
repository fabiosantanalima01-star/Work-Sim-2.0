/**
 * Formats a full name for badge display:
 * Keeps first two names fully, and uses only initials for subsequent names.
 * Example: "Ana Silva Santos Oliveira" -> "Ana Silva S. O."
 */
export const formatBadgeName = (fullName: string) => {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 2) return parts.join(" ");
  const firstTwo = parts.slice(0, 2).join(" ");
  const initials = parts.slice(2).map(p => p[0] ? p[0].toUpperCase() + "." : "").filter(Boolean).join(" ");
  return `${firstTwo} ${initials}`;
};
