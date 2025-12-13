# extract_pdf_fragments_to_js.py
import json
from pathlib import Path
import pdfplumber

INPUT_PDF = "backend/test/MERIT_LIST_&_ADMISSION_STATUS_FOR_ROUN-5_CONVENER_1281_CONVENER_MAIL.pdf"
OUT_JS = "backend/test/pdf_fragments.js"

# Tweak if words merge/split incorrectly
X_TOL = 3
Y_TOL = 3

def normalize_text(t):
    """
    Convert empty or whitespace-only text to 'nil'.
    """
    if t is None:
        return "nil"
    cleaned = t.strip()
    return cleaned if cleaned else "nil"

def fragment_from_word(w, page_number):
    x0 = float(w.get("x0", 0))
    x1 = float(w.get("x1", 0))
    top = float(w.get("top", 0))
    bottom = float(w.get("bottom", 0))

    return {
        "text": normalize_text(w.get("text", "")),
        "x0": x0,
        "x1": x1,
        "top": top,
        "bottom": bottom,
        "y_center": (top + bottom) / 2.0,
        "page": page_number
    }

def extract_fragments_grouped_by_page(pdf_path, out_js_path):
    p = Path(pdf_path)
    assert p.exists(), f"{pdf_path} not found"

    pages_fragments = []  # array of pages → each page is an array of fragment objects

    with pdfplumber.open(str(p)) as pdf:
        for page in pdf.pages:
            page_no = page.page_number

            # Extract all words on the page
            words = page.extract_words(
                x_tolerance=X_TOL,
                y_tolerance=Y_TOL,
                keep_blank_chars=False,
                use_text_flow=False
            )

            # Convert each word into a fragment dict
            fragments = [fragment_from_word(w, page_no) for w in words]

            # Even if the page has no words, keep a placeholder to maintain page order
            if not fragments:
                fragments = [{"text": "nil", "x0": 0, "x1": 0, "top": 0, "bottom": 0, "y_center": 0, "page": page_no}]

            pages_fragments.append(fragments)

    # Write final JS file as:  const data = [...]
    with open(out_js_path, "w", encoding="utf-8") as fout:
        json_text = json.dumps(pages_fragments, ensure_ascii=False, indent=2)
        fout.write("const data = ")
        fout.write(json_text)
        fout.write(";\n")

    print(f"Done. Wrote {len(pages_fragments)} pages to {out_js_path}")

if __name__ == "__main__":
    extract_fragments_grouped_by_page(INPUT_PDF, OUT_JS)
