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
        src="/brand/logo-sm.png"
        alt="Talent Crafters Recruitment"
        width={isFooter ? 220 : 180}
        height={isFooter ? 140 : 90}
        priority={priority}
        sizes={isFooter ? "220px" : "(max-width: 640px) 140px, 180px"}
        className={
          isFooter
            ? "h-[5rem] w-auto max-w-[12rem] object-contain sm:h-[5.5rem] sm:max-w-[14rem]"
            : "h-12 w-auto max-w-[9.5rem] object-contain object-left sm:h-14 sm:max-w-[11rem]"
        }
      />
    </span>
  );
}
