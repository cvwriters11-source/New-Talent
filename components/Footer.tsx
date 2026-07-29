import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { navLinks, site } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";

function SocialIcon({ id }: { id: string }) {
  if (id === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 9.047H1.777V20.452h3.56V9.047zM3.557 2.188a2.309 2.309 0 11-.003 4.618 2.309 2.309 0 01.003-4.618z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-12 sm:gap-10 sm:py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:px-8">
        <div className="col-span-2 md:col-span-1">
          <BrandLogo size="footer" />
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/50">
            {site.product}
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-paper/70 sm:mt-5">
            {site.tagline} Career packages plus Canada relocation guidance
            grounded in official IRCC information.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {site.socials.map((social) => (
              <a
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center border border-white/15 text-paper/80 transition hover:border-white hover:text-white"
                aria-label={social.label}
              >
                <SocialIcon id={social.id.startsWith("linkedin") ? "linkedin" : social.id} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-bright">
            Explore
          </p>
          <ul className="mt-3 space-y-2 text-sm text-paper/80 sm:mt-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="inline-block py-0.5 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/packages" className="inline-block py-0.5 hover:text-white">
                Checkout packages
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-bright">
            Legal
          </p>
          <ul className="mt-3 space-y-2 text-sm text-paper/80 sm:mt-4">
            <li>
              <Link href="/terms" className="inline-block py-0.5 hover:text-white">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="inline-block py-0.5 hover:text-white">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-bright">
            Contact
          </p>
          <ul className="mt-3 space-y-2 text-sm text-paper/80 sm:mt-4">
            <li>
              <a href={`mailto:${site.email}`} className="break-all hover:text-white">
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={whatsappLink(
                  "Hi Talent Crafters — I'd like help with my career journey.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                WhatsApp us
              </a>
            </li>
            <li className="text-paper/65">{site.location}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold tracking-wide text-paper/90">
              {site.signature}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-paper/45">
              © {new Date().getFullYear()} {site.name}. {site.product}. All
              rights reserved.
            </p>
          </div>
          <Link
            href="/admin/login"
            className="text-[11px] text-paper/35 transition hover:text-paper/60"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
