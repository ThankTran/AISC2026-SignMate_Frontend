import { useState } from "react";
import { initialChatMessages } from "../../mockdata/videoCall/partners";
import { formatTime } from "../../utils/videoCall/formatTime";

export function useCallChat(duration) {
  const [messages, setMessages] = useState(initialChatMessages);
  function sendMessage(text) {
    if (!text.trim()) return;
    setMessages((current) => [
      ...current,
      { text: text.trim(), mine: true, time: formatTime(duration) },
    ]);
  }
  return { messages, sendMessage };
}
