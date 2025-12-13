# save as extract_admissions_to_js.py
import json
from pathlib import Path
import pdfplumber
from statistics import median

INPUT_PDF = "backend/test/MERIT_LIST_&_ADMISSION_STATUS_FOR_ROUN-5_CONVENER_1281_CONVENER_MAIL.pdf"
OUT_JS = "backend/test/admissions_by_page.js"

# tuning
X_TOL = 3
Y_TOL = 3
HEADER_SEARCH_TOP_RATIO = 0.20   # look at top 20% of page for headers
MIN_HEADER_TOKENS = {"ADMISSION", "STATUS", "ADMITTED", "COURSE", "COLLEGE", "SUBJECT"}

def normalize_text(t):
    if t is None: return "nil"
    s = t.strip()
    return s if s else "nil"

def find_header_anchors(words, page_height):
    """
    Find header tokens in the top part of the page and compute column centers.
    Returns a sorted list of header centers (x_center) with label where available.
    """
    top_limit = page_height * HEADER_SEARCH_TOP_RATIO
    header_words = [w for w in words if w["y_center"] <= top_limit]
    # map token text -> list of (x0,x1,center)
    header_candidates = []
    for w in header_words:
        txt = (w["text"] or "").upper()
        # keep short tokens likely to be headers
        if any(tok in txt for tok in MIN_HEADER_TOKENS) or len(txt) <= 12:
            x0 = float(w["x0"]); x1 = float(w["x1"])
            header_candidates.append({
                "text": txt,
                "x0": x0, "x1": x1, "center": (x0 + x1) / 2.0
            })
    if not header_candidates:
        return None

    # merge nearby header tokens by proximity (if they form multi-word headers like "ADMISSION STATUS")
    header_candidates.sort(key=lambda h: h["center"])
    merged = []
    cur = header_candidates[0].copy()
    for h in header_candidates[1:]:
        # if centers are very close horizontally, merge (same header phrase)
        if abs(h["center"] - cur["center"]) < 20:  # 20 px tolerance for same header token cluster
            # extend cur bounds and append token text
            cur["x0"] = min(cur["x0"], h["x0"])
            cur["x1"] = max(cur["x1"], h["x1"])
            cur["center"] = (cur["x0"] + cur["x1"]) / 2.0
            cur["text"] = (cur["text"] + " " + h["text"]).strip()
        else:
            merged.append(cur)
            cur = h.copy()
    merged.append(cur)

    # keep only clusters that contain header keywords (ADMISSION/ADMITTED/COURSE/COLLEGE/SUBJECT/STATUS)
    merged = [m for m in merged if any(tok in m["text"] for tok in MIN_HEADER_TOKENS)]

    # sort by x center and return
    merged.sort(key=lambda m: m["center"])
    return merged if merged else None

def compute_column_boundaries(header_anchors, page_width):
    """
    Given header anchor centers sorted left->right, compute column boundary intervals.
    Returns list of (col_name_hint, x_min, x_max, center)
    col_name_hint is the header anchor text (uppercased) if available.
    """
    centers = [h["center"] for h in header_anchors]
    texts = [h["text"] for h in header_anchors]
    boundaries = []
    # boundaries between adjacent centers are midpoints
    splits = []
    for a, b in zip(centers, centers[1:]):
        splits.append((a + b) / 2.0)
    # leftmost to first split, between splits, last split to rightmost
    edges = []
    left_edge = 0.0
    for s in splits:
        edges.append((left_edge, s))
        left_edge = s
    edges.append((left_edge, page_width))
    # If number of edges != number of anchors, fallback to small padding around centers
    if len(edges) != len(centers):
        out = []
        for h in header_anchors:
            x_min = max(0.0, h["x0"] - 10)
            x_max = min(page_width, h["x1"] + 10)
            out.append((h["text"], x_min, x_max, h["center"]))
        return out

    # zip anchors with edges
    for text, (x_min, x_max), center in zip(texts, edges, centers):
        out_text = text.upper()
        out_min = max(0.0, x_min - 1)
        out_max = min(page_width, x_max + 1)
        boundaries.append((out_text, out_min, out_max, center))
    return boundaries

def group_words_into_lines(words):
    """
    Group words into visual lines using y_center clustering.
    Returns list of lines: each line is list of words sorted by x0.
    """
    if not words:
        return []
    # get typical line height from word boxes (median of bottom-top)
    heights = [abs(w["bottom"] - w["top"]) for w in words if (w["bottom"] - w["top"]) > 0]
    line_height = median(heights) if heights else 10
    tol = max(2.0, line_height * 0.6)

    # sort words by y_center then x0
    words_sorted = sorted(words, key=lambda w: (w["y_center"], w["x0"]))
    lines = []
    cur_y = words_sorted[0]["y_center"]
    cur_line = [words_sorted[0]]
    for w in words_sorted[1:]:
        if abs(w["y_center"] - cur_y) <= tol:
            cur_line.append(w)
            # update current y as median of line
            cur_y = median([x["y_center"] for x in cur_line])
        else:
            # finish current line
            cur_line_sorted = sorted(cur_line, key=lambda x: x["x0"])
            lines.append(cur_line_sorted)
            # start new line
            cur_line = [w]
            cur_y = w["y_center"]
    if cur_line:
        cur_line_sorted = sorted(cur_line, key=lambda x: x["x0"])
        lines.append(cur_line_sorted)
    return lines

def assemble_rows_from_lines(lines):
    """
    Merge lines into logical rows. For many tables a single line == a single row.
    We keep as-is (one line = one row) but also support merging consecutive small vertical gaps if they appear.
    Returns rows: list of words lists (flattened).
    """
    # For simplicity, treat each visual line as a row.
    # More complex merging (multi-line cells) will later be handled by grouping tokens by column and joining.
    return lines

def assign_tokens_to_columns(row_words, col_boundaries):
    """
    For a single logical row (list of word dicts), assign tokens to each column.
    Returns dict col_texts: {col_hint_text: "joined text", ...}
    """
    # compute token centers
    tokens = []
    for w in row_words:
        x0 = float(w["x0"]); x1 = float(w["x1"])
        center = (x0 + x1) / 2.0
        tokens.append((w, x0, x1, center))

    col_texts = {c[0]: [] for c in col_boundaries}
    # fallback column order keys if needed
    col_order = [c[0] for c in col_boundaries]

    for w, x0, x1, center in tokens:
        # find column with which this token overlaps the most (by center falling in boundary)
        assigned = None
        for col_text, xmin, xmax, _ in col_boundaries:
            if center >= xmin and center <= xmax:
                assigned = col_text
                break
        if assigned is None:
            # fallback to nearest center
            dists = [(abs(center - c[3]), c[0]) for c in col_boundaries]
            assigned = sorted(dists, key=lambda x: x[0])[0][1]
        col_texts[assigned].append((x0, w["text"]))

    # join tokens by x0 order and normalize
    for k in list(col_texts.keys()):
        if col_texts[k]:
            col_texts[k] = " ".join([t[1] for t in sorted(col_texts[k], key=lambda x: x[0])]).strip()
        else:
            col_texts[k] = "nil"
    return col_texts

def extract_admission_columns_from_page(page):
    """
    Given a pdfplumber Page object, return an array of row-objects:
      { admission_status, admitted_course, admitted_college, admitted_subject }
    """
    page_width = float(page.width)
    # extract words
    words_raw = page.extract_words(x_tolerance=X_TOL, y_tolerance=Y_TOL, keep_blank_chars=False, use_text_flow=False)
    # normalize structure
    words = []
    for w in words_raw:
        try:
            text = w.get("text", "") or ""
            words.append({
                "text": text.strip() if text.strip() else "nil",
                "x0": float(w.get("x0", 0)),
                "x1": float(w.get("x1", 0)),
                "top": float(w.get("top", 0)),
                "bottom": float(w.get("bottom", 0)),
                "y_center": (float(w.get("top", 0)) + float(w.get("bottom", 0))) / 2.0
            })
        except Exception:
            continue

    if not words:
        return []

    header_anchors = find_header_anchors(words, page.height)
    if not header_anchors:
        # fallback: compute 5 equal-width columns across page (best-effort)
        step = page_width / 6.0
        col_boundaries = []
        for i in range(4):
            x_min = i * step
            x_max = (i + 1) * step
            col_boundaries.append((f"C{i}", x_min, x_max, (x_min + x_max) / 2.0))
    else:
        col_boundaries = compute_column_boundaries(header_anchors, page_width)

    # We want specifically these four logical columns. Try to map header hints to desired target columns.
    # Determine mapping: find which header hint contains 'ADMISSION'/'STATUS' -> admission_status,
    # contains 'COURSE' -> admitted_course, 'COLLEGE' -> admitted_college, 'SUBJECT' -> admitted_subject.
    target_names = ["admission_status", "admitted_course", "admitted_college", "admitted_subject"]
    mapped_cols = {}  # target_name -> (hint, xmin, xmax, center)
    # default: take last four columns if header_anchors present else first four equal bands
    for hint, xmin, xmax, center in col_boundaries:
        up = hint.upper()
        if "ADMISSION" in up or "STATUS" in up:
            mapped_cols["admission_status"] = (hint, xmin, xmax, center)
        elif "COURSE" in up:
            mapped_cols["admitted_course"] = (hint, xmin, xmax, center)
        elif "COLLEGE" in up:
            mapped_cols["admitted_college"] = (hint, xmin, xmax, center)
        elif "SUBJECT" in up:
            mapped_cols["admitted_subject"] = (hint, xmin, xmax, center)

    # fallback assignment if any target missing: assign by proximity from right-to-left
    if len(mapped_cols) < 4:
        # sort col_boundaries right->left (most tables have admission status more left)
        sorted_cols = sorted(col_boundaries, key=lambda x: x[3])  # left to right
        # attempt smart defaults: assume columns toward right are college/subject/category/round
        # pick 4 right-most as candidates
        candidates = sorted_cols[-4:]
        # map them heuristically
        heur_map = ["admission_status", "admitted_course", "admitted_college", "admitted_subject"]
        for targ, cand in zip(heur_map, candidates):
            if targ not in mapped_cols:
                mapped_cols[targ] = cand

    # ensure final col order left->right using their centers
    final_cols = sorted([(mapped_cols[k][0], mapped_cols[k][1], mapped_cols[k][2], mapped_cols[k][3], k) for k in mapped_cols],
                        key=lambda x: x[3])

    # group words into lines -> rows
    lines = group_words_into_lines(words)
    rows = assemble_rows_from_lines(lines)

    page_results = []
    for row_words in rows:
        # assign tokens to our detected columns
        # note: assign_tokens_to_columns expects a list of tuples, so we can reuse it by constructing col_boundaries for this page
        col_bounds_for_assign = [(c[0], c[1], c[2], c[3]) for c in final_cols]
        col_texts = assign_tokens_to_columns(row_words, col_bounds_for_assign)
        # map col_texts keys (hint texts) back to our target names via final_cols mapping
        # final_cols entries: (hint, xmin, xmax, center, target_name)
        out_obj = {"admission_status": "nil", "admitted_course": "nil", "admitted_college": "nil", "admitted_subject": "nil"}
        for hint, xmin, xmax, center, target in final_cols:
            text_val = col_texts.get(hint, "nil")
            # normalize and set
            out_obj[target] = normalize_text(text_val)
        # if entire row is nil for all four, skip it (likely header or blank)
        if all(out_obj[k] == "nil" for k in out_obj):
            continue
        page_results.append(out_obj)

    return page_results

def main():
    p = Path(INPUT_PDF)
    assert p.exists(), f"{INPUT_PDF} not found"
    pages_data = []  # array where each element is array of row-objects for that page

    with pdfplumber.open(str(p)) as pdf:
        for page in pdf.pages:
            page_no = page.page_number
            page_rows = extract_admission_columns_from_page(page)
            pages_data.append(page_rows)

    # write JS file initializing `const data = ...;`
    outp = Path(OUT_JS)
    with outp.open("w", encoding="utf-8") as fout:
        fout.write("const data = ")
        json_text = json.dumps(pages_data, ensure_ascii=False, indent=2)
        fout.write(json_text)
        fout.write(";\n")
    print(f"Wrote admissions for {len(pages_data)} pages to {OUT_JS}")

if __name__ == "__main__":
    main()
