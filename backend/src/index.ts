import express from "express";
import dotenv from "dotenv";
import { apiFn } from "./lib";

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
    const url1 = process.env.FILE_URL || "";
    const url2 = process.env.FILE_URL2 || "";
    const {finalData1 , finalData2} = await apiFn({url1, url2});
    return res.json({
      status: 200,
      data: finalData2,
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
    return res.json({ status: 500, error: message });
  }
});
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
