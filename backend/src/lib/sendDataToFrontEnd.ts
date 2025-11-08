import axios from "axios";
import { ExtractedData } from "./types";

export const sendDataToFrontEnd = async (
  urlToSendData: string,
  finalData: ExtractedData[]
) => {
  const sendDataToDB = await axios.post(urlToSendData,finalData);
  if (!sendDataToDB || sendDataToDB.status >= 400) {
    return Response.json({ status: 502, msg: "Could not send data to DB" });
  }
};