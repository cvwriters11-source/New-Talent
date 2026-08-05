import { redirect } from "next/navigation";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
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
    <div className="flex min-h-svh bg-cream text-ink">
      <div className="sticky top-0 hidden h-svh md:block">
        <AdminSidebar email={session.email} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileNav email={session.email} />
        <div className="flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
