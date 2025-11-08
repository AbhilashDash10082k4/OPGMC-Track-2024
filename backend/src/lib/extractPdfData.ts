import { PDFParse } from "pdf-parse";
import { mergeContinuationLines } from "./mergeContinuationLines";

export const extractPdfData = async (existingPdfBytes: Buffer) => {
  const parser = new PDFParse({ data: existingPdfBytes });
  const result = await parser.getText();
  await parser.destroy();
  if (!result) return;
  const modifiedArr = result.pages
    .map((item) => item.text.split(/[\n\t]+/).map((l) => l.trim()))
    .map((item, i) => {
      const res1 = item.slice(37);
      const res = i == 0 ? res1.slice(0, -11) : res1;
      return res;
    })
    .map((line) => mergeContinuationLines(line));
  return modifiedArr;
};