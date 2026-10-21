import test from "node:test";
import assert from "node:assert/strict";
import { createCallPeer } from "../src/services/videoCall/callPeer.js";

class Stream {
  tracks = [];
  getTracks() {
    return this.tracks;
  }
  addTrack(track) {
    this.tracks.push(track);
  }
}
class Peer {
  static instances = [];
  senders = [];
  transceivers = [];
  ice = [];
  connectionState = "new";
  constructor() {
    Peer.instances.push(this);
  }
  addTransceiver(kind) {
    const sender = {
      kind,
      replaceTrack: async (track) => {
        sender.track = track;
      },
    };

    this.senders.push(sender);

    const transceiver = { sender, receiver: { track: { kind } }, direction: "sendrecv" };
    this.transceivers.push(transceiver);
    return transceiver;
  }
  createDataChannel() {
    return (this.channel = {
      readyState: "open",
      send: (value) => {
        this.sent = JSON.parse(value);
      },
      close() {},
    });
  }
  async createOffer() {
    return { type: "offer", sdp: "offer-sdp" };
  }
  async createAnswer() {
    return { type: "answer", sdp: "answer-sdp" };
  }
  async setLocalDescription(value) {
    this.localDescription = value;
  }
  async setRemoteDescription(value) {
    this.remoteDescription = value;
    if (value.type === "offer" && !this.transceivers.length) {
      this.addTransceiver("video");
      this.addTransceiver("audio");
    }
  }
  getTransceivers() {
    return this.transceivers;
  }
  async addIceCandidate(value) {
    assert.ok(this.remoteDescription);
    this.ice.push(value);
  }
  close() {
    this.closed = true;
  }
}
function setup(role, extra = {}) {
  const signals = [],
    states = [],
    reactions = [];
  const connection = createCallPeer({
    role,
    Peer,
    Stream,
    signal: async (type, payload) => signals.push({ type, payload }),
    onStream() {},
    onState: (value) => states.push(value),
    onReaction: (value) => reactions.push(value),
    onError: (error) => {
      throw error;
    },
    onTimeout() {},
    ...extra,
  });

  return { connection, peer: Peer.instances.at(-1), signals, states, reactions };
}

test("caller sends offer; ICE received before answer is buffered", async () => {
  const { connection, peer, signals } = setup("caller");

  try {
    await connection.start();
    assert.equal(signals[0].type, "offer");
    await connection.receive({ type: "ice", payload: JSON.stringify({ candidate: "candidate" }) });
    assert.equal(peer.ice.length, 0);
    await connection.receive({
      type: "answer",
      payload: JSON.stringify({ type: "answer", sdp: "remote" }),
    });
    assert.equal(peer.ice.length, 1);
  } finally {
    connection.close();
  }
});
test("callee answers an offer and replaces camera/mic without another offer", async () => {
  const { connection, peer, signals } = setup("callee");

  try {
    await connection.start();
    assert.equal(signals.length, 0);
    await connection.receive({
      type: "offer",
      payload: JSON.stringify({ type: "offer", sdp: "remote" }),
    });
    assert.equal(signals[0].type, "answer");

    const stream = new Stream(),
      track = { kind: "video", readyState: "live" };

    stream.addTrack(track);
    await connection.setStream(stream);
    assert.equal(peer.senders[0].track, track);
    await connection.setStream(null);
    assert.equal(peer.senders[0].track, null);
    assert.equal(signals.length, 1);
  } finally {
    connection.close();
  }
});
test("reaction data channel ignores malformed and unsupported messages", () => {
  const { connection, peer, reactions } = setup("caller");

  try {
    assert.equal(connection.react("👋"), true);
    assert.equal(peer.sent.type, "reaction");
    peer.channel.onmessage({ data: "invalid" });
    peer.channel.onmessage({ data: JSON.stringify({ type: "reaction", emoji: "bad" }) });
    peer.channel.onmessage({ data: JSON.stringify({ type: "reaction", emoji: "👋" }) });
    assert.deepEqual(reactions, ["👋"]);
  } finally {
    connection.close();
  }
});

test("callee attaches early camera and microphone to the offered transceivers", async () => {
  const { connection, peer } = setup("callee");
  try {
    const stream = new Stream();
    const video = { kind: "video", readyState: "live" };
    const audio = { kind: "audio", readyState: "live" };
    stream.addTrack(video);
    stream.addTrack(audio);
    await connection.setStream(stream);
    assert.equal(peer.senders.length, 0);
    await connection.receive({
      type: "offer",
      payload: JSON.stringify({ type: "offer", sdp: "remote" }),
    });
    assert.equal(peer.senders[0].track, video);
    assert.equal(peer.senders[1].track, audio);
    assert.ok(peer.getTransceivers().every((value) => value.direction === "sendrecv"));
  } finally {
    connection.close();
  }
});

test("bad signaling message does not poison subsequent negotiation", async () => {
  const { connection, signals } = setup("callee");
  try {
    await assert.rejects(connection.receive({ type: "ice", payload: "not-json" }));
    await connection.receive({
      type: "offer",
      payload: JSON.stringify({ type: "offer", sdp: "valid" }),
    });
    assert.equal(signals[0].type, "answer");
  } finally {
    connection.close();
  }
});

test("initial join allows time for the other participant's device check", async () => {
  let ended = 0;
  const { connection } = setup("caller", {
    disconnectMs: 10,
    connectMs: 1000,
    onTimeout: () => ended++,
  });
  try {
    await new Promise((resolve) => setTimeout(resolve, 30));
    assert.equal(ended, 0);
  } finally {
    connection.close();
  }
});
test("connection loss ends after grace period; reconnect clears timeout", async () => {
  let ended = 0;
  const { connection, peer } = setup("caller", { disconnectMs: 15, onTimeout: () => ended++ });

  try {
    peer.connectionState = "connected";
    peer.onconnectionstatechange();
    await new Promise((resolve) => setTimeout(resolve, 25));
    assert.equal(ended, 0);
    peer.connectionState = "disconnected";
    peer.onconnectionstatechange();
    await new Promise((resolve) => setTimeout(resolve, 25));
    assert.equal(ended, 1);
  } finally {
    connection.close();
  }
});
