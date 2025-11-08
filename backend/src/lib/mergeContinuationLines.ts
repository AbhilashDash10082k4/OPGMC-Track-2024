export function mergeContinuationLines(page: string[]): string[] {
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
export function mergeContinuationLinesForUrl2(lines: string[]): string[] {
  const merged: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Check if the line starts with 1–4 digits followed by a space
    if (/^\d{1,4}\s/.test(trimmed)) {
      merged.push(trimmed);
    } else if (merged.length > 0) {
      // Merge continuation line with the previous one
      merged[merged.length - 1] += " " + trimmed;
    } else {
      // Handle case if the first line isn't numeric
      merged.push(trimmed);
    }
  }

  return merged;
}
