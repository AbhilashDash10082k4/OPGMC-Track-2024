import axios from "axios";

import dotenv from "dotenv";
import { strToJson, extractPdfDataForBothPdfs, parseRowsToJson } from ".";

dotenv.config();
type PropForAPIFn = {
  url1?: string;
  url2?: string;
};
export async function apiFn({ url1, url2 }: PropForAPIFn) {
  const response = await axios.get(url1 as string, {
    responseType: "arraybuffer",
  });
  const existingPdfBytes = Buffer.from(response.data);
  const unifiedStrings = (await extractPdfDataForBothPdfs({
    url1,
    existingPdfBytes
  })) as string[][];
  const finalData1 = unifiedStrings?.map((i) => strToJson(i));
  if (!unifiedStrings) throw new Error("No data found");

  const response2 = await axios.get(url2 as string, {
    responseType: "arraybuffer",
  });
  const existingPdfBytes2 = Buffer.from(response2.data);
  const unifiedStrings2 = await extractPdfDataForBothPdfs({ url2, existingPdfBytes2 });
  const finalData2 = unifiedStrings2?.map((i) => parseRowsToJson(i))!;

  return { finalData1, finalData2 };
}

// const urlToSendData = process.env.NEXT_API_URL as string | undefined;
// if (!urlToSendData) {
//   console.error("NEXT_API_URL is not set. Check your .env file and dotenv setup.");
//   throw new Error("Server misconfiguration: NEXT_API_URL not set");
// }

// const callToFrontendURL = await sendDataToFrontEnd(urlToSendData, finalData.flat());
// if (!callToFrontendURL) {
//   // keep the data in the error for debugging
//   const err = new Error("data could not be sent to db");
//   // Attach data for upstream handlers if needed
//   (err as any).data = finalData.flat();
//   throw err;
// }

// return finalData as ExtractedData[][];
