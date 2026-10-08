import test from "node:test";
import assert from "node:assert/strict";
import source from "../src/data/theoryVocabulary.json" with { type: "json" };
import { groupsFor } from "../src/utils/theoryVocabulary.js";

test("all 650 source rows retain their topic, level, order and distinct video targets", () => {
  let count = 0;
  for (const [title, levels] of Object.entries(source)) {
    const groups = groupsFor({ title });
    assert.equal(groups.length, Object.keys(levels).length);
    Object.values(levels).forEach((terms, index) => {
      const mapped = groups[index].terms;
      assert.deepEqual(
        mapped.map((item) => item.sourceTerm),
        terms,
      );
      assert.equal(new Set(mapped.map((item) => item.videoLabel)).size, terms.length);
      mapped.forEach((item) => {
        assert.equal(item.sourceRow, ++count + 1);
        assert.ok(item.videoLabel && item.filename);
        if (item.matchType !== "replacement") assert.equal(item.term, item.sourceTerm);
        else assert.equal(item.term.toLowerCase(), item.videoLabel.toLowerCase());
      });
    });
  }
  assert.equal(count, 650);
});

test("UI aliases and canonical labels select the intended videos", () => {
  const [letters, numbers] = groupsFor({ title: "Bảng chữ & Số" });
  assert.equal(letters.terms.length, 29);
  assert.equal(numbers.terms.length, 21);
  assert.equal(numbers.terms.find((item) => item.sourceTerm === "13").term, "23");
  assert.equal(numbers.terms[0].videoLabel, "0 (số không)");
  const mother = groupsFor({ title: "Thành viên gia đình" })[0].terms.find(
    (item) => item.sourceTerm === "Mẹ",
  );
  assert.equal(mother.term, "Mẹ");
  assert.equal(mother.videoLabel, "má (giống: mẹ)");
  assert.ok(groupsFor({ title: "Màu sắc & Hình dạng" }).length);
  assert.ok(groupsFor({ title: "Biểu cảm cảm xúc" }).length);
  assert.deepEqual(groupsFor({ title: "Unknown" }), []);
});
