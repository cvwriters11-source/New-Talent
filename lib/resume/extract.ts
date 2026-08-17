export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return (result.text || "").trim();
}

export async function extractTextFromUpload(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (
    type.includes("pdf") ||
    name.endsWith(".pdf") ||
    buffer.subarray(0, 4).toString() === "%PDF"
  ) {
    return extractTextFromPdf(buffer);
  }

  if (
    type.includes("text") ||
    name.endsWith(".txt") ||
    name.endsWith(".md")
  ) {
    return buffer.toString("utf8");
  }

  const asText = buffer.toString("utf8");
  if (asText.replace(/\u0000/g, "").trim().length > 40) {
    return asText;
  }

  throw new Error(
    "Could not read this file. Upload a PDF or paste your CV text.",
  );
}
