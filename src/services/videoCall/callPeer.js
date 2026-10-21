// The API stores signaling messages; media travels directly between peers.
export function createCallPeer({
  role,
  rtcConfig,
  signal,
  onStream,
  onState,
  onReaction,
  onError,
  onTimeout,
  Peer = RTCPeerConnection,
  Stream = MediaStream,
  disconnectMs = 15000,
  connectMs = 90000,
}) {
  const peer = new Peer(rtcConfig);
  const senders = new Map(
    (role === "caller" ? ["video", "audio"] : []).map((kind) => [
      kind,
      peer.addTransceiver(kind, { direction: "sendrecv" }).sender,
    ]),
  );
  const remote = new Stream();
  let closed = false,
    channel,
    timeout,
    remoteReady = false;
  let pendingIce = [],
    queue = Promise.resolve(),
    localStream = null;
  const applyTracks = () =>
    Promise.all(
      [...senders].map(([kind, sender]) =>
        sender.replaceTrack(
          localStream
            ?.getTracks()
            .find((track) => track.kind === kind && track.readyState !== "ended") || null,
        ),
      ),
    );
  const report = (error) => {
    if (!closed) {
      onError(error);
    }
  };

  const send = (type, payload) =>
    closed ? Promise.resolve() : signal(type, JSON.stringify(payload));

  function attachChannel(value) {
    channel = value;
    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "reaction" && ["👋", "👍", "❤️", "👏", "😊", "🎉"].includes(data.emoji)) {
          onReaction(data.emoji);
        }
      } catch {
        /* Ignore malformed peer data. */
      }
    };
  }

  peer.ondatachannel = (event) => attachChannel(event.channel);

  if (role === "caller") {
    attachChannel(peer.createDataChannel("reactions"));
  }

  peer.ontrack = (event) => {
    if (!remote.getTracks().some((track) => track.id === event.track.id)) {
      remote.addTrack(event.track);
    }

    onStream(remote);
  };

  peer.onicecandidate = (event) => {
    if (event.candidate) {
      void send("ice", event.candidate.toJSON()).catch(report);
    }
  };

  function armTimeout(delay = disconnectMs) {
    if (!timeout) {
      timeout = setTimeout(() => {
        timeout = null;

        if (!closed) {
          onState("failed");
          onTimeout();
        }
      }, delay);
    }
  }

  peer.onconnectionstatechange = () => {
    if (closed) {
      return;
    }

    const state = peer.connectionState;

    if (state === "connected") {
      clearTimeout(timeout);
      timeout = null;
      onState("connected");
    } else if (state === "disconnected" || state === "failed") {
      onState("reconnecting");
      clearTimeout(timeout);
      timeout = null;
      armTimeout();
    } else if (state === "connecting") {
      onState("connecting");
    }
  };

  onState("connecting");
  armTimeout(connectMs);

  return {
    async start() {
      if (role !== "caller" || closed) {
        return;
      }

      const offer = await peer.createOffer();

      if (closed) {
        return;
      }

      await peer.setLocalDescription(offer);
      await send("offer", peer.localDescription);
    },
    receive(message) {
      const received = queue.then(async () => {
        if (closed) {
          return;
        }

        const data = JSON.parse(message.payload);

        if (message.type === "ice") {
          if (remoteReady) {
            await peer.addIceCandidate(data);
          } else {
            pendingIce.push(data);
          }
        } else if (
          (message.type === "offer" && role === "callee") ||
          (message.type === "answer" && role === "caller")
        ) {
          await peer.setRemoteDescription(data);
          if (closed) return;
          if (role === "callee") {
            // Bind to the offer's transceivers; pre-created callee transceivers
            // are not the negotiated senders and can produce one-way media.
            for (const transceiver of peer.getTransceivers()) {
              const kind = transceiver.receiver.track.kind;
              if (kind === "audio" || kind === "video") {
                transceiver.direction = "sendrecv";
                senders.set(kind, transceiver.sender);
              }
            }
            await applyTracks();
          }
          remoteReady = true;
          for (const candidate of pendingIce) {
            await peer.addIceCandidate(candidate);
          }

          pendingIce = [];

          if (message.type === "offer") {
            await peer.setLocalDescription(await peer.createAnswer());
            await send("answer", peer.localDescription);
          }
        }
      });

      queue = received.catch(() => {});
      return received;
    },
    async setStream(stream) {
      if (closed) {
        return;
      }

      localStream = stream;
      await applyTracks();
    },
    react(emoji) {
      if (channel?.readyState !== "open") {
        return false;
      }

      channel.send(JSON.stringify({ type: "reaction", emoji }));

      return true;
    },
    close() {
      closed = true;
      clearTimeout(timeout);
      channel?.close();
      peer.close();
      remote.getTracks().forEach((track) => track.stop());
    },
  };
}
