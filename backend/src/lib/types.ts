import z from "zod";
export interface ExtractedData {
  stateAppNo: String;
  neetRollNo: String;
  name: String;
  category: String;
  subCategory: String;
  typeOfCandidate: { type: String; enum: ["DIR", "INS"] };
  incentivePercent: number;
  stateSpecificPercentile: number;
  neetAIR: Number;
  courseAppliedFor: String;
  neetAppID: String;
  stateSpecificRank: number;
  categoryRank: {
    rank_sc?: number;
    rank_st?: number;
    rank_gc?: number;
    rank_es?: number;
    rank_pc?: number;
    rank_ews?: number;
    rank_ur: number;
  };
}
export type optionalDataType = Partial<ExtractedData>;

export const zValidatedDataSchema = z.object({
  stateAppNo: z.string(),
  neetRollNo: z.string(),
  name: z.string(),
  category: z.string(),
  subCategory: z.enum(["Green Card (GC)", "Ex-Service Men"]),
  typeOfCandidate: z.enum(["DIR", "INS"]),
  incentivePercent: z.float64(),
  stateSpecificPercentile: z.float64(),
  neetAIR: z.number(),
  courseAppliedFor: z.enum(["PG", "BOTH"]),
  neetAppID: z.string(),
  stateSpecificRank: z.number(),
  categoryRank: z.object({
    rank_sc: z.number().optional(),
    rank_st: z.number().optional(),
    rank_gc: z.number().optional(),
    rank_es: z.number().optional(),
    rank_pc: z.number().optional(),
    rank_ews: z.number().optional(),
    rank_ur: z.number(),
  }),
});

/*
BHISMADEV BHOI
JYOTIPRAVA PAL
SWAPNA SHIBANGI SATAPATHY 
PRATYASHA SWAIN
24101010 24661058812 BHISMADEV BHOI OBC-UR INS 30 59.2117188 128744 BOTH PG24165397 1005 221
24100713 24661006252 JYOTIPRAVA PAL OBC-UR INS NIL 40.4803300 128866 BOTH PG24194699 1106 243
24100152 24661023584 SWAPNA SHIBANGI SATAPATHYGeneral (UR) DIR NIL 99.3015867 1536 PG PG24115216 31 27
*/