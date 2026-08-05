import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderDetailActions } from "@/components/admin/OrderDetailActions";
import { OrderFilesPanel } from "@/components/admin/OrderFilesPanel";
import { formatRand } from "@/lib/admin/format";
import {
  getOrderById,
  getPackageBySlug,
  getStore,
} from "@/lib/admin/store";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const order = await getOrderById(id);
  return {
    title: order
      ? `Order ${order.orderNumber || order.id}`
      : "Order not found",
  };
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const [order, store] = await Promise.all([getOrderById(id), getStore()]);
  if (!order) notFound();

  const pkg = await getPackageBySlug(order.packageSlug, {
    includeInactive: true,
  });

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/orders"
        className="text-sm font-semibold text-teal underline underline-offset-2"
      >
        ← Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">
            Order detail
          </p>
          <h1 className="mt-1 text-xl font-bold text-ink sm:text-2xl">
            {order.orderNumber || order.id}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Created {new Date(order.createdAt).toLocaleString("en-ZA")}
            {order.completedAt
              ? ` · Completed ${new Date(order.completedAt).toLocaleString("en-ZA")}`
              : ""}
          </p>
        </div>
        <p className="text-lg font-bold text-teal sm:text-xl">{formatRand(order.amount)}</p>
      </div>

      <div className="mt-6 rounded-xl border border-line bg-paper p-5 shadow-sm">
        <OrderDetailActions
          orderId={order.id}
          status={order.status}
          assignedWriter={order.assignedWriter}
          writers={store.writers}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-paper p-5 shadow-sm">
          <h2 className="text-base font-bold text-ink">Customer</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-muted">Name</dt>
              <dd className="font-semibold">
                {order.firstName} {order.surname}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Email</dt>
              <dd>
                <a
                  href={`mailto:${order.email}`}
                  className="font-semibold text-teal underline"
                >
                  {order.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-muted">WhatsApp</dt>
              <dd className="font-semibold">{order.whatsapp}</dd>
            </div>
            <div>
              <dt className="text-muted">Location</dt>
              <dd className="font-semibold">
                {order.location}
                {order.country ? `, ${order.country}` : ""}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-line bg-paper p-5 shadow-sm">
          <h2 className="text-base font-bold text-ink">Package</h2>
          <p className="mt-2 text-lg font-semibold text-ink">
            {order.packageName}
          </p>
          {order.cvColor ? (
            <p className="mt-1 text-sm text-muted">CV colour: {order.cvColor}</p>
          ) : null}
          {pkg?.subtitle ? (
            <p className="mt-1 text-sm text-muted">{pkg.subtitle}</p>
          ) : null}
          {pkg?.summary ? (
            <p className="mt-3 text-sm leading-relaxed text-ink">{pkg.summary}</p>
          ) : (
            <p className="mt-3 text-sm text-muted">
              No package description available for this slug.
            </p>
          )}
          {pkg?.includes?.length ? (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                Includes
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
                {pkg.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {pkg?.idealFor ? (
            <p className="mt-4 text-sm text-muted">
              <span className="font-semibold text-ink">Ideal for:</span>{" "}
              {pkg.idealFor}
            </p>
          ) : null}
          {pkg?.timeline ? (
            <p className="mt-2 text-sm text-muted">
              <span className="font-semibold text-ink">Timeline:</span>{" "}
              {pkg.timeline}
            </p>
          ) : null}
        </section>
      </div>

      <OrderFilesPanel
        orderId={order.id}
        cvUrl={order.cvUrl}
        pictureUrl={order.pictureUrl}
        customerName={`${order.firstName} ${order.surname}`}
      />
    </div>
  );
}
