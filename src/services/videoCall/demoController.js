import { demoConversation, demoDelays, demoParticipant, demoScenarios } from "./demoContent.js";

// No network calls. The scheduler and media requester are injectable for deterministic tests.
export function createDemoCallController({
  selfName = "Bạn",
  scheduler = globalThis,
  now = () => Date.now(),
  requestMedia = (constraints) => navigator.mediaDevices.getUserMedia(constraints),
} = {}) {
  const listeners = new Set();
  const timers = new Set();
  let mediaGeneration = 0;
  let generation = 0,
    disposed = false,
    activeSince = null,
    accumulated = 0;
  let streams = [];
  const initial = () => ({
    status: "pre-call",
    elapsed: 0,
    camera: false,
    mic: false,
    participants: [
      {
        id: "self",
        name: selfName,
        initials: selfName
          .split(/\s+/)
          .map((s) => s[0])
          .slice(-2)
          .join(""),
        role: "Bạn",
      },
      demoParticipant,
    ],
    messages: demoConversation.map((m) => ({ ...m })),
    panel: null,
    layout: "focus",
    pinned: demoParticipant.id,
    stream: null,
    mediaBusy: false,
    mediaError: "",
    preview: false,
    localMic: false,
    scenario: "pre-call",
  });
  let state = initial();
  const update = (patch) => {
    if (!disposed) {
      state = { ...state, ...patch };
      listeners.forEach((fn) => fn());
    }
  };
  const elapsed = () =>
    Math.floor((accumulated + (activeSince === null ? 0 : now() - activeSince)) / 1000);
  const clearTimers = () => {
    timers.forEach((id) => {
      scheduler.clearTimeout(id);
      scheduler.clearInterval(id);
    });
    timers.clear();
  };
  const release = () => {
    mediaGeneration++;
    streams.forEach((s) =>
      s.getTracks().forEach((t) => {
        t.onended = null;
        t.stop();
      }),
    );
    streams = [];
  };
  function freeze() {
    if (activeSince !== null) {
      accumulated += now() - activeSince;
      activeSince = null;
    }
    clearTimers();
  }
  function later(action, delay) {
    const epoch = generation;
    const id = scheduler.setTimeout(() => {
      timers.delete(id);
      if (epoch === generation && !disposed) action();
    }, delay);
    timers.add(id);
  }
  function connect() {
    clearTimers();
    activeSince = now();
    update({ status: "connected" });
    const id = scheduler.setInterval(() => update({ elapsed: elapsed() }), 250);
    timers.add(id);
  }
  function reset() {
    generation++;
    clearTimers();
    release();
    disposed = false;
    activeSince = null;
    accumulated = 0;
    state = initial();
    listeners.forEach((fn) => fn());
  }
  const actions = {
    join() {
      if (state.status !== "pre-call") return;
      update({ status: "joining" });
      later(() => {
        update({ status: "waiting" });
        later(connect, demoDelays.waiting);
      }, demoDelays.joining);
    },
    leave() {
      const total = elapsed();
      generation++;
      freeze();
      release();
      update({
        status: "ended",
        elapsed: total,
        stream: null,
        preview: false,
        localMic: false,
        camera: false,
        mic: false,
        mediaBusy: false,
        panel: null,
      });
    },
    rejoin() {
      reset();
      actions.join();
    },
    toggleCamera() {
      if (state.status === "ended") return;
      const camera = !state.camera;
      streams.forEach((s) =>
        s.getVideoTracks().forEach((t) => {
          t.enabled = camera;
        }),
      );
      update({ camera });
    },
    toggleMic() {
      if (state.status === "ended") return;
      const mic = !state.mic;
      streams.forEach((s) =>
        s.getAudioTracks().forEach((t) => {
          t.enabled = mic;
        }),
      );
      update({ mic });
    },
    async enablePreview(kind = "video") {
      if (state.mediaBusy || state.status === "ended") return;
      if (
        streams.some((s) => s.getTracks().some((t) => t.kind === kind && t.readyState !== "ended"))
      )
        return;
      const epoch = mediaGeneration;
      update({ mediaBusy: true, mediaError: "" });
      try {
        const stream = await requestMedia({ video: kind === "video", audio: kind === "audio" });
        if (epoch !== mediaGeneration || disposed) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streams.push(stream);
        stream.getTracks().forEach((t) => {
          t.onended = () =>
            update(
              kind === "video"
                ? { camera: false, preview: false, stream: null }
                : { mic: false, localMic: false },
            );
        });
        update(
          kind === "video"
            ? { stream, camera: true, preview: true }
            : { mic: true, localMic: true },
        );
      } catch {
        if (epoch === mediaGeneration)
          update({
            mediaError:
              "Không mở được thiết bị. Bạn vẫn có thể tiếp tục với hình đại diện và điều khiển mô phỏng.",
          });
      } finally {
        if (epoch === mediaGeneration) update({ mediaBusy: false });
      }
    },
    stopPreview() {
      release();
      update({
        stream: null,
        preview: false,
        localMic: false,
        camera: false,
        mic: false,
        mediaBusy: false,
      });
    },
    sendMessage(text) {
      const value = text.trim().slice(0, 1000);
      if (!value || state.status !== "connected") return false;
      update({
        messages: [
          ...state.messages,
          { id: state.messages.at(-1).id + 1, author: "self", text: value, time: elapsed() },
        ],
      });
      return true;
    },
    panel(name) {
      update({ panel: state.panel === name ? null : name });
    },
    closePanel() {
      update({ panel: null });
    },
    layout() {
      update({ layout: state.layout === "focus" ? "grid" : "focus" });
    },
    pin(id) {
      if (state.participants.some((p) => p.id === id)) update({ pinned: id, layout: "focus" });
    },
    interrupt() {
      if (state.status === "connected") {
        const total = elapsed();
        freeze();
        update({ status: "interrupted", elapsed: total });
      }
    },
    reconnect() {
      if (state.status === "interrupted") {
        update({ status: "reconnecting" });
        later(connect, demoDelays.reconnecting);
      }
    },
    scenario(name) {
      if (!demoScenarios.some(([id]) => id === name)) return;
      reset();
      update({ scenario: name });
      if (["connected", "camera-off", "muted", "chat"].includes(name)) {
        connect();
        update({
          camera: name !== "camera-off",
          mic: name !== "muted",
          panel: name === "chat" ? "chat" : null,
        });
      } else update({ status: name }); // Fixtures hold transient states until explicitly advanced.
    },
    advance() {
      if (["joining", "waiting", "reconnecting"].includes(state.status)) connect();
    },
    reset,
  };
  return {
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    getSnapshot: () => state,
    actions,
    dispose() {
      generation++;
      freeze();
      release();
      disposed = true;
    },
  };
}
