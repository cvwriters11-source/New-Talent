import type { Metadata } from "next";
import { getStore } from "@/lib/admin/store";

export const metadata: Metadata = { title: "Job Seekers" };

export default async function Page() {
  const store = await getStore();
  return (
    <div>
      <h1 className="text-2xl font-bold">Job Seekers</h1>
      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#f8fafc] text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Target role</th>
              <th className="px-4 py-3">Country</th>
            </tr>
          </thead>
          <tbody>
            {store.jobSeekers.map((j) => (
              <tr key={j.id} className="border-t border-line">
                <td className="px-4 py-3 font-semibold">{j.name}</td>
                <td className="px-4 py-3">{j.email}</td>
                <td className="px-4 py-3">{j.targetRole}</td>
                <td className="px-4 py-3">{j.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
