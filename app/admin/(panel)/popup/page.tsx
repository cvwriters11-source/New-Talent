import type { Metadata } from "next";
import { PopupEditor } from "@/components/admin/PopupEditor";
import { getSitePopup } from "@/lib/admin/store";

export const metadata: Metadata = { title: "Site popup" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const popup = await getSitePopup();
  return <PopupEditor popup={popup} />;
}
