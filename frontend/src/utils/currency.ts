const CURRENCY_LOCALES: Record<string, string> = {
  EUR: "de-DE",
  INR: "en-IN",
  USD: "en-US",
};

// No currency is assumed until the user picks one in their profile — with
// none selected yet, amounts show as a plain number rather than guessing a
// currency for them.
export const formatCurrency = (amount: number, currency?: string) => {
  const value = amount || 0;
  const locale = currency ? CURRENCY_LOCALES[currency] : undefined;

  if (!currency || !locale) {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return value.toLocaleString(locale, { style: "currency", currency });
};
