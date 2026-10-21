import { createCallPeer } from "../src/services/videoCall/callPeer.js";
const log = (message) => (document.getElementById("results").textContent += message + "\n");
document.getElementById("start").onclick = async () => {
  document.getElementById("start").disabled = true;
  const peers = [],
    streams = [],
    connections = [],
    queues = [[], []],
    errors = [];
  let paint, poll, audio;
  const check = (label, value) => {
    log(`${value ? "PASS" : "FAIL"} ${label}`);
    if (!value) throw Error(label);
  };
  try {
    audio = new AudioContext();
    await audio.resume();
    const canvases = ["#6644aa", "#228858"].map((color) => {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;
      return { canvas, color };
    });
    paint = setInterval(
      () =>
        canvases.forEach(({ canvas, color }) => {
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = color;
          ctx.fillRect(0, 0, 320, 240);
          ctx.fillStyle = "white";
          ctx.fillText(String(Date.now()), 20, 40);
        }),
      80,
    );
    for (const { canvas } of canvases) {
      const stream = canvas.captureStream(12);
      const destination = audio.createMediaStreamDestination();
      const oscillator = audio.createOscillator();
      oscillator.connect(destination);
      oscillator.start();
      stream.addTrack(destination.stream.getAudioTracks()[0]);
      streams.push(stream);
    }
    const states = ["", ""],
      reactions = [[], []];
    for (let index = 0; index < 2; index++) {
      const peer = createCallPeer({
        role: index === 0 ? "caller" : "callee",
        rtcConfig: { iceServers: [] },
        Peer: class extends RTCPeerConnection {
          constructor(config) {
            super(config);
            peers[index] = this;
          }
        },
        signal: async (type, payload) => {
          queues[1 - index].push({ type, payload });
        },
        onStream: (stream) => {
          document.getElementById(index === 0 ? "caller" : "callee").srcObject = stream;
        },
        onState: (value) => (states[index] = value),
        onReaction: (value) => reactions[index].push(value),
        onError: (error) => errors.push(error.message),
        onTimeout: () => errors.push("timeout"),
      });
      connections.push(peer);
      await peer.setStream(streams[index]);
    }
    let busy = false;
    poll = setInterval(async () => {
      if (busy) return;
      busy = true;
      try {
        for (let i = 0; i < 2; i++) {
          while (queues[i].length) await connections[i].receive(queues[i].shift());
        }
      } catch (error) {
        errors.push(error.message);
      } finally {
        busy = false;
      }
    }, 50);
    await connections[0].start();
    await connections[1].start();
    const deadline = Date.now() + 12000;
    while (states.some((state) => state !== "connected") && Date.now() < deadline)
      await new Promise((r) => setTimeout(r, 100));
    check(
      "Both peers connect",
      states.every((state) => state === "connected"),
    );
    await new Promise((r) => setTimeout(r, 1800));
    for (let index = 0; index < 2; index++) {
      const stats = [...(await peers[index].getStats())].map(([, s]) => s);
      for (const kind of ["video", "audio"]) {
        check(
          `Peer ${index + 1} receives actual ${kind} RTP`,
          stats.some((s) => s.type === "inbound-rtp" && s.kind === kind && s.bytesReceived > 0),
        );
      }
    }
    check("Reaction sent", connections[0].react("👋"));
    await new Promise((r) => setTimeout(r, 150));
    check("Reaction received", reactions[1].includes("👋"));
    await connections[1].setStream(null);
    await connections[1].setStream(streams[1]);
    await new Promise((r) => setTimeout(r, 300));
    check(
      "Media replace keeps connection",
      states.every((state) => state === "connected"),
    );
    check("No signaling errors", errors.length === 0);
    log("DONE");
  } catch (error) {
    log("ERROR " + error.message + " " + errors.join(","));
  } finally {
    clearInterval(paint);
    clearInterval(poll);
    connections.forEach((peer) => peer.close());
    streams.forEach((stream) => stream.getTracks().forEach((track) => track.stop()));
    await audio?.close();
  }
};
