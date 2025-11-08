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