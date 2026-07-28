export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? <p className="section-label">{eyebrow}</p> : null}
      <h2 className="mt-3 text-3xl text-ink md:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-3 max-w-xl text-muted">{description}</p>
      ) : null}
    </div>
  );
}
