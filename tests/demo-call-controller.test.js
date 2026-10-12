import { test } from "node:test";
import assert from "node:assert/strict";
import { createDemoCallController } from "../src/services/videoCall/demoController.js";

function fixture(requestMedia) {
  let time = 0,
    sequence = 0;
  const jobs = new Map();
  const schedule = (fn, delay, repeat) => {
    const id = ++sequence;
    jobs.set(id, { fn, at: time + delay, repeat });
    return id;
  };
  const scheduler = {
    setTimeout: (fn, ms) => schedule(fn, ms, 0),
    setInterval: (fn, ms) => schedule(fn, ms, ms),
    clearTimeout: (id) => jobs.delete(id),
    clearInterval: (id) => jobs.delete(id),
  };
  const controller = createDemoCallController({ scheduler, now: () => time, requestMedia });
  return {
    ...controller,
    jobs,
    tick(ms) {
      const end = time + ms;
      while (true) {
        const next = [...jobs].sort((a, b) => a[1].at - b[1].at)[0];
        if (!next || next[1].at > end) break;
        const [id, job] = next;
        time = job.at;
        if (job.repeat) job.at += job.repeat;
        else jobs.delete(id);
        job.fn();
      }
      time = end;
    },
  };
}
function media(kind) {
  const track = {
    kind,
    enabled: true,
    readyState: "live",
    stops: 0,
    stop() {
      this.stops++;
      this.readyState = "ended";
    },
  };
  return {
    track,
    getTracks: () => [track],
    getVideoTracks: () => (kind === "video" ? [track] : []),
    getAudioTracks: () => (kind === "audio" ? [track] : []),
  };
}

test("join advances through waiting; time starts only after connected; leave stops all jobs", () => {
  const c = fixture();
  c.actions.join();
  c.actions.join();
  assert.equal(c.getSnapshot().status, "joining");
  assert.equal(c.jobs.size, 1);
  c.tick(900);
  assert.equal(c.getSnapshot().status, "waiting");
  assert.equal(c.getSnapshot().elapsed, 0);
  c.tick(1400);
  assert.equal(c.getSnapshot().status, "connected");
  c.tick(2250);
  assert.equal(c.getSnapshot().elapsed, 2);
  c.actions.leave();
  assert.equal(c.jobs.size, 0);
  c.tick(10000);
  assert.equal(c.getSnapshot().elapsed, 2);
  assert.equal(c.getSnapshot().status, "ended");
});
test("cancel and dispose cannot connect later; reset supports strict-mode remount", () => {
  for (const cancel of ["leave", "dispose"]) {
    const c = fixture();
    c.actions.join();
    cancel === "leave" ? c.actions.leave() : c.dispose();
    c.tick(10000);
    assert.equal(c.jobs.size, 0);
    assert.notEqual(c.getSnapshot().status, "connected");
    c.actions.scenario("connected");
    c.tick(1000);
    assert.equal(c.getSnapshot().elapsed, 1);
    c.dispose();
  }
});
test("reconnection freezes elapsed time and resumes without counting interruption", () => {
  const c = fixture();
  c.actions.scenario("connected");
  c.tick(2500);
  c.actions.interrupt();
  c.tick(10000);
  assert.equal(c.getSnapshot().elapsed, 2);
  c.actions.reconnect();
  assert.equal(c.getSnapshot().status, "reconnecting");
  c.tick(1600);
  c.tick(500);
  assert.equal(c.getSnapshot().elapsed, 3);
  c.dispose();
});
test("chat is session-local; panels, pin, layout and rejoin reset coherently", () => {
  const c = fixture();
  assert.equal(c.actions.sendMessage("hello"), false);
  c.actions.scenario("connected");
  assert.equal(c.actions.sendMessage("  Xin chào  "), true);
  assert.equal(c.getSnapshot().messages.at(-1).text, "Xin chào");
  assert.equal(c.actions.sendMessage(" "), false);
  c.actions.panel("chat");
  assert.equal(c.getSnapshot().panel, "chat");
  c.actions.panel("chat");
  assert.equal(c.getSnapshot().panel, null);
  c.actions.layout();
  assert.equal(c.getSnapshot().layout, "grid");
  c.actions.pin("self");
  assert.equal(c.getSnapshot().pinned, "self");
  assert.equal(c.getSnapshot().layout, "focus");
  c.actions.leave();
  c.actions.rejoin();
  assert.equal(c.getSnapshot().messages.length, 2);
  assert.equal(c.getSnapshot().elapsed, 0);
  assert.equal(c.getSnapshot().camera, false);
  assert.equal(c.getSnapshot().status, "joining");
  c.dispose();
});
test("all preview fixtures are deterministic and clean prior resources", () => {
  const c = fixture();
  for (const scenario of [
    "pre-call",
    "joining",
    "waiting",
    "connected",
    "camera-off",
    "muted",
    "chat",
    "interrupted",
    "reconnecting",
    "ended",
  ]) {
    c.actions.scenario(scenario);
    assert.equal(c.getSnapshot().scenario, scenario);
    assert.equal(c.getSnapshot().elapsed, 0);
    if (scenario === "camera-off") assert.equal(c.getSnapshot().camera, false);
    if (scenario === "muted") assert.equal(c.getSnapshot().mic, false);
    if (scenario === "chat") assert.equal(c.getSnapshot().panel, "chat");
  }
  assert.equal(c.jobs.size, 0);
});
test("media is explicitly requested, toggles actual tracks, and is released on leave", async () => {
  const video = media("video"),
    audio = media("audio");
  let requests = 0;
  const c = fixture(async (constraints) => {
    requests++;
    return constraints.video ? video : audio;
  });
  c.actions.join();
  assert.equal(requests, 0);
  await c.actions.enablePreview();
  await c.actions.enablePreview("audio");
  c.actions.toggleCamera();
  c.actions.toggleMic();
  assert.equal(video.track.enabled, false);
  assert.equal(audio.track.enabled, false);
  c.actions.toggleCamera();
  assert.equal(video.track.enabled, true);
  c.actions.leave();
  assert.equal(video.track.stops, 1);
  assert.equal(audio.track.stops, 1);
  assert.equal(c.getSnapshot().stream, null);
});
test("permission denial leaves simulation usable", async () => {
  const c = fixture(async () => {
    throw new Error("Permission denied");
  });
  await c.actions.enablePreview();
  assert.match(c.getSnapshot().mediaError, /Không mở/);
  assert.equal(c.getSnapshot().mediaBusy, false);
  c.actions.join();
  c.tick(2300);
  assert.equal(c.getSnapshot().status, "connected");
  c.dispose();
});
test("late permission results are stopped after leave, disposal and preview cancellation", async () => {
  for (const action of ["leave", "dispose", "stopPreview"]) {
    let resolve;
    const stream = media("video");
    const c = fixture(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    const pending = c.actions.enablePreview();
    action === "dispose" ? c.dispose() : c.actions[action]();
    resolve(stream);
    await pending;
    assert.equal(stream.track.stops, 1);
    assert.equal(c.getSnapshot().stream, null);
  }
});
test("closing local devices does not cancel the joining sequence", async () => {
  const stream = media("video");
  const c = fixture(async () => stream);
  c.actions.join();
  await c.actions.enablePreview();
  c.actions.stopPreview();
  c.tick(2300);
  assert.equal(c.getSnapshot().status, "connected");
  assert.equal(stream.track.stops, 1);
  c.dispose();
});
