import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-cream px-5 py-24 text-center md:px-8">
      <p className="section-label">404</p>
      <h1 className="mt-4 text-4xl text-ink">Page not found</h1>
      <p className="mt-4 text-muted">
        That page isn’t part of the Career Development journey.
      </p>
      <Link href="/" className="btn-primary mt-8 px-5 py-3 text-sm">
        Back home
      </Link>
    </div>
  );
}
