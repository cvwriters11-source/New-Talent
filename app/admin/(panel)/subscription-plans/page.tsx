import type { Metadata } from "next";
import { formatRand } from "@/lib/admin/format";
import { getStore } from "@/lib/admin/store";

export const metadata: Metadata = { title: "Subscription Plans" };

export default async function Page() {
  const store = await getStore();
  return (
    <div>
      <h1 className="text-2xl font-bold">Subscription Plans</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {store.plans.map((plan) => (
          <article
            key={plan.id}
            className="rounded-xl border border-line bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-bold">{plan.name}</h2>
            <p className="mt-2 text-2xl font-bold text-teal">
              {formatRand(plan.price)}
              <span className="text-sm font-medium text-muted">
                /{plan.interval}
              </span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
