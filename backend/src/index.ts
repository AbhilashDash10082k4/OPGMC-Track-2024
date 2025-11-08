import express from "express";
import dotenv from "dotenv";
import { PDFParse } from "pdf-parse";
import { ExtractedData, optionalDataType } from "./lib/types";
import { readFileSync } from "node:fs";
import path from "node:path";
import axios from "axios";
import fs from "fs/promises";
import { mergeContinuationLines } from "./lib/mergeContinuationLines";
import { extractPdfData } from "./lib/extractPdfData";
import { sendDataToFrontEnd } from "./lib/sendDataToFrontEnd";
import { strToJson } from "./lib/strToJson";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) =>
  res.send(
    "✅ Backend is live! View the data at https://opgmc-track-2024-1.onrender.com/pdfparse"
  )
);
app.get("/pdfparse", async (req, res) => {
  try {
    const fileId = "19Rr37cEJJbK0YhYu-b_3z8_8p3Zz2ZGF";
    const url = `https://drive.google.com/uc?export=download&id=${fileId}`;

    // download file
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const existingPdfBuffer = Buffer.from(response.data);
    const unifiedStrings = (await extractPdfData(
      existingPdfBuffer
    )) as string[][];
    const finalData = unifiedStrings?.map((i) => strToJson(i));
    if (!unifiedStrings) return res.json({ status: 404, msg: "No data found" });
    const urlToSendData = process.env.NEXT_API_URL as string | undefined;
    if (!urlToSendData) {
      console.error(
        "NEXT_API_URL is not set. Check your .env file and dotenv setup."
      );
      return res.status(500).json({
        status: 500,
        msg: "Server misconfiguration: NEXT_API_URL not set",
      });
    }

    const callToFrontendURL = await sendDataToFrontEnd(
      urlToSendData,
      finalData.flat()
    );
    if (!callToFrontendURL)
      return res.json({
        status: 400,
        data: finalData.flat(),
        msg: "data could not be sent to db",
      });
    return res.json({
      status: 200,
      data: finalData.flat(),
      msg: "data sent to db",
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "response" in error) {
      // axios error: (error as any).response may contain status/data
      const axiosErr = error as any;
      console.error("pdflib axios error:", {
        message: axiosErr.message,
        status: axiosErr.response?.status,
        data: axiosErr.response?.data,
      });
      return res.status(axiosErr.response?.status ?? 500).json({
        status: axiosErr.response?.status ?? 500,
        error: axiosErr.response?.data ?? axiosErr.message,
      });
    }

    const message = error instanceof Error ? error.message : String(error);
    console.error("pdflib error:", message);
    return res.status(500).json({ status: 500, error: message });
  }
});
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
