export const adminNav = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/orders", label: "Orders", icon: "orders" },
  { href: "/admin/writers", label: "Writers", icon: "writers" },
  { href: "/admin/customers", label: "Customers", icon: "customers" },
  { href: "/admin/recruiters", label: "Recruiters", icon: "recruiters" },
  { href: "/admin/job-seekers", label: "Job Seekers", icon: "seekers" },
  { href: "/admin/interview-sessions", label: "Interview Sessions", icon: "interview" },
  { href: "/admin/job-posts", label: "Job Posts", icon: "jobs" },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: "subs" },
  { href: "/admin/subscription-plans", label: "Subscription Plans", icon: "plans" },
  { href: "/admin/packages", label: "Packages", icon: "packages" },
  { href: "/admin/popup", label: "Site Popup", icon: "popup" },
  { href: "/admin/cv-generator", label: "CV Generator", icon: "cv" },
  { href: "/admin/reviews", label: "Reviews", icon: "reviews" },
  { href: "/admin/promotions", label: "Promotions", icon: "promos" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
] as const;

export type AdminNavItem = (typeof adminNav)[number];
