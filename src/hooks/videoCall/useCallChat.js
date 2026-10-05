import { useCallback, useEffect, useRef, useState } from "react";
import { callApi } from "../../services/api";
import { VIDEO_DEMO } from "../../services/videoCall/config";
import { initialChatMessages } from "../../mockdata/videoCall/partners";

export function useCallChat(callId) {
  const [messages, setMessages] = useState(VIDEO_DEMO ? initialChatMessages : []);
  const [status, setStatus] = useState(VIDEO_DEMO ? "ready" : "loading");
  const [error, setError] = useState(null);
  const cursor = useRef(0);
  const merge = useCallback(
    (rows) =>
      setMessages((current) => {
        const map = new Map(current.map((item) => [item.id, item]));

        rows.forEach((item) => map.set(item.id, { ...item, mine: item.isMe }));

        return [...map.values()].sort((a, b) => a.id - b.id);
      }),
    [],
  );

  useEffect(() => {
    if (!callId || VIDEO_DEMO) {
      return;
    }

    let disposed = false,
      timer;

    async function poll() {
      try {
        const rows = await callApi.messages(callId, cursor.current);

        if (disposed) {
          return;
        }

        merge(rows);
        rows.forEach((item) => {
          cursor.current = Math.max(cursor.current, item.id);
        });
        setStatus("ready");
        setError(null);
      } catch (failure) {
        if (!disposed) {
          setError(failure.message);
          setStatus("error");
        }
      }

      if (!disposed) {
        timer = setTimeout(poll, 2000);
      }
    }

    void poll();

    return () => {
      disposed = true;
      clearTimeout(timer);
    };
  }, [callId, merge]);

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim()) {
        return;
      }

      if (VIDEO_DEMO) {
        setMessages((current) => [...current, { text: text.trim(), mine: true }]);

        return;
      }

      merge([await callApi.chat(callId, text.trim())]);
    },
    [callId, merge],
  );

  return { messages, sendMessage, status, error };
}
