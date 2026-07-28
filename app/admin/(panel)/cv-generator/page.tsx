import type { Metadata } from "next";

export const metadata: Metadata = { title: "CV Generator" };

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold">CV Generator</h1>
      <div className="mt-6 rounded-xl border border-line bg-white p-6 shadow-sm">
        <p className="text-sm text-muted">
          Use this workspace to track template-based CV generation for Talent
          Crafters packages. Writers can open the public Templates gallery and
          deliver in the selected colour.
        </p>
        <a
          href="/templates"
          className="mt-4 inline-flex btn-primary px-4 py-2.5 text-sm"
        >
          Open templates gallery
        </a>
      </div>
    </div>
  );
}
