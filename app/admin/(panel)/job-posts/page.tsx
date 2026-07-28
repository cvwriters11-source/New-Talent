import type { Metadata } from "next";
import { getStore } from "@/lib/admin/store";

export const metadata: Metadata = { title: "Job Posts" };

export default async function Page() {
  const store = await getStore();
  return (
    <div>
      <h1 className="text-2xl font-bold">Job Posts</h1>
      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#f8fafc] text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {store.jobPosts.map((j) => (
              <tr key={j.id} className="border-t border-line">
                <td className="px-4 py-3 font-semibold">{j.title}</td>
                <td className="px-4 py-3">{j.company}</td>
                <td className="px-4 py-3">{j.location}</td>
                <td className="px-4 py-3 capitalize">{j.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
