import test from "node:test";
import assert from "node:assert/strict";
import { uuid } from "../src/utils/uuid.js";

const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

test("UUID uses native implementation when available", () =>
  assert.equal(uuid({ randomUUID: () => "native" }), "native"));
test("UUID uses random bytes and sets version and variant in insecure contexts", () => {
  let used = false;

  assert.match(
    uuid({
      getRandomValues: (bytes) => {
        used = true;
        bytes.fill(255);
      },
    }),
    pattern,
  );
  assert.equal(used, true);
});
test("UUID last-resort fallback remains valid and unique for UI session IDs", () => {
  const values = Array.from({ length: 100 }, () => uuid(null));

  values.forEach((value) => assert.match(value, pattern));
  assert.equal(new Set(values).size, 100);
});
