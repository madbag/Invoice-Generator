export const getInitials = (
  person?: { firstName?: string; lastName?: string; email?: string } | null,
): string => {
  if (!person) return "U";
  const initials = `${person.firstName?.[0] || ""}${person.lastName?.[0] || ""}`;
  return (initials || person.email?.[0] || "U").toUpperCase();
};
