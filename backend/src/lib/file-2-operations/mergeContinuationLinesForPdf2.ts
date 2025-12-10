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