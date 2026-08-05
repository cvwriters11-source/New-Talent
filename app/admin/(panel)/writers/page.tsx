import type { Metadata } from "next";
import { WritersManager } from "@/components/admin/WritersManager";
import { getStore, getWriterPerformance } from "@/lib/admin/store";

export const metadata: Metadata = { title: "Writers" };

export default async function AdminWritersPage() {
  const store = await getStore();
  const writers = getWriterPerformance(store);

  return (
    <div>
      <h1 className="text-xl font-bold text-ink sm:text-2xl">Writers</h1>
      <p className="mt-1 text-sm text-muted">
        Add or remove CV writers, then assign them to orders.
      </p>
      <div className="mt-6">
        <WritersManager writers={writers} />
      </div>
    </div>
  );
}
