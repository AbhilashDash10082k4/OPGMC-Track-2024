import json
from pathlib import Path
from statistics import mean

INPUT_JS = Path("backend/test/pdf_fragments.js")
OUT_JS = Path("backend/test/pdf_admissions_by_page.js")

# parameters for grouping tokens into rows (tweak if needed)
Y_CLUSTER_TOL = 6.0    # tokens with y_center within this go to same row
HEADER_SEARCH_Y_TOP = 150  # only look near top area for header tokens (approx), tweak per PDF

def load_data_from_js(js_path: Path):
    txt = js_path.read_text(encoding="utf-8")
    start = txt.find("=")
    if start == -1:
        raise ValueError("Can't find '=' in JS file - expected 'const data = ...'")
    json_part = txt[start+1:].strip()
    # remove trailing semicolon if present
    if json_part.endswith(";"):
        json_part = json_part[:-1]
    return json.loads(json_part)

def normalize_text(s: str):
    if s is None:
        return "nil"
    s = s.strip()
    return s if s else "nil"

def cluster_rows(fragments):
    """
    Given a list of fragment dicts for a page, group them into rows by y_center.
    Returns list of row lists (each row is list of fragments).
    """
    if not fragments:
        return []
    frags = sorted(fragments, key=lambda f: f["y_center"])
    rows = []
    current_row = [frags[0]]
    current_center = frags[0]["y_center"]
    for f in frags[1:]:
        if abs(f["y_center"] - current_center) <= Y_CLUSTER_TOL:
            current_row.append(f)
            current_center = mean([x["y_center"] for x in current_row])
        else:
            rows.append(sorted(current_row, key=lambda x: x["x0"]))
            current_row = [f]
            current_center = f["y_center"]
    if current_row:
        rows.append(sorted(current_row, key=lambda x: x["x0"]))
    return rows

def find_header_columns(page_fragments):
    """
    Inspect top-of-page fragments to detect header x-ranges for
    Admission/Admitted columns. Returns a dict:
      { 'admission_status': (x0,x1), 'admitted_course': (x0,x1), ... }
    If detection fails, returns sensible default ranges based on observation.
    """
    # look for known header tokens around top area
    header_tokens = [f for f in page_fragments if f["y_center"] < HEADER_SEARCH_Y_TOP]
    # join tokens by y_center to form header rows
    header_rows = cluster_rows(header_tokens)
    # flatten header token texts with positions to search for keywords
    header_positions = {}
    keywords_map = {
        "admission_status": ("ADMISSION", "STATUS"),
        "admitted_course": ("COURSE",),
        "admitted_college": ("COLLEGE",),
        "admitted_subject": ("SUBJECT",)
    }
    for hr in header_rows:
        for token in hr:
            t = token["text"].upper().strip()
            for col_key, kws in keywords_map.items():
                if any(k in t for k in kws):
                    # expand range a little to form column bbox
                    padding = 6
                    header_positions.setdefault(col_key, []).append((token["x0"]-padding, token["x1"]+padding))
    # collapse lists into single bbox per header (min x0, max x1)
    columns = {}
    for k, ranges in header_positions.items():
        x0 = min(r[0] for r in ranges)
        x1 = max(r[1] for r in ranges)
        columns[k] = (x0, x1)
    # fallback defaults (observed in this PDF). Tweak if your PDF differs.
    fallback = {
        "admission_status": (460, 525),
        "admitted_course": (540, 600),
        "admitted_college": (595, 665),
        "admitted_subject": (645, 740)
    }
    for k, rng in fallback.items():
        if k not in columns:
            columns[k] = rng
    return columns

def token_to_column(token, columns):
    """
    Assign token to a column using x0/x1 overlap or nearest header center.
    """
    tx0, tx1 = token.get("x0", 0), token.get("x1", 0)
    tcenter = (tx0 + tx1) / 2.0
    # direct overlap test
    overlaps = []
    for col, (cx0, cx1) in columns.items():
        # if horizontal overlap
        if (tx0 <= cx1 and tx1 >= cx0):
            overlaps.append(col)
    if len(overlaps) == 1:
        return overlaps[0]
    if len(overlaps) > 1:
        # choose the column whose center is nearest
        col_centers = {c: (columns[c][0]+columns[c][1])/2.0 for c in overlaps}
        return min(col_centers.keys(), key=lambda c: abs(col_centers[c]-tcenter))
    # no overlap — fallback to nearest column by center distance
    centers = {c: (columns[c][0]+columns[c][1])/2.0 for c in columns}
    return min(centers.keys(), key=lambda c: abs(centers[c]-tcenter))

def build_row_object(row_tokens, columns):
    """
    row_tokens: list of fragment dicts sorted by x0 for that row
    columns: column ranges dict
    returns object with keys: admission_status, admitted_course, admitted_college, admitted_subject
    """
    accumulator = {k: [] for k in columns.keys()}
    for tok in row_tokens:
        col = token_to_column(tok, columns)
        accumulator[col].append(tok)
    # for each column, join tokens (sorted by x0) to a single string, or "nil"
    out = {}
    for k, toks in accumulator.items():
        if not toks:
            out[k] = "nil"
        else:
            toks_sorted = sorted(toks, key=lambda t: t["x0"])
            joined = " ".join(t["text"] for t in toks_sorted).strip()
            out[k] = joined if joined else "nil"
    # map to desired key names in final output
    return {
        "admission_status": out.get("admission_status", "nil"),
        "admitted_course": out.get("admitted_course", "nil"),
        "admitted_college": out.get("admitted_college", "nil"),
        "admitted_subject": out.get("admitted_subject", "nil")
    }

def convert_pages(data_pages):
    """
    data_pages: list of pages; each page is list of fragment objects
    returns list-of-pages where each page is list of row-objects (with the 4 keys)
    """
    pages_out = []
    for page_idx, page_frags in enumerate(data_pages, start=1):
        if not page_frags:
            pages_out.append([])
            continue
        # detect header columns for this page
        columns = find_header_columns(page_frags)
        # group page fragments into rows by y_center
        rows = cluster_rows(page_frags)
        # skip header rows (heuristic): remove rows that contain header keywords
        cleaned_rows = []
        for r in rows:
            texts = " ".join(t["text"].upper() for t in r)
            # if header-like, skip
            if any(h in texts for h in ["ADMISSION", "ADMITTED", "COURSE", "COLLEGE", "SUBJECT", "NAME OF THE CANDIDATE"]):
                continue
            cleaned_rows.append(r)
        # now build objects per row
        page_objects = [build_row_object(r, columns) for r in cleaned_rows]
        pages_out.append(page_objects)
    return pages_out

def write_output_js(pages_out, out_path: Path):
    obj = pages_out
    with out_path.open("w", encoding="utf-8") as fout:
        fout.write("const admissionsByPage = ")
        json.dump(obj, fout, ensure_ascii=False, indent=2)
        fout.write(";\n")
    print(f"Wrote {out_path} with {len(obj)} pages.")

def main():
    data_pages = load_data_from_js(INPUT_JS)
    pages_out = convert_pages(data_pages)
    write_output_js(pages_out, OUT_JS)

if __name__ == "__main__":
    main()
