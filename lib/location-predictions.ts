/** Curated location suggestions for checkout — no external Places API required. */

export const COUNTRIES = [
  "South Africa",
  "Nigeria",
  "Kenya",
  "Ghana",
  "Zimbabwe",
  "Botswana",
  "Namibia",
  "Zambia",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "Ethiopia",
  "Egypt",
  "Morocco",
  "Mauritius",
  "Mozambique",
  "Malawi",
  "Lesotho",
  "Eswatini",
  "Cameroon",
  "Ivory Coast",
  "Senegal",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "New Zealand",
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Germany",
  "Netherlands",
  "Ireland",
  "France",
  "India",
  "Singapore",
  "China",
  "Japan",
  "Brazil",
] as const;

export type CityPrediction = {
  city: string;
  country: string;
};

export const CITIES: CityPrediction[] = [
  // South Africa
  { city: "Johannesburg", country: "South Africa" },
  { city: "Pretoria", country: "South Africa" },
  { city: "Cape Town", country: "South Africa" },
  { city: "Durban", country: "South Africa" },
  { city: "Sandton", country: "South Africa" },
  { city: "Midrand", country: "South Africa" },
  { city: "Centurion", country: "South Africa" },
  { city: "Boksburg", country: "South Africa" },
  { city: "Benoni", country: "South Africa" },
  { city: "Germiston", country: "South Africa" },
  { city: "Roodepoort", country: "South Africa" },
  { city: "Soweto", country: "South Africa" },
  { city: "Port Elizabeth", country: "South Africa" },
  { city: "Gqeberha", country: "South Africa" },
  { city: "Bloemfontein", country: "South Africa" },
  { city: "East London", country: "South Africa" },
  { city: "Pietermaritzburg", country: "South Africa" },
  { city: "Polokwane", country: "South Africa" },
  { city: "Nelspruit", country: "South Africa" },
  { city: "Mbombela", country: "South Africa" },
  { city: "Kimberley", country: "South Africa" },
  { city: "Rustenburg", country: "South Africa" },
  { city: "Stellenbosch", country: "South Africa" },
  // Nigeria
  { city: "Lagos", country: "Nigeria" },
  { city: "Abuja", country: "Nigeria" },
  { city: "Port Harcourt", country: "Nigeria" },
  { city: "Ibadan", country: "Nigeria" },
  { city: "Kano", country: "Nigeria" },
  // Kenya
  { city: "Nairobi", country: "Kenya" },
  { city: "Mombasa", country: "Kenya" },
  { city: "Kisumu", country: "Kenya" },
  // Ghana
  { city: "Accra", country: "Ghana" },
  { city: "Kumasi", country: "Ghana" },
  // Zimbabwe
  { city: "Harare", country: "Zimbabwe" },
  { city: "Bulawayo", country: "Zimbabwe" },
  // Botswana / Namibia / Zambia
  { city: "Gaborone", country: "Botswana" },
  { city: "Windhoek", country: "Namibia" },
  { city: "Lusaka", country: "Zambia" },
  { city: "Ndola", country: "Zambia" },
  // East Africa
  { city: "Kampala", country: "Uganda" },
  { city: "Dar es Salaam", country: "Tanzania" },
  { city: "Kigali", country: "Rwanda" },
  { city: "Addis Ababa", country: "Ethiopia" },
  // North Africa
  { city: "Cairo", country: "Egypt" },
  { city: "Casablanca", country: "Morocco" },
  { city: "Port Louis", country: "Mauritius" },
  { city: "Maputo", country: "Mozambique" },
  { city: "Lilongwe", country: "Malawi" },
  { city: "Maseru", country: "Lesotho" },
  { city: "Mbabane", country: "Eswatini" },
  // International hubs
  { city: "London", country: "United Kingdom" },
  { city: "Manchester", country: "United Kingdom" },
  { city: "Birmingham", country: "United Kingdom" },
  { city: "New York", country: "United States" },
  { city: "Los Angeles", country: "United States" },
  { city: "Houston", country: "United States" },
  { city: "Toronto", country: "Canada" },
  { city: "Vancouver", country: "Canada" },
  { city: "Sydney", country: "Australia" },
  { city: "Melbourne", country: "Australia" },
  { city: "Auckland", country: "New Zealand" },
  { city: "Dubai", country: "United Arab Emirates" },
  { city: "Abu Dhabi", country: "United Arab Emirates" },
  { city: "Riyadh", country: "Saudi Arabia" },
  { city: "Doha", country: "Qatar" },
  { city: "Berlin", country: "Germany" },
  { city: "Amsterdam", country: "Netherlands" },
  { city: "Dublin", country: "Ireland" },
  { city: "Paris", country: "France" },
  { city: "Mumbai", country: "India" },
  { city: "Bangalore", country: "India" },
  { city: "Singapore", country: "Singapore" },
  { city: "Shanghai", country: "China" },
  { city: "Tokyo", country: "Japan" },
  { city: "São Paulo", country: "Brazil" },
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function filterCountries(query: string, limit = 8): string[] {
  const q = normalize(query);
  if (!q) return [...COUNTRIES].slice(0, limit);
  const starts = COUNTRIES.filter((c) => normalize(c).startsWith(q));
  const contains = COUNTRIES.filter(
    (c) => !normalize(c).startsWith(q) && normalize(c).includes(q),
  );
  return [...starts, ...contains].slice(0, limit);
}

export function filterCities(
  query: string,
  preferredCountry?: string,
  limit = 8,
): CityPrediction[] {
  const q = normalize(query);
  const preferred = preferredCountry?.trim();

  let pool = CITIES;
  if (preferred) {
    const inCountry = CITIES.filter(
      (c) => normalize(c.country) === normalize(preferred),
    );
    const rest = CITIES.filter(
      (c) => normalize(c.country) !== normalize(preferred),
    );
    pool = [...inCountry, ...rest];
  }

  if (!q) {
    return pool.slice(0, limit);
  }

  const starts = pool.filter((c) => normalize(c.city).startsWith(q));
  const contains = pool.filter(
    (c) =>
      !normalize(c.city).startsWith(q) &&
      (normalize(c.city).includes(q) || normalize(c.country).includes(q)),
  );
  return [...starts, ...contains].slice(0, limit);
}
