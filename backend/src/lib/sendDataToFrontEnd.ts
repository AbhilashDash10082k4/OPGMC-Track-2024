import axios from "axios";
import { ExtractedData } from ".";

export const sendDataToFrontEnd = async (
  urlToSendData: string,
  finalData: ExtractedData[]
): Promise<boolean> => {
  try {
    const sendDataToDB = await axios.post(urlToSendData, finalData, {
      headers: { "Content-Type": "application/json" },
    });
    return sendDataToDB.status >= 200 && sendDataToDB.status < 300;
  } catch (err) {
    console.error("sendDataToFrontEnd error:", err);
    return false;
  }
};