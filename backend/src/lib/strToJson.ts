import { ExtractedData } from "./types";

export const strToJson = (ip: string[]) => {
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