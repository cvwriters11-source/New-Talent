export const site = {
  name: "Talent Crafters",
  product: "Career Development",
  tagline: "Guiding your career journey with clarity and craft.",
  signature: "Your Career is our Business",
  description:
    "Career Development packages from Talent Crafters — Graduate, Professional, Executive, and International Resume — plus Canada relocation guidance.",
  email: process.env.CONTACT_EMAIL || "sam@talentcrafters.co.za",
  whatsappNumber:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "27746502580",
  location: "Boksburg, Gauteng, South Africa",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://talentcrafters.co.za",
  socials: [
    {
      id: "whatsapp",
      label: "WhatsApp",
      href: "https://wa.me/27746502580",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/creative-design1",
    },
    {
      id: "linkedin-recruitment",
      label: "LinkedIn Recruitment",
      href: "https://za.linkedin.com/company/job-seekes",
    },
  ],
} as const;

export const navLinks = [
  { href: "/packages", label: "Packages" },
  { href: "/interview", label: "Interview Prep" },
  { href: "/journey", label: "Journey" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
