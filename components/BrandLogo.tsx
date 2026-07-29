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
      className={`inline-flex items-center ${
        isFooter ? "rounded-sm bg-white px-3 py-2 shadow-sm" : ""
      } ${className}`}
    >
      <Image
        src="/brand/logo.png"
        alt="Talent Crafters Recruitment"
        width={isFooter ? 280 : 220}
        height={isFooter ? 280 : 220}
        priority={priority}
        sizes={
          isFooter
            ? "(max-width: 640px) 160px, 200px"
            : "(max-width: 640px) 88px, (max-width: 1024px) 108px, 120px"
        }
        className={
          isFooter
            ? "h-[6.5rem] w-auto max-w-[11rem] object-contain object-left sm:h-[7.5rem] sm:max-w-[13rem]"
            : "h-[4.75rem] w-auto max-w-[5.25rem] object-contain object-left sm:h-[5.75rem] sm:max-w-[6.5rem] md:h-[6.25rem] md:max-w-[7rem]"
        }
      />
    </span>
  );
}
