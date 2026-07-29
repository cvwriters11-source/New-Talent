import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminSession } from "@/lib/admin/auth";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-svh bg-[#f3f6fb] text-ink">
      <div className="sticky top-0 hidden h-svh md:block">
        <AdminSidebar email={session.email} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-line bg-[#0f172a] px-4 py-3 text-white md:hidden">
          <p className="text-sm font-bold">Talent Crafters Admin</p>
          <p className="truncate text-[11px] text-white/60">{session.email}</p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {[
              ["/admin", "Dashboard"],
              ["/admin/orders", "Orders"],
              ["/admin/packages", "Packages"],
              ["/admin/interview", "Interview"],
              ["/admin/popup", "Popup"],
              ["/admin/settings", "Settings"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
