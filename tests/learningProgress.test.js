import test from "node:test";
import assert from "node:assert/strict";
import { getContinueTarget, percent } from "../src/pages/Dashboard/learningProgress.js";

const chapter = (id, done, quizStatus, statuses) => ({
  id, done, total: statuses.length, quiz: { status: quizStatus },
  lessons: statuses.map((status, index) => ({ id: id * 10 + index, status })),
});

test("resume chapter 1 using the actual three-lesson curriculum", () => {
  const first = chapter(1, 1, "locked", ["completed", "active", "locked"]);
  const next = chapter(2, 0, "locked", ["locked", "locked", "locked"]);
  const target = getContinueTarget([first, next]);
  assert.equal(target.chapter, first);
  assert.equal(target.path, "/learning-path/lesson/11");
  assert.equal(percent(first.done, first.total), 33);
});

test("finish the pending chapter quiz before suggesting the next chapter", () => {
  const first = chapter(1, 3, "unlocked", ["completed", "completed", "completed"]);
  const next = chapter(2, 0, "locked", ["active", "locked", "locked"]);
  assert.equal(getContinueTarget([first, next]).path, "/learning-path/quiz/1");
  first.quiz.status = "completed";
  assert.equal(getContinueTarget([first, next]).path, "/learning-path/lesson/20");
});

test("empty, locked and fully completed paths have no continuation target", () => {
  assert.equal(getContinueTarget([]), null);
  assert.equal(getContinueTarget([chapter(1, 0, "locked", ["locked"])]), null);
  assert.equal(getContinueTarget([chapter(1, 3, "completed", ["completed", "completed", "completed"])]), null);
  assert.equal(percent(0, 0), 0);
});
