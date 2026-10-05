import test from "node:test";
import assert from "node:assert/strict";
import { adaptProgress, adaptLeaderboard, adaptNotifications } from "../src/api/progressAdapter.js";
import { initialProgress, recordProgress, deriveProgress } from "../src/utils/progress.js";

test("adapter preserves server awards, unlocks, curriculum and weekly ranks", () => {
  const result = adaptProgress({
    dashboard: {
      stats: { xp: 9999 },
      chapters: [
        {
          id: 42,
          total: 2,
          done: 1,
          lessons: [
            { id: 87, status: "completed" },
            { id: 99, status: "active" },
          ],
        },
      ],
      dailyQuests: [{ id: "lesson", xp: "80", done: true }],
    },
    stats: { xp: 80, xpLevel: 1, xpRemaining: 920, curriculumLevel: "Trung cấp" },
    leaderboard: {
      entries: [{ id: "me", rank: 7, isMe: true, weeklyXp: 80, totalXp: 80, previousRank: 9 }],
    },
  });

  assert.equal(result.stats.xp, 80);
  assert.equal(result.stats.curriculumLevel, "Trung cấp");
  assert.equal(result.nextLesson.id, 99);
  assert.equal(result.nextLesson.chapterId, 42);
  assert.equal(result.totalLessons, 2);
  assert.equal(result.completedLessons, 1);
  assert.equal(result.percent, 50);
  assert.equal(result.leaderboard[0].rank, 7);
  assert.equal(result.leaderboard[0].previousRank, 9);
  assert.equal(result.dailyQuests[0].xp, 80);
  assert.equal(result.chapters[0].quiz.status, "locked");
});
test("missing optional histories and quests stay empty, never borrow mock activity", () => {
  const result = adaptProgress();

  assert.deepEqual(result.chapters, []);
  assert.deepEqual(result.dailyQuests, []);
  assert.deepEqual(result.stats.aiAccuracyHistory, []);
  assert.deepEqual(result.stats.activityHistory, []);
  assert.equal(result.stats.xp, 0);
  assert.equal(result.nextLesson, undefined);
  assert.equal(
    adaptLeaderboard({ entries: [{ id: "new", xp: 1200, level: 2 }] })[0].previousRank,
    null,
  );
});
test("notifications route by server type and retain server read state", () => {
  const result = adaptNotifications([
    { id: "1", type: "call_invite", message: "Lời mời", read: false },
    { id: "2", type: "friend_request", read: true },
  ]);

  assert.equal(result[0].path, "/friends/video-call-invites");
  assert.equal(result[0].title, "Lời mời");
  assert.equal(result[1].path, "/friends/friend-requests");
  assert.equal(result[1].read, true);
});
test("offline failed result does not unlock a lesson or become completion", () => {
  const state = recordProgress(initialProgress(), "lesson", 1, {
    id: "failed",
    score: 63,
    passed: false,
    xp: 0,
  });

  assert.deepEqual(state.completedLessons, []);
  assert.equal(deriveProgress(state).nextLesson.id, 1);
  assert.equal(deriveProgress(state).stats.lessonsLearned, 0);
});
