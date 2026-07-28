import { headers } from "next/headers";

export type DisplayCurrency = {
  code: string;
  symbol: string;
  /** Multiply ZAR quote baseline by this to get local amount. */
  rateFromZar: number;
  locale: string;
  label: string;
};

const CURRENCIES: Record<string, DisplayCurrency> = {
  ZAR: {
    code: "ZAR",
    symbol: "R",
    rateFromZar: 1,
    locale: "en-ZA",
    label: "South African Rand",
  },
  USD: {
    code: "USD",
    symbol: "$",
    rateFromZar: 0.055,
    locale: "en-US",
    label: "US Dollar",
  },
  CAD: {
    code: "CAD",
    symbol: "C$",
    rateFromZar: 0.075,
    locale: "en-CA",
    label: "Canadian Dollar",
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    rateFromZar: 0.043,
    locale: "en-GB",
    label: "British Pound",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    rateFromZar: 0.051,
    locale: "en-IE",
    label: "Euro",
  },
  AUD: {
    code: "AUD",
    symbol: "A$",
    rateFromZar: 0.084,
    locale: "en-AU",
    label: "Australian Dollar",
  },
  NGN: {
    code: "NGN",
    symbol: "₦",
    rateFromZar: 85,
    locale: "en-NG",
    label: "Nigerian Naira",
  },
  KES: {
    code: "KES",
    symbol: "KSh",
    rateFromZar: 7.1,
    locale: "en-KE",
    label: "Kenyan Shilling",
  },
  GHS: {
    code: "GHS",
    symbol: "GH₵",
    rateFromZar: 0.85,
    locale: "en-GH",
    label: "Ghanaian Cedi",
  },
};

/** ISO country → preferred display currency. */
const COUNTRY_CURRENCY: Record<string, keyof typeof CURRENCIES> = {
  ZA: "ZAR",
  NA: "ZAR",
  BW: "ZAR",
  LS: "ZAR",
  SZ: "ZAR",
  US: "USD",
  CA: "CAD",
  GB: "GBP",
  IE: "EUR",
  DE: "EUR",
  FR: "EUR",
  NL: "EUR",
  BE: "EUR",
  ES: "EUR",
  IT: "EUR",
  PT: "EUR",
  AT: "EUR",
  FI: "EUR",
  AU: "AUD",
  NZ: "AUD",
  NG: "NGN",
  KE: "KES",
  GH: "GHS",
  // Broader Africa defaults to ZAR quote baseline
  ZW: "ZAR",
  MZ: "ZAR",
  ZM: "ZAR",
  MW: "ZAR",
  TZ: "ZAR",
  UG: "ZAR",
  RW: "ZAR",
  ET: "ZAR",
  EG: "USD",
  MA: "EUR",
  AE: "USD",
  SA: "USD",
  IN: "USD",
  PK: "USD",
  BD: "USD",
  PH: "USD",
  SG: "USD",
  MY: "USD",
  HK: "USD",
  JP: "USD",
  KR: "USD",
  CN: "USD",
  BR: "USD",
  MX: "USD",
};

export type GeoPricing = {
  country: string;
  currency: DisplayCurrency;
  /** Approximate conversion note for UI. */
  isConverted: boolean;
};

function currencyForCountry(country: string): DisplayCurrency {
  const code = COUNTRY_CURRENCY[country] || "USD";
  return CURRENCIES[code] || CURRENCIES.USD;
}

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

export async function getRequestCountry(): Promise<string> {
  const h = await headers();
  const fromHeader =
    h.get("x-vercel-ip-country") ||
    h.get("cf-ipcountry") ||
    h.get("x-country-code") ||
    h.get("x-geo-country");

  if (fromHeader && /^[a-zA-Z]{2}$/.test(fromHeader.trim())) {
    return fromHeader.trim().toUpperCase();
  }

  // Local / unknown — default to South Africa (home market)
  return "ZA";
}

export async function getGeoPricing(): Promise<GeoPricing> {
  const country = await getRequestCountry();
  const currency = currencyForCountry(country);
  return {
    country,
    currency,
    isConverted: currency.code !== "ZAR",
  };
}
