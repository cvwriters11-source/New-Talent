import type { Metadata } from "next";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { getStore } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const store = await getStore();
  return (
    <div>
      <h1 className="text-xl font-bold text-ink sm:text-2xl">Orders</h1>
      <p className="mt-1 text-sm text-muted">
        Checkout submissions and invoice requests from the Career Development website.
      </p>
      <div className="mt-6">
        <OrdersTable orders={store.orders} writers={store.writers} />
      </div>
    </div>
  );
}
