import { PDFParse } from "pdf-parse";
import {
  Props,
  mergeContinuationLines,
  mergeContinuationLinesForUrl2,
} from ".";

export const extractPdfDataForBothPdfs = async ({
  url1,
  url2,
  existingPdfBytes,
}: Props) => {
  const parser = new PDFParse({ data: existingPdfBytes as Buffer<any> });
  const result = await parser.getText();
  await parser.destroy();
  if (!result) return;
  const modifiedArr = result.pages.map((item) =>
    item.text.split(/[\n\t]+/).map((l) => l.trim())
  );

  const urlSpecificRes = url1
    ? modifiedArr
        .map((item, i) => {
          const res1 = item.slice(37);
          const res = i == 0 ? res1.slice(0, -11) : res1;
          return res;
        })
        .map((line) => mergeContinuationLines(line))
    : url2
    ? modifiedArr
        .map((item, i) => {
          const res2 = i == 0 ? item.slice(37) : item.slice(36);
          const res = i == 0 ? res2.slice(0, -11) : res2;
          return res;
        })
        .map((line) => mergeContinuationLinesForUrl2(line))
    : [];
  return modifiedArr;
};
