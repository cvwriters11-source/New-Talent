export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
      <div className="h-3 w-28 animate-pulse bg-line" />
      <div className="mt-4 h-10 max-w-md animate-pulse bg-line" />
      <div className="mt-3 h-4 max-w-xl animate-pulse bg-line/70" />
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="h-48 animate-pulse border border-line bg-paper" />
        <div className="h-48 animate-pulse border border-line bg-paper" />
      </div>
    </div>
  );
}
