import Image from "next/image";

type BrandLogoProps = {
  size?: "header" | "footer";
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  size = "header",
  className = "",
  priority = false,
}: BrandLogoProps) {
  const isFooter = size === "footer";

  return (
    <span
      className={`brand-logo-round inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-teal/40 bg-navy shadow-[0_0_18px_#00b7ff33] ${
        isFooter
          ? "h-16 w-16 p-1.5 sm:h-[4.75rem] sm:w-[4.75rem] sm:p-2"
          : "h-12 w-12 p-1 sm:h-14 sm:w-14 sm:p-1.5 md:h-16 md:w-16"
      } ${className}`}
    >
      <Image
        src="/brand/logo-sm.png"
        alt="Talent Crafters Recruitment"
        width={isFooter ? 160 : 128}
        height={isFooter ? 160 : 128}
        priority={priority}
        unoptimized
        sizes={isFooter ? "76px" : "64px"}
        className="h-full w-full object-contain object-center"
      />
    </span>
  );
}
