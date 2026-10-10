import test from "node:test";
import assert from "node:assert/strict";
import { lessonSteps, connectorTone } from "../src/utils/lessonSteps.js";
import { initialProgress, deriveProgress, recordProgress } from "../src/utils/progress.js";

test("chapter stops count 01 through 06 instead of restarting each lesson", () => {
  const chapter = { lessons: [1, 2, 3].map((id) => ({ id, status: "active" })) };
  assert.deepEqual(
    lessonSteps(chapter).map((step) => step.number),
    ["01", "02", "03", "04", "05", "06"],
  );
});

test("unpublished assessment does not hide unlocked theory and cannot be taken", () => {
  const steps = lessonSteps({
    lessons: [{ id: 2, status: "locked", published: false, theoryUnlocked: true }],
  });
  assert.equal(steps[0].status, "active");
  assert.equal(steps[1].status, "locked");
});

test("persisted theory completion opens assessment on a new browser session", () => {
  const steps = lessonSteps({
    lessons: [{ id: 1, status: "active", published: true, theoryCompleted: true }],
  });
  assert.equal(steps[0].status, "completed");
  assert.equal(steps[1].status, "active");
});

test("theory and assessment complete their own quests at the 70 percent threshold", () => {
  const today = new Date("2026-10-10T12:00:00");
  const theory = recordProgress(initialProgress(), "theory", 1, { id: "theory", xp: 0 }, today);
  let progress = deriveProgress(theory, {}, today);
  assert.equal(progress.dailyQuests.find((q) => q.type === "lesson").done, true);
  assert.equal(progress.dailyQuests.find((q) => q.type === "quiz").done, false);
  assert.equal(progress.completedLessons, 0);
  const exam = recordProgress(
    initialProgress(),
    "lesson",
    1,
    { id: "exam", score: 70, passed: true, xp: 10 },
    today,
  );
  progress = deriveProgress(exam, {}, today);
  assert.equal(progress.dailyQuests.find((q) => q.type === "lesson").done, false);
  assert.equal(progress.dailyQuests.find((q) => q.type === "quiz").done, true);
  assert.equal(progress.nextLesson.id, 2);
});

test("passing an assessment does not overwrite an explicit incomplete theory state", () => {
  const steps = lessonSteps({ lessons: [{ id: 1, status: "completed", theoryCompleted: false }] });
  assert.equal(steps[0].status, "active");
  assert.equal(steps[1].status, "locked");
});

test("an unavailable assessment blocks all later stops even if the server marks them available", () => {
  const steps = lessonSteps({
    lessons: [
      { id: 1, status: "completed", theoryCompleted: true },
      { id: 2, status: "locked", theoryCompleted: true, theoryUnlocked: true, published: false },
      { id: 3, status: "active", theoryUnlocked: true },
    ],
  });
  assert.deepEqual(
    steps.map((s) => s.status),
    ["completed", "completed", "completed", "locked", "locked", "locked"],
  );
});

test("connectors activate only after the source is completed and destination unlocked", () => {
  for (const from of ["locked", "active", "completed"]) {
    for (const to of ["locked", "active", "completed"]) {
      assert.equal(
        connectorTone({ status: from }, { status: to }),
        from !== "completed" || to === "locked"
          ? "pending"
          : to === "completed"
            ? "done"
            : "active",
      );
    }
  }
});
