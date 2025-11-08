import { PDFParse } from "pdf-parse";
import {
  mergeContinuationLines,
  mergeContinuationLinesForUrl2,
} from "./mergeContinuationLines";

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

export const extractPdfDataForUrl2 = async (existingPdfBytes: Buffer) => {
  const parser = new PDFParse({ data: existingPdfBytes });
  const result = await parser.getText();
  await parser.destroy();
  if (!result) return;
  const modifiedArr = result.pages
    .map((item) => item.text.split(/[\n\t]+/).map((l) => l.trim()))
    .map((item, i) => {
      const res2 = i==0 ? item.slice(37) : item.slice(36);
      const res = i == 0 ? res2.slice(0, -11) : res2;
      return res;
    })
    .map((line) => mergeContinuationLinesForUrl2(line));
  return modifiedArr;
};
