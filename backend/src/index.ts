import express from "express";
import dotenv from "dotenv";
import { PDFParse } from "pdf-parse";
import { ExtractedData, optionalDataType } from "./lib/types";
import { readFileSync } from "node:fs";
import path from "node:path";
import axios from "axios";
import fs from "fs/promises";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
function mergeContinuationLines2(page: string[]): string[] {
  const out: string[] = [];
  for (const raw of page) {
    const line = (raw ?? "").trim().replace(",", "");
    if (line === "") continue;
    if (/^\s*2/.test(line)) out.push(line);
    else {
      if (!out.length) out.push(line);
      else out[out.length - 1] = `${out[out.length - 1]} ${line}`.trim();
    }
  }
  return out;
}
const extractPdfData = async (existingPdfBytes: Buffer) => {
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
    .map((line) => mergeContinuationLines2(line));
  return modifiedArr;
};
const strToJson = (ip: string[]) => {
  const op = [];
  const subCategoryArr = [
    "Green Card",
    "Ex-Service Men",
    "Physically challenged",
  ];
  const categoryArr = ["General", "SC", "ST", "OBC", "EWS"];
  for (const line of ip) {
    let lineCleaned = line;
    if (!lineCleaned?.trim()) continue;

    for (let c of categoryArr) {
      lineCleaned = lineCleaned.replace(
        new RegExp(`(?<!\\s)${c}`, "g"),
        ` ${c}`
      );
    }
    const tokens = lineCleaned.trim().split(/\s+/);

    const categoryIdx = tokens.findIndex(
      (t) => categoryArr.includes(t) || /^(General|OBC|SC|ST|EWS)/.test(t)
    );
    const name = tokens.slice(2, categoryIdx).join(" ").toLowerCase();

    const stateAppNo = tokens[0];
    const neetRollNo = tokens[1];
    const category = tokens[categoryIdx + 1]?.startsWith("(")
      ? tokens[categoryIdx] + " " + tokens[categoryIdx + 1]
      : tokens[categoryIdx];

    const subCategoryIdx = tokens.findIndex((t) => subCategoryArr?.includes(t));
    let subCategory = "nil";
    if (subCategoryIdx !== -1) {
      subCategory = tokens[subCategoryIdx + 1]?.startsWith("(")
        ? tokens[subCategoryIdx] + " " + tokens[subCategoryIdx + 1]
        : tokens[subCategoryIdx];
    }

    const typeOfCandidate = tokens?.includes("DIR") ? "DIR" : "INS";

    const incentivePercentIdx = tokens.indexOf(typeOfCandidate) + 1;
    const incentivePercent = Number(tokens[incentivePercentIdx]);

    const stateSpecificPercentile = Number(tokens[incentivePercentIdx + 1]);

    const neetAIR = Number(tokens[incentivePercentIdx + 2]);

    const courseAppliedFor = tokens[incentivePercentIdx + 3];

    const neetAppID = tokens[incentivePercentIdx + 4];

    const stateSpecificRank = Number(tokens[incentivePercentIdx + 5]);

    const allNums = line.match(/\b\d+\b/g) || [];
    const lenNums = allNums.length;
    const rankUR = lenNums >= 1 ? allNums[lenNums - 1] : "";
    const categoryRankNum = lenNums >= 2 ? allNums[lenNums - 2] : "";
    // Map category type
    let categoryRankType: keyof ExtractedData["categoryRank"] = "rank_gc";
    if (category?.includes("SC")) categoryRankType = "rank_sc";
    else if (category?.includes("ST")) categoryRankType = "rank_st";
    else if (category?.includes("EWS")) categoryRankType = "rank_ews";
    else if (category?.includes("Ex-Service")) categoryRankType = "rank_es";
    else if (category?.includes("Green Card")) categoryRankType = "rank_gc";

    op.push({
      stateAppNo,
      neetRollNo,
      name,
      category,
      subCategory,
      typeOfCandidate: typeOfCandidate as "INS" | "DIR",
      incentivePercent,
      stateSpecificPercentile,
      neetAIR,
      courseAppliedFor,
      neetAppID,
      stateSpecificRank,
      categoryRank: {
        [categoryRankType]: Number(categoryRankNum),
        rank_ur: Number(rankUR),
      },
    });
  }
  return op;
};
const sendDataToFrontEnd = async (
  urlToSendData: string,
  finalData: ExtractedData[]
) => {
  const sendDataToDB = await axios.post(urlToSendData,finalData);
  if (!sendDataToDB || sendDataToDB.status >= 400) {
    return Response.json({ status: 502, msg: "Could not send data to DB" });
  }
};
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
