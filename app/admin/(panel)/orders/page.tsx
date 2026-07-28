import type { Metadata } from "next";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { getStore } from "@/lib/admin/store";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const store = await getStore();
  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Orders</h1>
      <p className="mt-1 text-sm text-muted">
        Checkout submissions from the Career Development website.
      </p>
      <div className="mt-6">
        <OrdersTable orders={store.orders} />
      </div>
    </div>
  );
}
