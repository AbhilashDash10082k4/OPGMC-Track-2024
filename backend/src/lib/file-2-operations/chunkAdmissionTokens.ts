/**
 * ADMISSION DATA PARSING PATTERNS
 * ================================
 *
 * The admission block contains variable-length data structured as:
 * [admission_status_tokens...] [admitted_college_tokens...] [admitted_subject_tokens...]
 *
 * RULES:
 * 1. admission_status starts with "ALL INDIA" or "PG" or "PMN"
 *    - If starts with "ALL": join all tokens → "ALL INDIA ADM"
 *      Then set: admitted_course, admitted_college, admitted_subject = "nil"
 *    - If starts with "P": join until token ending with "HA" or "A" → "PG MEDICAL ODISHA" or "PMN DIPLOMA"
 *      Then: admitted_course = admission_status (duplicate)
 *            admitted_college = next 2-4 tokens after admission_status (college code + college name)
 *            admitted_subject = remaining 1-2 tokens
 *
 * 2. admitted_course = "nil" if ALL INDIA; else = admission_status
 * 3. admitted_college = "nil" if ALL INDIA; else = variable-length college tokens
 * 4. admitted_subject = "nil" if ALL INDIA; else = remaining tokens joined
 */
export default function chunkAdmissionTokens(
  tokens: string[]
): [string, string, string, string] {
  // Input: array of admission-block tokens (category and round already removed by caller)
  // Output: [admission_status, admitted_course, admitted_college, admitted_subject]

  if (tokens.length === 0) {
    return ["nil", "nil", "nil", "nil"];
  }

  // Step 1: Determine admission_status and find where it ends
  let admission_status = "nil";
  let admissionStatusEndIdx = 0;

  const firstToken = tokens[0];

  // Rule 1a: Check if admission_status starts with "ALL INDIA"
  if (firstToken.startsWith("A")) {
    // Join all tokens to form admission_status
    admission_status = tokens.join(" ");
    // When ALL INDIA: remaining columns are all "nil"
    return [admission_status, "nil", "nil", "nil"];
  }

  // Rule 1b: Check if admission_status starts with "P" (PG or PMN)
  if (firstToken.startsWith("P")) {
    // Find the token that ends with "IA" (ODISHA) or "A" (DIPLOMA, SURYA, etc)
    // We look for where the compound word ends
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      // Check if this token ends with "IA" or "A" (end of a regional/course name)
      if (token == "ODISHA" || token == "DIPLOMA") {
        admission_status = tokens.slice(0, i + 1).join(" ");
        admissionStatusEndIdx = i + 1; // next index after admission_status
        break;
      }
    }

    // If no clear ending found, fallback to first token
    if (admission_status === "nil") {
      admission_status = firstToken;
      admissionStatusEndIdx = 1;
    }

    // Rule 2b: For PG/PMN, admitted_course = admission_status
    const admitted_course = admission_status;

    // Step 2: Extract admitted_college and admitted_subject from remaining tokens
    const remainingTokens = tokens.slice(admissionStatusEndIdx);

    // College typically spans 2-4 tokens: e.g., "MKCG MCH BERHAMPUR" (3 tokens)
    // To handle variable length, we use a heuristic:
    // - College tokens are uppercase ACRONYMS followed by descriptive words
    // - Subject tokens are typically 1-2 tokens at the end
    // For simplicity: assume college is next 3 tokens, subject is the rest
    // (Adjust this based on your actual data patterns)

    let admitted_college = "nil";
    let admitted_subject = "nil";

    if (remainingTokens.length >= 1) {
      // Take the first N tokens as college (heuristic: 3 tokens)
      const collegeTokenCount = Math.min(3, remainingTokens.length - 1); // leave at least 1 for subject
      if (collegeTokenCount > 0) {
        admitted_college = remainingTokens
          .slice(0, collegeTokenCount)
          .join(" ");
      }
      // Remaining tokens are subject
      if (remainingTokens.length > collegeTokenCount) {
        admitted_subject = remainingTokens.slice(collegeTokenCount).join(" ");
      }
    }

    return [
      admission_status,
      admitted_course,
      admitted_college,
      admitted_subject,
    ];
  }

  // Fallback: if no clear pattern matched
  return ["nil", "nil", "nil", "nil"];
}
export function cleanRow(row: string) {
  // basic cleanup: remove surrounding quotes, normalize whitespace
  return row
    .replace(/^["']|["']$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isNumericToken(tok: string) {
  // allow integers or decimals
  return /^-?\d+(\.\d+)?$/.test(tok);
}
