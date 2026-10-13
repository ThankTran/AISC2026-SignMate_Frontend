import test from "node:test";
import assert from "node:assert/strict";
import { adaptAppointments } from "../src/api/appointmentAdapter.js";

test("incoming pending invitations stay actionable; outgoing and accepted appear once on calendar", () => {
  const base = {
    startsAt: new Date(2030, 5, 10, 19, 30).toISOString(),
    partnerName: "Minh",
    topic: "Gia đình",
  };
  const result = adaptAppointments([
    { ...base, id: "received", status: "pending", incoming: true },
    { ...base, id: "sent", status: "pending", incoming: false },
    { ...base, id: "accepted", status: "accepted", incoming: true },
    { ...base, id: "declined", status: "declined", incoming: true },
  ]);
  assert.deepEqual(
    result.incomingScheduleRequests.map((r) => r.id),
    ["received"],
  );
  assert.deepEqual(
    result.scheduledSessions.map((r) => r.id),
    ["sent", "accepted"],
  );
  assert.equal(result.incomingScheduleRequests[0].date, "2030-06-10");
  assert.equal(result.incomingScheduleRequests[0].time, "19:30");
  assert.equal(result.scheduledSessions[0].status, "Đợi xác nhận");
  assert.equal(result.scheduledSessions[1].status, "Sắp diễn ra");
});
