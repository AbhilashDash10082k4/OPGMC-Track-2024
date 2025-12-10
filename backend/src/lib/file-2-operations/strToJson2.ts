import chunkAdmissionTokens, { cleanRow, isNumericToken } from "./chunkAdmissionTokens";

export function parseRowsToJson(rows: string[]) {
  const TYPE_TOKENS = new Set(["DIR", "INS", "SC", "ST", "OBC", "EWS"]);
  const CATEGORY_PATTERNS = /^(UR|OBC|SC|ST|EWS|PH|GENERAL)$/i;

  const headers = [
    "serial_no",
    "neet_pg_roll_no",
    "percentile",
    "state_appln_no",
    "name",
    "type",
    "old_composite_cmr_r_3",
    "composite_new_cmr_spl_stray",
    "new_cmr_ins_cmr_spl_stray",
    "new_dir_cmr_spl_stray",
    "new_dip_cmr_spl_stray",
    "admission_status",
    "admitted_course",
    "admitted_college",
    "admitted_subject",
    "admitted_category",
    "admitted_round"
  ];
  const results = [];

  for (const raw of rows) {
    const row = cleanRow(raw);
    if (!row) continue;
    const toks = row.split(" ");
    const obj = Object.fromEntries(headers.map(h => [h, "nil"])); // initialize with nil

    // left-fixed fields (safe positions)
    obj.serial_no = toks[0] ?? "nil";
    obj.neet_pg_roll_no = toks[1] ?? "nil";
    obj.percentile = toks[2] ?? "nil";
    obj.state_appln_no = toks[3] ?? "nil";

    // find TYPE token index (first token after state_appln_no that matches known TYPE tokens)
    // If TYPE tokens are not consistent in your data, fallback to finding first uppercase 3-letter token like DIR/INS.
    let typeIdx = -1;
    for (let i = 4; i < toks.length; i++) {
      const up = toks[i].toUpperCase();
      if (TYPE_TOKENS.has(up) || /^(DIR|INS|DR|ST|SR)$/.test(up)) {
        typeIdx = i;
        break;
      }
    }
    if (typeIdx === -1) {
      // fallback: maybe type is at index 5; set to 5 if exists
      if (toks.length > 5) typeIdx = 5;
      else typeIdx = toks.length - 1;
    }

    // Name is tokens from index 4 up to (typeIdx-1)
    const nameTokens = toks.slice(4, typeIdx);
    obj.name = nameTokens.join(" ") || "nil";
    obj.type = toks[typeIdx] ?? "nil";

    // After type: collect up to 5 numeric merit tokens
    const meritStart = typeIdx + 1;
    const meritTokens = [];
    for (let i = meritStart; i < toks.length && meritTokens.length <= 5; i++) {
      if (isNumericToken(toks[i])) {
        meritTokens.push(toks[i]);
      } else {
        break;
      }
    }
    // map merit tokens to columns
    const meritCols = headers.slice(6,11);
    for (let i = 0; i < meritCols.length; i++) {
      obj[meritCols[i]] = (meritTokens[i] !== undefined) ? meritTokens[i] : "nil";
    }

    // Admission block tokens: everything after (meritStart + meritTokens.length)
    // Extract category and round from the END of the token stream first (they're anchors)
    const admissionStartIndex = meritStart + meritTokens.length;
    const admissionTokens = toks.slice(admissionStartIndex).filter(t => t !== "");

    // STEP 1: Parse from RIGHT to extract category and round (fixed anchors)
    let admitted_round = "nil";
    let admitted_category = "nil";
    let admissionLeft = admissionTokens.slice();

    if (admissionLeft.length > 0) {
      // Rightmost token should be numeric round (e.g., "1")
      const last = admissionLeft[admissionLeft.length - 1];
      if (/^\d+$/.test(last)) {
        admitted_round = last;
        admissionLeft.pop();
      }
      // Next rightmost should be category (e.g., "UR", "OBC", "SC", etc.)
      if (admissionLeft.length > 0) {
        const maybeCat = admissionLeft[admissionLeft.length - 1];
        if (CATEGORY_PATTERNS.test(maybeCat.toUpperCase())) {
          admitted_category = maybeCat;
          admissionLeft.pop();
        }
      }
    }

    // STEP 2: Parse remaining tokens for admission_status, course, college, subject
    // The remaining tokens form: [admission_status_tokens...] [college_tokens...] [subject_tokens...]
    const [admission_status, admitted_course, admitted_college, admitted_subject] = 
      chunkAdmissionTokens(admissionLeft);

    obj.admission_status = admission_status;
    obj.admitted_course = admitted_course;
    obj.admitted_college = admitted_college;
    obj.admitted_subject = admitted_subject;
    obj.admitted_category = admitted_category;
    obj.admitted_round = admitted_round;

    results.push(obj);
  }

  return results;
}
