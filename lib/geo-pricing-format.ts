export type DisplayCurrency = {
  code: string;
  symbol: string;
  /** Multiply ZAR quote baseline by this to get local amount. */
  rateFromZar: number;
  locale: string;
  label: string;
};

export function convertFromZar(zarAmount: number, currency: DisplayCurrency) {
  const raw = zarAmount * currency.rateFromZar;
  if (currency.code === "ZAR" || currency.code === "NGN" || currency.code === "KES") {
    return Math.round(raw);
  }
  return Math.round(raw);
}

export function formatLocalizedAmount(
  zarAmount: number,
  currency: DisplayCurrency,
) {
  const amount = convertFromZar(zarAmount, currency);
  const formatted = amount.toLocaleString(currency.locale);
  return {
    amount,
    code: currency.code,
    formatted,
    display: `${currency.code} ${formatted}`,
  };
}
