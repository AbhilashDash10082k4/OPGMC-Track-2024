import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
async function test() {
  const url2 = process.env.FILE_URL2;
  const response2 = await axios.get(url2 as string, {
    responseType: "arraybuffer",
  });
  const existingPdfBytes2 = Buffer.from(response2.data);
  const parser = new PDFParse({ url: url2 });
  const result = await parser.getTable();
  await parser.destroy();
  console.log(result);
  // Pretty-print each row of the first table
  //   for (const row of result.pages[0].tables[0]) {
  //     console.log(JSON.stringify(row));
  //   }
}
test();
