export function formatRand(amount: number) {
  return `R ${amount.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Stable SA date/time for SSR + client (avoids hydration mismatches). */
export function formatAdminDateTime(value: string | Date) {
  return new Date(value).toLocaleString("en-ZA", {
    timeZone: "Africa/Johannesburg",
  });
}
