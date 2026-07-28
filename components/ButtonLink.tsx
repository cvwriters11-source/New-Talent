import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "outline-teal" | "on-dark";

const variants: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  "outline-teal":
    "inline-flex items-center justify-center border border-teal font-semibold text-teal transition hover:bg-teal hover:text-white",
  "on-dark":
    "inline-flex items-center justify-center border border-white/30 bg-white/10 font-semibold text-white backdrop-blur-sm transition hover:border-white hover:bg-white hover:text-ink",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  external?: boolean;
}) {
  const classes = `${variants[variant]} px-5 py-3 text-sm ${className}`;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
