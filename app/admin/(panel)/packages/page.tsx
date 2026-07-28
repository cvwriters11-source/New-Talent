import type { Metadata } from "next";
import { PackagesManager } from "@/components/admin/PackagesManager";
import { listPackages } from "@/lib/admin/store";

export const metadata: Metadata = { title: "Packages" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const packages = await listPackages({ includeInactive: true });
  return <PackagesManager packages={packages} />;
}
