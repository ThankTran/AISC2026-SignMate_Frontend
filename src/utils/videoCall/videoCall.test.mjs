import assert from "node:assert/strict";
import test from "node:test";
import { formatTime } from "./formatTime.js";
import { findAvailablePartner, toggleSelection } from "./selection.js";

const partners = [{ id: "first" }, { id: "second" }, { id: "third" }];

test("formats the call timer across minute boundaries", () => {
  assert.equal(formatTime(0), "00:00");
  assert.equal(formatTime(59), "00:59");
  assert.equal(formatTime(60), "01:00");
  assert.equal(formatTime(872), "14:32");
});

test("topic and feedback toggles do not mutate the original selection", () => {
  const original = ["Gia đình"];

  assert.deepEqual(toggleSelection(original, "Du lịch"), ["Gia đình", "Du lịch"]);
  assert.deepEqual(toggleSelection(original, "Gia đình"), []);
  assert.deepEqual(original, ["Gia đình"]);
});

test("matching retains the current partner unless another is requested", () => {
  assert.equal(findAvailablePartner(partners, 0, [], false), 0);
  assert.equal(findAvailablePartner(partners, 0, [], true), 1);
  assert.equal(findAvailablePartner(partners, 2, [], true), 0);
});

test("matching never selects a blocked profile", () => {
  assert.equal(findAvailablePartner(partners, 0, ["second"], true), 0);
  assert.equal(findAvailablePartner(partners, 0, ["first", "second"], false), 2);
  assert.equal(findAvailablePartner(partners, 0, ["first", "second", "third"], true), -1);
  assert.equal(findAvailablePartner([], 0, [], true), -1);
});
