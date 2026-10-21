import { useCallback, useEffect, useRef, useState } from "react";
import { callApi } from "../../services/api";
import { createCallPeer } from "../../services/videoCall/callPeer";

const iceServers = [{ urls: "stun:stun.l.google.com:19302" }];

if (import.meta.env.VITE_TURN_URL) {
  iceServers.push({
    urls: import.meta.env.VITE_TURN_URL.split(","),
    username: import.meta.env.VITE_TURN_USERNAME,
    credential: import.meta.env.VITE_TURN_CREDENTIAL,
  });
}

export function useWebRTCCall(callId, role, { stream, mediaRevision, onError, onEnd, onReaction }) {
  const [state, setState] = useState("connecting");
  const remoteRef = useRef(null),
    connection = useRef(null);
  const callbacks = useRef({ onError, onEnd, onReaction });

  useEffect(() => {
    callbacks.current = { onError, onEnd, onReaction };
  }, [onError, onEnd, onReaction]);
  useEffect(() => {
    if (!callId) {
      return;
    }

    let disposed = false,
      timer,
      cursor = 0;
    let peer;
    const fail = (error) => {
      if (!disposed) {
        callbacks.current.onError(error.message || "Không thể kết nối cuộc gọi.");
      }
    };

    // Delay construction so StrictMode's discarded mount never sends an offer.
    const startTimer = setTimeout(async () => {
      try {
        peer = createCallPeer({
          role,
          rtcConfig: { iceServers },
          signal: (type, payload) => callApi.signal(callId, type, payload),
          onState: setState,
          onError: fail,
          onStream: (remote) => {
            if (remoteRef.current) {
              remoteRef.current.srcObject = remote;
            }
          },
          onReaction: (emoji) => callbacks.current.onReaction(emoji),
          onTimeout: () => {
            callbacks.current.onError(
              "Chưa thể kết nối với đối tác hoặc đường truyền đã ngắt. Hãy thử lại cuộc gọi.",
            );
            void callbacks.current.onEnd();
          },
        });
        connection.current = peer;
        await peer.setStream(stream);
        await peer.start();
        async function poll() {
          try {
            const messages = await callApi.signals(callId, cursor);

            if (disposed) {
              return;
            }

            for (const message of messages) {
              await peer.receive(message);
              cursor = Math.max(cursor, message.id);
            }
          } catch (error) {
            fail(error);
          }

          if (!disposed) {
            timer = setTimeout(poll, 1000);
          }
        }

        if (!disposed) {
          void poll();
        }
      } catch (error) {
        fail(error);
        setState("failed");
      }
    }, 0);

    return () => {
      disposed = true;
      clearTimeout(startTimer);
      clearTimeout(timer);
      peer?.close();
      connection.current = null;
    };
    // Local tracks are replaced by the effect below, without restarting negotiation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callId, role]);
  useEffect(() => {
    void connection.current
      ?.setStream(stream)
      .catch((error) => callbacks.current.onError(error.message));
  }, [stream, mediaRevision]);

  const sendReaction = useCallback((emoji) => connection.current?.react(emoji) || false, []);

  return { state, remoteRef, sendReaction };
}
