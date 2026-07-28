import { RecolorableSamplePreview } from "@/components/templates/RecolorableSamplePreview";

type PreviewProps = {
  accent?: string;
  sourceAccent?: string;
  className?: string;
};

function SamplePreview({
  src,
  alt,
  accent,
  sourceAccent,
  hueTolerance,
  className,
}: {
  src: string;
  alt: string;
  accent?: string;
  sourceAccent: string;
  hueTolerance?: number;
  className?: string;
}) {
  return (
    <RecolorableSamplePreview
      src={src}
      alt={alt}
      accent={accent}
      sourceAccent={sourceAccent}
      hueTolerance={hueTolerance}
      className={className}
    />
  );
}

/** Real Graduate / Fresh Graduate template sample (shown as provided). */
export function GraduateTemplatePreview({
  accent,
  sourceAccent = "#13628d",
  className,
}: PreviewProps) {
  return (
    <SamplePreview
      src="/packages/graduate-template.jpg"
      alt="Graduate Package CV template sample"
      accent={accent}
      sourceAccent={sourceAccent}
      className={className}
    />
  );
}

/** Real Professional Package template sample (shown as provided). */
export function ProfessionalTemplatePreview({
  accent,
  sourceAccent = "#1f6b94",
  className,
}: PreviewProps) {
  return (
    <SamplePreview
      src="/packages/professional-template.jpg"
      alt="Professional Package CV template sample"
      accent={accent}
      sourceAccent={sourceAccent}
      className={className}
    />
  );
}

/** Real Executive Package template sample (shown as provided). */
export function ExecutiveTemplatePreview({
  accent,
  sourceAccent = "#1ba1a2",
  className,
}: PreviewProps) {
  return (
    <SamplePreview
      src="/packages/executive-template.jpg"
      alt="Executive Package CV template sample"
      accent={accent}
      sourceAccent={sourceAccent}
      className={className}
    />
  );
}

/** Real International Package template sample (shown as provided). */
export function InternationalTemplatePreview({
  accent,
  sourceAccent = "#2c616b",
  className,
}: PreviewProps) {
  return (
    <SamplePreview
      src="/packages/international-template.jpg"
      alt="International Package résumé template sample"
      accent={accent}
      sourceAccent={sourceAccent}
      hueTolerance={36}
      className={className}
    />
  );
}
