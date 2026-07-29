export type CvColorOption = {
  id: string;
  label: string;
  hex: string;
};

export type CareerPackage = {
  slug: string;
  name: string;
  subtitle?: string;
  tagline: string;
  summary: string;
  priceLabel: string;
  includes: string[];
  idealFor: string;
  timeline: string;
  region?: string;
  colorOptions?: CvColorOption[];
  sampleImage?: string;
  /** Quote baseline used for admin/order totals (ZAR). */
  quoteAmount: number;
  /** When false, hidden from the public site but kept in admin. */
  active?: boolean;
};

export const defaultPackages: CareerPackage[] = [
  {
    slug: "graduate-package",
    name: "Fresh Graduate — Package",
    subtitle: "Fresh Graduate — Package",
    tagline: "ATS-friendly CV writing for Africa — start your career strong.",
    summary:
      "Our Fresh Graduate Package is designed for graduates and early-career candidates applying across Africa. You get expert ATS-friendly CV writing, a job application email template, and LinkedIn optimisation — with a 10 working day turnaround (Africa only).",
    priceLabel: "Request a quote",
    includes: [
      "Expert ATS-FRIENDLY CV writing optimized",
      "Job Application Email Template",
      "LinkedIn optimization",
    ],
    idealFor:
      "Fresh graduates and early-career candidates seeking roles within Africa.",
    timeline: "10 working days (ONLY AFRICA)",
    region: undefined,
    quoteAmount: 1200,
    active: true,
    colorOptions: [
      { id: "teal", label: "Teal", hex: "#0d9488" },
      { id: "dark-green", label: "Dark green", hex: "#14532d" },
      { id: "blue", label: "Blue", hex: "#1e3a5f" },
    ],
  },
  {
    slug: "professional-package",
    name: "Professional Package",
    subtitle: "Professional — Package",
    tagline: "ATS-friendly CV writing for working professionals across Africa.",
    summary:
      "Our Professional Package is built for experienced candidates applying within Africa. You get expert ATS-friendly CV writing and design, LinkedIn optimisation, job application email templates, free career hunt techniques, and your email and CV added to our recruiters database.",
    priceLabel: "Request a quote",
    includes: [
      "Expert ATS-FRIENDLY CV writing",
      "Adding your email and CV into Recruiters Database",
      "Job Application Email Template",
      "Free Career Hunt Techniques",
      "LinkedIn Optimization",
      "CV Design",
    ],
    idealFor:
      "Working professionals seeking stronger roles within Africa with recruiter-backed CV support.",
    timeline: "7 working days (ONLY AFRICA)",
    region: undefined,
    quoteAmount: 1800,
    active: true,
    colorOptions: [
      { id: "teal", label: "Teal", hex: "#0d9488" },
      { id: "blue", label: "Blue", hex: "#1a4b8c" },
      { id: "navy", label: "Navy", hex: "#0a2540" },
      { id: "dark-grey", label: "Dark grey", hex: "#3a3f47" },
    ],
  },
  {
    slug: "executive-package",
    name: "Executive Package",
    subtitle: "Executive — Package",
    tagline: "Senior ATS-friendly CV writing for executives across Africa.",
    summary:
      "Our Executive Package is built for senior leaders applying within Africa. You get expert ATS-friendly CV and cover letter writing, LinkedIn optimisation, recruiter outreach support, interview preparation, salary negotiation tools, and free help with job placements — with a 5 working day turnaround.",
    priceLabel: "Request a quote",
    includes: [
      "Turn around time 5 working days (ONLY AFRICA)",
      "Expert ATS-FRIENDLY CV writing",
      "Adding your email and CV into Recruiters Database",
      "Job Application Email Template",
      "Free Career Hunt Techniques",
      "Free salary negotiation Template",
      "Free help with job placements",
      "Submitting your CV and cover letter to potential Recruiters and hiring managers",
      "Interview preparation",
      "Cover letter writing",
      "LinkedIn Optimisation",
    ],
    idealFor:
      "Senior professionals, managers, and executives competing for high-stakes roles within Africa.",
    timeline: "5 working days",
    region: "Africa only",
    quoteAmount: 2500,
    active: true,
    colorOptions: [
      { id: "teal", label: "Teal", hex: "#0d9488" },
      { id: "navy", label: "Navy", hex: "#0a2540" },
      { id: "blue", label: "Blue", hex: "#1a4b8c" },
      { id: "dark-grey", label: "Dark grey", hex: "#3a3f47" },
    ],
  },
  {
    slug: "international-resume",
    name: "International Resume",
    subtitle: "International — Package",
    tagline: "ATS-friendly résumé writing for international applications.",
    summary:
      "Our International Package is designed for candidates applying globally. You get expert ATS-friendly résumé writing and design, LinkedIn optimisation, cover letter writing, interview preparation, recruiter outreach support, salary negotiation tools, and free help with job placements — with a 4 working day turnaround.",
    priceLabel: "Request a quote",
    includes: [
      "Turn around time 4 working days",
      "Expert ATS-FRIENDLY Résumé writing",
      "Adding your email and Résumé into Recruiters Database",
      "Job Application Email Template",
      "Free Career Hunt Techniques",
      "Free salary negotiation Template",
      "Free help with job placements",
      "Submitting your Résumé and cover letter to potential Recruiters and hiring managers",
      "Interview preparation",
      "Cover letter writing",
      "LinkedIn Optimisation",
      "Résumé design",
    ],
    idealFor:
      "Professionals applying for roles outside South Africa who need an internationally styled résumé.",
    timeline: "4 working days",
    quoteAmount: 2200,
    active: true,
    colorOptions: [
      { id: "teal", label: "Teal", hex: "#0d9488" },
      { id: "navy", label: "Navy", hex: "#0a2540" },
      { id: "blue", label: "Blue", hex: "#1a4b8c" },
      { id: "dark-grey", label: "Dark grey", hex: "#3a3f47" },
    ],
  },
];

/** Default catalog (sync). Prefer `listPackages` / `getPackage` from the admin store on the server. */
export const packages = defaultPackages;

export function getDefaultPackage(slug: string): CareerPackage | undefined {
  return defaultPackages.find((pkg) => pkg.slug === slug);
}

/** @deprecated Prefer async store-backed getPackage — kept for client fallbacks. */
export function getPackage(slug: string): CareerPackage | undefined {
  return getDefaultPackage(slug);
}

export function slugifyPackageName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
