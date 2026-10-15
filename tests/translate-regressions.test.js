import test from "node:test";
import assert from "node:assert/strict";
import { replaceSentenceToken } from "../src/pages/TranslatePage/sentenceTokens.js";
import { createRequestLifecycle } from "../src/pages/TranslatePage/requestLifecycle.js";

test("replacement targets the selected repeated token and preserves punctuation", () => {
  const tokens = [{ text: "xin lỗi" }, { text: "lạ" }, { text: "lạ" }];
  assert.equal(replaceSentenceToken("Xin lỗi, lạ lạ!", tokens, 2, "chào"), "Xin lỗi, lạ chào!");
});

test("replacement supports decomposed Vietnamese and literal replacement characters", () => {
  assert.equal(
    replaceSentenceToken("lạ, lạ!".normalize("NFD"), [{ text: "lạ" }, { text: "lạ" }], 1, "$&"),
    "lạ, $&!",
  );
});

test("new requests and clear/unmount invalidate previous responses", () => {
  const requests = createRequestLifecycle();
  const first = requests.start();
  const second = requests.start();
  assert.equal(first.aborted, true);
  assert.equal(second.aborted, false);
  requests.cancel();
  assert.equal(second.aborted, true);
  assert.equal(requests.start().aborted, false);
});
