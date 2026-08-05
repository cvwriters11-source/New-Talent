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
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src="/brand/logo-sm.png"
        alt="Talent Crafters Recruitment"
        width={isFooter ? 280 : 220}
        height={isFooter ? 280 : 220}
        priority={priority}
        unoptimized
        sizes={
          isFooter
            ? "(max-width: 640px) 180px, 220px"
            : "(max-width: 640px) 140px, (max-width: 1024px) 160px, 180px"
        }
        className={
          isFooter
            ? "h-[5.5rem] w-auto max-w-[11rem] object-contain object-left sm:h-[6.5rem] sm:max-w-[13rem]"
            : "h-[3.25rem] w-auto max-w-[9rem] object-contain object-left sm:h-[3.75rem] sm:max-w-[10rem] md:h-[4rem] md:max-w-[11rem]"
        }
      />
    </span>
  );
}
