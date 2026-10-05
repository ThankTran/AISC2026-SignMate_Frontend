import test from "node:test";
import assert from "node:assert/strict";
import {
  canLoadAccount,
  loadProgress,
  loadRankings,
  needsRankings,
} from "../src/services/progressLoader.js";
import { createRequestPool } from "../src/services/requestPool.js";

test("dashboard and ranking page load rankings while learning pages do not", () => {
  for (const path of ["/dashboard", "/dashboard/", "/ranking", "/ranking/"]) {
    assert.equal(needsRankings(path), true, path);
  }

  for (const path of ["/", "/login", "/learning-path", "/learning-path/lesson/1"]) {
    assert.equal(needsRankings(path), false, path);
  }
});

test("database sessions load progress without a Firebase verification flag", () => {
  assert.equal(canLoadAccount("local-user", { user: { uid: "local-user" } }), true);
  assert.equal(canLoadAccount("local-user", { user: null }), false);
  assert.equal(canLoadAccount(undefined, { user: null }), false);
});
test("dashboard loads with one request even if rankings are unavailable", async () => {
  let calls = 0;
  const api = {
    dashboard: async () => {
      calls++;

      return {
        stats: { xp: 123, activityHistory: [{ date: "2026-10-05", xp: 123 }] },
        chapters: [{ id: 1, lessons: [{ id: 1, status: "active" }] }],
      };
    },
    stats: () => assert.fail("duplicate stats request"),
    leaderboard: () => assert.fail("rankings must not block dashboard"),
  };
  const data = await loadProgress(api);

  assert.equal(calls, 1);
  assert.equal(data.stats.xp, 123);
  assert.equal(data.chapters.length, 1);
  assert.equal(data.stats.activityHistory.length, 1);
});
test("ranking requests fetch both scopes independently of dashboard", async () => {
  const calls = [];
  const data = await loadRankings({
    leaderboard: async (scope) => {
      calls.push(scope);

      return { entries: [{ id: scope, weeklyXp: 10 }] };
    },
  });

  assert.deepEqual(calls, ["all", "level"]);
  assert.equal(data.leaderboard[0].id, "all");
  assert.equal(data.levelLeaderboard[0].id, "level");
});
test("concurrent duplicate reads share one call, completed reads reload", async () => {
  const pool = createRequestPool();
  let calls = 0,
    resolve;
  const load = () => {
    calls++;

    return new Promise((done) => {
      resolve = done;
    });
  };

  const first = pool.run("account-a:/dashboard", load),
    second = pool.run("account-a:/dashboard", load);

  await Promise.resolve();
  assert.equal(calls, 1);
  resolve({ xp: 1 });
  assert.deepEqual(await first, await second);
  assert.equal(await pool.run("account-a:/dashboard", () => 2), 2);
});
test("different accounts, failed requests and mutations never reuse stale reads", async () => {
  const pool = createRequestPool();

  assert.deepEqual(
    await Promise.all([pool.run("a:/me", () => 1), pool.run("b:/me", () => 2)]),
    [1, 2],
  );
  await assert.rejects(pool.run("a", () => Promise.reject(new Error("offline"))));
  assert.equal(await pool.run("a", () => 3), 3);

  let resolve;
  const old = pool.run(
    "a",
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );

  await Promise.resolve();
  pool.clear();
  assert.equal(await pool.run("a", () => 4), 4);
  resolve(0);
  await old;
});
