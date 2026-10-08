"""Build deterministic, reviewed curriculum mappings; never use fuzzy matches.

Run from the frontend directory. The source vocabulary is the unchanged Excel
extraction. Supply --dataset for a different local fast-api-trans-vsl directory.
"""
import argparse
import csv
import hashlib
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def key(text):
    return re.sub(r"\s+", " ", re.sub(r"[^\w\sđ]", " ", unicodedata.normalize("NFC", text).casefold())).strip()


def build(dataset):
    source_path = ROOT / "src/data/theoryVocabulary.json"
    source = json.loads(source_path.read_text(encoding="utf-8"))
    choices = json.loads((ROOT / "scripts/theory_mapping_choices.json").read_text(encoding="utf-8"))
    labels_path = dataset / "data/kaggle_metadata/labels.csv"
    labels = {}
    with labels_path.open(encoding="utf-8-sig", newline="") as stream:
        for row in csv.DictReader(stream):
            labels.setdefault(key(row["LABEL"]), (row["LABEL"].strip(), row["VIDEO"].strip()))
    all_rows = []
    topics = {}
    excel_row = 2
    for topic, levels in source.items():
        topics[topic] = {}
        equivalents = choices["equivalents"].get(topic, {})
        replacements = choices["replacements"].get(topic, {})
        pool = choices["topicPools"].get(topic, [])
        for target in [*equivalents.values(), *replacements.values(), *pool]:
            if key(target) not in labels:
                raise ValueError(f"Missing approved label: {topic}: {target}")
        used_topic = set()
        for level, terms in levels.items():
            # Preserve original exact matches before assigning alternatives.
            used = {key(term) for term in terms if key(term) in labels and term not in equivalents}
            alias_targets = {key(equivalents[term]) for term in terms if term in equivalents}
            reserved = used | alias_targets
            rows = []
            for order, term in enumerate(terms, 1):
                target = term
                kind = "exact"
                if term in equivalents or key(term) not in labels:
                    target = equivalents.get(term)
                    kind = "equivalent"
                    if not target or key(target) in used:
                        target = replacements.get(term)
                        kind = "replacement"
                        if not target or key(target) in used or key(target) in reserved:
                            candidates = [value for value in pool if key(value) not in used and key(value) not in reserved]
                            target = next((value for value in candidates if key(value) not in used_topic), None)
                            target = target or next(iter(candidates), None)
                        if not target:
                            raise ValueError(f"No distinct same-topic alternative: {topic}/{level}/{term}")
                label, filename = labels[key(target)]
                video = dataset / "data/kaggle_dataset/videos" / filename
                if not video.is_file() or not video.stat().st_size:
                    raise ValueError(f"Missing video: {label}: {video}")
                display = term if kind != "replacement" else label[0].upper() + label[1:]
                row = {"sourceTerm": term, "term": display, "videoLabel": label,
                       "matchType": kind, "filename": filename,
                       "sourceRow": excel_row, "sourceOrder": order}
                rows.append(row)
                all_rows.append({"topic": topic, "level": level, **row})
                used.add(key(label))
                used_topic.add(key(label))
                excel_row += 1
            topics[topic][level] = rows
            if len({key(row["videoLabel"]) for row in rows}) != len(rows):
                raise ValueError(f"Repeated learning item in {topic}/{level}")
    output = {"version": 2, "sourceWorkbook": "Danh_sach_tu_vung_SignMate.xlsx",
              "sourceSheet": "Tu_vung_SignMate", "sourceRange": "A2:D651",
              "sourceVocabularySha256": hashlib.sha256(source_path.read_bytes()).hexdigest(),
              "datasetLabelsSha256": hashlib.sha256(labels_path.read_bytes()).hexdigest(),
              "topics": topics}
    (ROOT / "src/data/theoryVocabularyMap.json").write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    counts = Counter(row["matchType"] for row in all_rows)
    report = ["# Đối chiếu từ vựng bài học", "",
              "Nguồn: `Danh_sach_tu_vung_SignMate.xlsx`, sheet `Tu_vung_SignMate`, A2:D651. File Excel và bản trích từ vựng gốc không thay đổi.", "",
              f"Tổng {len(all_rows)} mục: {counts['exact']} khớp nhãn, {counts['equivalent']} tên tương đương, {counts['replacement']} thay bằng mục khác cùng chủ đề.", "",
              "Tên tương đương giữ nội dung gốc. Mục thay thế là một nội dung học khác, không được coi là bản dịch của từ gốc; giao diện hiển thị tên mới đúng với video. Giữ nhóm chủ đề, cấp độ và số mục; không lặp videoLabel trong cùng nhóm. Một số nhãn có thể xuất hiện lại ở cấp độ khác để ôn tập.", "",
              "Các số 13–20 được thay bằng 23, 33, 40, 80, 90, 100, Số chẵn, Số lẻ; tab đổi thành Số & số đếm. Chữ cái giữ nguyên 29 mục.", "",
              "Bảng dưới ghi các mục đổi nhãn. Toàn bộ 650 ánh xạ, dòng nguồn và tên file video nằm trong `src/data/theoryVocabularyMap.json`. Các phương án cùng chủ đề được chọn trong danh sách tường minh ở `scripts/theory_mapping_choices.json`, không dùng fuzzy match hay AI để quyết định lúc chạy.", ""]
    for topic, levels in topics.items():
        report.extend([f"## {topic}", "", "| Cấp độ | Dòng Excel | Từ gốc | Nhãn video | Loại |", "|---|---:|---|---|---|"])
        for level, rows in levels.items():
            for row in rows:
                if row["matchType"] != "exact":
                    report.append(f"| {level} | {row['sourceRow']} | {row['sourceTerm']} | {row['videoLabel']} | {'Tên tương đương' if row['matchType'] == 'equivalent' else 'Thay cùng chủ đề'} |")
        report.append("")
    (ROOT / "docs/THEORY_VOCABULARY_MAPPING.md").write_text("\n".join(report), encoding="utf-8")
    print(json.dumps({"total": len(all_rows), "counts": counts, "groups": sum(map(len, topics.values()))}, ensure_ascii=True))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", type=Path, default=ROOT.parent / "fast-api-trans-vsl")
    build(parser.parse_args().dataset)
