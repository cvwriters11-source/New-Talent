export type TemplateId =
  | "graduate"
  | "professional"
  | "executive"
  | "international";

export type TemplateColor = {
  id: string;
  label: string;
  hex: string;
};

export type CvTemplate = {
  id: TemplateId;
  name: string;
  packageSlug: string;
  description: string;
  layout: string;
  bestFor: string;
  colors: TemplateColor[];
  /** When set, preview uses this image as-is instead of a CSS mock. */
  sampleImage?: string;
  /** Dominant brand colour in the sample image (used for live recolouring). */
  sampleAccent?: string;
};

export const templates: CvTemplate[] = [
  {
    id: "graduate",
    name: "Graduate / Fresh Graduate",
    packageSlug: "graduate-package",
    description:
      "Modern two-column layout with a bold header — ideal for graduates applying across Africa. ATS-friendly structure with education, skills, and achievements front and centre.",
    layout: "Two-column · Photo header · Skills sidebar",
    bestFor: "Fresh graduates · Africa applications",
    sampleImage: "/packages/graduate-template.jpg",
    sampleAccent: "#13628d",
    colors: [
      { id: "blue", label: "Blue", hex: "#1e3a5f" },
      { id: "teal", label: "Teal", hex: "#0d9488" },
      { id: "dark-green", label: "Dark green", hex: "#14532d" },
    ],
  },
  {
    id: "professional",
    name: "Professional — Package",
    packageSlug: "professional-package",
    description:
      "Expert ATS-friendly CV writing and design for working professionals across Africa — recruiter database listing, LinkedIn optimisation, job application email template, and free career hunt techniques.",
    layout: "Two-column · Photo header · Skills sidebar",
    bestFor: "Working professionals · Africa · 7 working days",
    sampleImage: "/packages/professional-template.jpg",
    sampleAccent: "#1f6b94",
    colors: [
      { id: "blue", label: "Blue", hex: "#1a4b8c" },
      { id: "teal", label: "Teal", hex: "#0d9488" },
      { id: "navy", label: "Navy", hex: "#0a2540" },
      { id: "dark-grey", label: "Dark grey", hex: "#3a3f47" },
    ],
  },
  {
    id: "executive",
    name: "Executive — Package",
    packageSlug: "executive-package",
    description:
      "Executive CV design for senior leaders — ATS-friendly writing, cover letter, LinkedIn optimisation, recruiter outreach, interview preparation, and salary negotiation support. Africa only · 5 working days.",
    layout: "Two-column · Photo sidebar · Leadership profile",
    bestFor: "Managers & executives · Africa · 5 working days",
    sampleImage: "/packages/executive-template.jpg",
    sampleAccent: "#1ba1a2",
    colors: [
      { id: "teal", label: "Teal", hex: "#0d9488" },
      { id: "navy", label: "Navy", hex: "#0a2540" },
      { id: "blue", label: "Blue", hex: "#1a4b8c" },
      { id: "dark-grey", label: "Dark grey", hex: "#3a3f47" },
    ],
  },
  {
    id: "international",
    name: "International — Package",
    packageSlug: "international-resume",
    description:
      "International résumé design for overseas applications — ATS-friendly writing, cover letter, LinkedIn optimisation, recruiter outreach, interview preparation, and salary negotiation support. 4 working days.",
    layout: "Single column · Summary-led · Skills & attributes",
    bestFor: "Overseas applications · 4 working days",
    sampleImage: "/packages/international-template.jpg",
    sampleAccent: "#2c616b",
    colors: [
      { id: "teal", label: "Teal", hex: "#0d9488" },
      { id: "navy", label: "Navy", hex: "#0a2540" },
      { id: "blue", label: "Blue", hex: "#1a4b8c" },
      { id: "dark-grey", label: "Dark grey", hex: "#3a3f47" },
    ],
  },
];

export function getTemplate(id: string): CvTemplate | undefined {
  return templates.find((t) => t.id === id);
}

export function getTemplateByPackage(
  packageSlug: string,
): CvTemplate | undefined {
  return templates.find((t) => t.packageSlug === packageSlug);
}
