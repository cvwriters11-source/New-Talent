"use client";

import { usePathname } from "next/navigation";
import { DeferredCanadaChat } from "@/components/DeferredCanadaChat";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SiteAnnouncementPopup } from "@/components/SiteAnnouncementPopup";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <DeferredCanadaChat />
      <SiteAnnouncementPopup />
    </>
  );
}
