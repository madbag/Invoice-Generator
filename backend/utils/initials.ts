export const getInitials = (person?: {
  firstName?: string;
  lastName?: string;
  email?: string;
} | null): string => {
  if (!person) return "U";
  return person.firstName && person.lastName
    ? `${person.firstName[0]}${person.lastName[0]}`.toUpperCase()
    : person.email?.[0]?.toUpperCase() || "U";
};
