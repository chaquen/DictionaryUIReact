"""Builds src/data/ngsl/ngsl-1.2.json from the official NGSL 1.2 files.

Source (CC BY-SA 4.0): https://www.newgeneralservicelist.com/new-general-service-list
  - NGSL_12_stats.csv                     (lemma, SFI rank, SFI, adjusted frequency per million)
  - NGSL_12_with_English_definitions.xlsx (word, easy-English definition)

Changes made to the original data: both files are joined by word and reduced to
[term, rank, perMillion, definition] rows ordered by frequency rank.

Usage (standard library only):
  python3 scripts/build_ngsl.py NGSL_12_stats.csv NGSL_12_with_English_definitions.xlsx
"""

import csv
import json
import re
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
OUTPUT = Path(__file__).resolve().parent.parent / "src" / "data" / "ngsl" / "ngsl-1.2.json"


def read_definitions(xlsx_path):
    with zipfile.ZipFile(xlsx_path) as book:
        strings = [
            "".join(t.text or "" for t in si.iter(f"{{{NS['m']}}}t"))
            for si in ET.fromstring(book.read("xl/sharedStrings.xml")).findall("m:si", NS)
        ]
        definitions = {}
        sheet = ET.fromstring(book.read("xl/worksheets/sheet1.xml"))
        for index, row in enumerate(sheet.iter(f"{{{NS['m']}}}row")):
            if index == 0:  # header: "Word", "Definitons"
                continue
            cells = {}
            for cell in row.findall("m:c", NS):
                value = cell.find("m:v", NS)
                if value is None:
                    continue
                column = re.match(r"[A-Z]+", cell.get("r")).group()
                cells[column] = strings[int(value.text)] if cell.get("t") == "s" else value.text
            word, definition = cells.get("A", "").strip().lower(), cells.get("B", "").strip()
            if word:
                definitions[word] = definition
        return definitions


def main(stats_path, xlsx_path):
    definitions = read_definitions(xlsx_path)
    rows = []
    with open(stats_path, newline="", encoding="utf-8") as handle:
        for record in csv.DictReader(handle):
            term = record["Lemma"].strip().lower()
            rows.append([
                term,
                int(record["SFI Rank"]),
                float(record["Adjusted Frequency per Million (U)"]),
                definitions.get(term, ""),
            ])
    rows.sort(key=lambda r: r[1])
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    document = {
        "source": "New General Service List 1.2 (Browne, Culligan & Phillips), CC BY-SA 4.0",
        "url": "https://www.newgeneralservicelist.com",
        "columns": ["term", "rank", "perMillion", "definition"],
        "words": rows,
    }
    OUTPUT.write_text(json.dumps(document, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    missing = sum(1 for r in rows if not r[3])
    print(f"Wrote {len(rows)} words to {OUTPUT} ({missing} without definition)")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
