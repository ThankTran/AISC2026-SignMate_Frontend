import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

export default function CallChat({ partner, messages, onSend, onClose }) {
  const [draft, setDraft] = useState("");
  const chatRef = useRef(null);
  useEffect(() => {
    const element = chatRef.current;
    element?.scrollTo({
      top: element.scrollHeight,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }, [messages]);
  function send(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft("");
  }
  return (
    <aside className="vc-chat">
      <div className="vc-chat-heading">
        <span>
          <MessageCircle size={16} /> Trò chuyện
        </span>
        <button aria-label="Đóng trò chuyện" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="vc-chat-messages" ref={chatRef} aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={m.mine ? "mine" : ""}>
            <small>
              {m.mine ? "BẠN" : partner.name.toUpperCase()} · {m.time}
            </small>
            <p>{m.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={send}>
        <input
          aria-label="Tin nhắn"
          placeholder="Nhắn tin…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
        />
        <button aria-label="Gửi tin nhắn" disabled={!draft.trim()}>
          <Send size={18} />
        </button>
      </form>
    </aside>
  );
}
