import { CITIES, filterCities } from "@/lib/location-predictions";
import type { PredictionItem } from "@/components/PredictiveTextField";

export const RESUME_HEADLINES = [
  "Regional Branch Administrator",
  "Chartered Financial Analyst (CFA)",
  "Human Resources Manager",
  "HR Business Partner",
  "Talent Acquisition Specialist",
  "Operations Manager",
  "Business Analyst",
  "Financial Analyst",
  "Senior Financial Analyst",
  "Customer Service Team Leader",
  "Branch Manager",
  "Sales Manager",
  "Project Manager",
  "Software Engineer",
  "Senior Software Engineer",
  "Marketing Manager",
  "Accountant",
  "Accounts Officer",
  "Executive Assistant",
  "Administrative Manager",
  "Data Analyst",
  "Compliance Officer",
  "Risk Analyst",
  "Supply Chain Manager",
  "Graduate Candidate",
] as const;

export const RESUME_LANGUAGES = [
  "English",
  "Afrikaans",
  "Zulu",
  "Xhosa",
  "Setswana",
  "Sepedi",
  "Sesotho",
  "Tshivenda",
  "Xitsonga",
  "Ndebele",
  "Swati",
  "French",
  "Portuguese",
  "German",
  "Spanish",
  "Arabic",
  "Swahili",
  "Shona",
  "Yoruba",
  "Igbo",
  "Hindi",
  "Mandarin",
] as const;

export const RESUME_SKILLS = [
  "Financial Coordination",
  "Business Analysis and Strategy",
  "Customer Relationship Management",
  "Financial Reporting",
  "Risk Assessment and Management",
  "Data Analysis and Strategy",
  "Microsoft Office Suite",
  "Team Leadership",
  "Problem Solving",
  "Talent Acquisition",
  "Employee Relations",
  "Payroll Administration",
  "HR Policy Development",
  "Performance Management",
  "Recruitment and Selection",
  "Stakeholder Management",
  "Project Management",
  "Process Improvement",
  "Budget Management",
  "Compliance and Regulatory Awareness",
  "SQL",
  "Python Programming Proficiency",
  "Enterprise Resource Planning",
  "Exceptional Communication Skills",
  "Strong Analytical Skills",
] as const;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function filterList(pool: readonly string[], query: string, limit = 8) {
  const q = normalize(query);
  if (!q) return [...pool].slice(0, limit);
  const starts = pool.filter((item) => normalize(item).startsWith(q));
  const contains = pool.filter(
    (item) => !normalize(item).startsWith(q) && normalize(item).includes(q),
  );
  return [...starts, ...contains].slice(0, limit);
}

export function locationPredictions(query: string): PredictionItem[] {
  return filterCities(query, undefined, 8).map((item) => ({
    value: `${item.city}, ${item.country}`,
    label: item.city,
    hint: item.country,
  }));
}

export function headlinePredictions(query: string): PredictionItem[] {
  return filterList(RESUME_HEADLINES, query).map((item) => ({
    value: item,
    label: item,
  }));
}

export function languagePredictions(
  query: string,
  selected: string[] = [],
): PredictionItem[] {
  const selectedSet = new Set(selected.map(normalize));
  return filterList(RESUME_LANGUAGES, query, 10)
    .filter((item) => !selectedSet.has(normalize(item)))
    .slice(0, 8)
    .map((item) => ({ value: item, label: item }));
}

export function skillPredictions(
  query: string,
  selected: string[] = [],
): PredictionItem[] {
  const selectedSet = new Set(selected.map(normalize));
  return filterList(RESUME_SKILLS, query, 10)
    .filter((item) => !selectedSet.has(normalize(item)))
    .slice(0, 8)
    .map((item) => ({ value: item, label: item }));
}

export function linkedinPredictions(
  query: string,
  fullName = "",
): PredictionItem[] {
  const slug = fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const suggestions = [
    query.trim(),
    slug ? `https://www.linkedin.com/in/${slug}` : "",
    "https://www.linkedin.com/in/",
  ].filter(Boolean);

  const unique = [...new Set(suggestions)];
  const q = normalize(query);
  return unique
    .filter((item) => !q || normalize(item).includes(q) || item.endsWith("/"))
    .slice(0, 4)
    .map((item) => ({
      value: item,
      label: item,
      hint: item.includes(slug) && slug ? "From your name" : undefined,
    }));
}

export function jobLocationPredictions(query: string): PredictionItem[] {
  const fromCities = filterCities(query, undefined, 8).map((item) => ({
    value: `${item.city}, ${item.country}`,
    label: item.city,
    hint: item.country,
  }));

  if (query.trim()) return fromCities;

  return CITIES.slice(0, 8).map((item) => ({
    value: `${item.city}, ${item.country}`,
    label: item.city,
    hint: item.country,
  }));
}
