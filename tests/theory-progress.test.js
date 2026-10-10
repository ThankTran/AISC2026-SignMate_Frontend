import test from "node:test";
import assert from "node:assert/strict";
import { readTheoryItems, markTheoryItem } from "../src/utils/theoryProgress.js";

const items = ["a", "b", "c", "d"].map((id) => ({ id }));

test("marking an automatically learned item again cannot reduce 50 percent progress", () => {
  let raw = '["a","b"]';
  for (const id of ["a", "a", "b", "c", "c", "d"]) {
    const before = readTheoryItems(raw, items, false).length;
    raw = markTheoryItem(raw, items, false, id);
    assert.ok(readTheoryItems(raw, items, false).length >= before);
  }
  assert.equal(readTheoryItems(raw, items, false).length, items.length);
});

test("successive video and manual marks preserve each other and survive reloading", () => {
  let raw = markTheoryItem("", items, false, "a");
  raw = markTheoryItem(raw, items, false, "b");
  assert.deepEqual(readTheoryItems(raw, items, false), ["a", "b"]);
  assert.equal(markTheoryItem(raw, items, false, "b"), raw);
});

test("server completion remains complete even with partial browser progress", () => {
  assert.equal(readTheoryItems('["a"]', items, true).length, 4);
  assert.equal(JSON.parse(markTheoryItem('["a"]', items, true, "b")).length, 4);
});

test("invalid and obsolete saved items cannot inflate completion", () => {
  assert.deepEqual(readTheoryItems("bad json", items, false), []);
  assert.deepEqual(readTheoryItems('["a","a","old"]', items, false), ["a"]);
  assert.equal(markTheoryItem("[]", items, false, "unknown"), "[]");
});
