import test from "node:test";
import assert from "node:assert/strict";
import { lockDocumentScroll } from "../src/utils/scrollLock.js";
test("overlapping room and dialog locks restore original overflow regardless of teardown order", () => {
  globalThis.document = { body: { style: { overflow: "auto" } } };

  const room = lockDocumentScroll(),
    dialog = lockDocumentScroll();

  room();
  assert.equal(document.body.style.overflow, "hidden");
  dialog();
  assert.equal(document.body.style.overflow, "auto");
  dialog();

  const next = lockDocumentScroll();

  assert.equal(document.body.style.overflow, "hidden");
  next();
  assert.equal(document.body.style.overflow, "auto");
  delete globalThis.document;
});
