import { PDFDocument } from "pdf-lib";

export async function parseFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  // Check if PDF (starts with "%PDF")
  const isPDF = uint8[0] === 0x25 && uint8[1] === 0x50 && uint8[2] === 0x44 && uint8[3] === 0x46;

  const ext = file.name.split(".").pop().toLowerCase();

  if (isPDF) {
    // Parse as PDF
    return await parsePDF(file);
  } else if (ext === "docx") {
    // Parse as DOCX
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } else if (ext === "txt") {
    return await file.text();
  } else {
    throw new Error("Unsupported file format: " + ext);
  }
}
