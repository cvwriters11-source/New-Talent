import { site } from "./site";

export function whatsappLink(message: string): string {
  const text = encodeURIComponent(message);
  return `https://wa.me/${site.whatsappNumber}?text=${text}`;
}

export function packageWhatsappMessage(packageName: string): string {
  return `Hi Talent Crafters — I'd like to enquire about the ${packageName} package.`;
}
