import assert from "node:assert/strict";
import test from "node:test";
import { saveCallReport, saveCallReview } from "./demoSessionStorage.js";

test("persists demo reviews and reports under the existing session keys", () => {
  const values = new Map();
  const previous = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");

  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: { setItem: (key, value) => values.set(key, value) },
  });

  try {
    const review = {
      partner: "Linh Nguyễn",
      rating: 5,
      tags: ["Kiên nhẫn"],
      note: "",
      duration: 60,
    };
    const report = { partner: "Linh Nguyễn", reason: "Báo cáo thử nghiệm" };

    assert.equal(saveCallReview(review), true);
    assert.equal(saveCallReport(report), true);
    assert.deepEqual(JSON.parse(values.get("signmate-last-review")), review);
    assert.deepEqual(JSON.parse(values.get("signmate-demo-report")), report);
  } finally {
    if (previous) {
      Object.defineProperty(globalThis, "sessionStorage", previous);
    } else {
      delete globalThis.sessionStorage;
    }
  }
});

test("storage failure is returned to the caller instead of claiming success", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");

  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      setItem() {
        throw new Error("Storage unavailable");
      },
    },
  });

  try {
    assert.equal(saveCallReview({ rating: 5 }), false);
    assert.equal(saveCallReport({ reason: "test" }), false);
  } finally {
    if (previous) {
      Object.defineProperty(globalThis, "sessionStorage", previous);
    } else {
      delete globalThis.sessionStorage;
    }
  }
});
