# save as extract_pdf_fragments.py
import json
import pdfplumber
from pathlib import Path

INPUT_PDF = "backend/test/MERIT_LIST_&_ADMISSION_STATUS_FOR_ROUN-5_CONVENER_1281_CONVENER_MAIL.pdf"
OUT_JSONL = "backend/test/pdf_fragments.jsonl"

# Tweak these if words are getting merged/split badly:
X_TOL = 3        # default x tolerance for grouping characters into words
Y_TOL = 3        # default y tolerance for grouping characters into lines

def fragment_from_word(w, page_number):
    # pdfplumber's extract_words returns keys: text, x0, x1, top, bottom, etc.
    x0 = float(w.get("x0", 0))
    x1 = float(w.get("x1", 0))
    top = float(w.get("top", 0))
    bottom = float(w.get("bottom", 0))
    return {
        "text": w.get("text", "").strip(),
        "x0": x0,
        "x1": x1,
        "top": top,
        "bottom": bottom,
        "y_center": (top + bottom) / 2.0,
        "page": page_number
    }

def extract_fragments(pdf_path, out_path):
    p = Path(pdf_path)
    assert p.exists(), f"{pdf_path} not found"
    with pdfplumber.open(str(p)) as pdf, open(out_path, "w", encoding="utf-8") as fout:
        for page in pdf.pages:
            page_no = page.page_number  # 1-based
            # get word-level fragments. If you need finer-grain, use page.chars
            words = page.extract_words(x_tolerance=X_TOL, y_tolerance=Y_TOL, keep_blank_chars=False, use_text_flow=False)
            # words is a list of dicts like {"text":"ABC","x0":..., "x1":..., "top":..., "bottom":...}
            for w in words:
                frag = fragment_from_word(w, page_no)
                fout.write(json.dumps(frag, ensure_ascii=False) + "\n")
    print("Done. Fragments written to", out_path)

if __name__ == "__main__":
    extract_fragments(INPUT_PDF, OUT_JSONL)
