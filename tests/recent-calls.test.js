import test from "node:test";
import assert from "node:assert/strict";
import { adaptRecentCalls } from "../src/api/recentCallsAdapter.js";

const call = (id, partnerId, endedAt, extra = {}) => ({
  id,
  partner: { id: partnerId, name: "Minh" },
  status: "ended",
  wasConnected: true,
  endedAt,
  durationSeconds: 120,
  ...extra,
});

test("completed calls include existing friends, deduplicate by account ID, and keep newest call", () => {
  const rows = [
    call("old", "alice", "2030-06-10T12:00:00Z"),
    call("bob-call", "bob", "2030-06-10T13:00:00Z"),
    call("latest", "alice", "2030-06-10T14:00:00Z"),
  ];
  const result = adaptRecentCalls(rows, [{ id: "alice", name: "Minh" }]);
  assert.deepEqual(
    result.map((row) => row.id),
    ["alice", "bob"],
  );
  assert.equal(result[0].callId, "latest");
  assert.equal(result[0].isFriend, true);
  assert.equal(result[1].isFriend, false);
  assert.equal(result[1].duration, "2 phút");
  assert.equal(rows[0].id, "old");
});

test("missed, cancelled, active and unidentified calls are excluded", () => {
  const rows = [
    call("missed", "a", "2030-06-10T12:00:00Z", { wasConnected: false }),
    call("cancelled", "b", "2030-06-10T12:00:00Z", { status: "cancelled" }),
    call("active", "c", null, { status: "active" }),
    call("missing", null, "2030-06-10T12:00:00Z"),
  ];
  assert.deepEqual(adaptRecentCalls(rows), []);
});
