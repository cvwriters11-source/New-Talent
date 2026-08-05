import type { Metadata } from "next";
import { getStore } from "@/lib/admin/store";

export const metadata: Metadata = { title: "Reviews" };

export default async function Page() {
  const store = await getStore();
  return (
    <div>
      <h1 className="text-2xl font-bold">Reviews</h1>
      <div className="mt-6 space-y-4">
        {store.reviews.map((r) => (
          <article
            key={r.id}
            className="rounded-xl border border-line bg-paper p-5 shadow-sm"
          >
            <p className="font-semibold">{r.customer}</p>
            <p className="mt-1 text-amber-500">{"★".repeat(r.rating)}</p>
            <p className="mt-2 text-sm text-muted">{r.comment}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
