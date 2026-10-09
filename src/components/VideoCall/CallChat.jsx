import { useEffect, useId, useRef, useState } from "react";
import { Send, Smile, X } from "lucide-react";
import { InlineLoader } from "../ui/Skeleton";
import ParticipantAvatar from "./ParticipantAvatar";

import { emojis } from "../../mockdata/videoCall/emojis";

export default function CallChat({ partner, messages, onSend, onClose, status = "ready", error }) {
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [draft, setDraft] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const inputRef = useRef(null);
  const composerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const emojiPanelId = useId();
  const messageInputId = useId();
  const chatRef = useRef(null);

  useEffect(() => {
    if (!emojiOpen) {
      return;
    }

    function dismiss(event) {
      if (!composerRef.current?.contains(event.target)) {
        setEmojiOpen(false);
      }
    }

    function escape(event) {
      if (event.key === "Escape") {
        setEmojiOpen(false);
        emojiButtonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);

    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [emojiOpen]);
  function insertEmoji(emoji) {
    const input = inputRef.current;
    const start = input.selectionStart ?? draft.length;
    const end = input.selectionEnd ?? start;
    const next = draft.slice(0, start) + emoji + draft.slice(end);

    if (next.length > 500) {
      return;
    }

    setDraft(next);
    requestAnimationFrame(() => {
      if (!input.isConnected) {
        return;
      }

      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }

  useEffect(() => {
    const element = chatRef.current;

    element?.scrollTo({
      top: element.scrollHeight,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }, [messages]);
  async function send(event) {
    event.preventDefault();

    if (!draft.trim() || sending) {
      return;
    }

    setSending(true);
    setSendError("");

    try {
      await onSend(draft.trim());
      setDraft("");
      setEmojiOpen(false);
    } catch (failure) {
      setSendError(failure.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <aside className="vc-chat" aria-label="Trò chuyện trong cuộc gọi">
      <div
        className="vc-chat-messages"
        ref={chatRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        tabIndex={0}
      >
        {status === "loading" && <p>Đang tải trò chuyện…</p>}
        {status === "ready" && messages.length === 0 && <p>Chưa có tin nhắn. Hãy gửi lời chào!</p>}
        {error && <p role="alert">{error} Đang thử kết nối lại…</p>}
        {messages.map((m, i) => (
          <div key={i} className={`vc-chat-message${m.mine ? " mine" : ""}`}>
            {m.mine ? (
              <span className="vc-chat-avatar" aria-hidden="true">
                B
              </span>
            ) : (
              <ParticipantAvatar person={partner} />
            )}
            <p>
              <strong>{m.mine ? "Bạn" : partner.name}</strong> {m.text}
            </p>
          </div>
        ))}
      </div>
      {sendError && <p role="alert">{sendError}</p>}
      <label className="ui-input-label" htmlFor={messageInputId}>Tin nhắn</label>
      <form
        onSubmit={send}
        ref={composerRef}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setEmojiOpen(false);
          }
        }}
      >
        <input
          ref={inputRef}
          id={messageInputId}
          placeholder="Ví dụ: Chào bạn!"
          value={draft}
          disabled={sending}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
        />
        <button
          type="button"
          ref={emojiButtonRef}
          aria-label="Chọn emoji"
          aria-expanded={emojiOpen}
          aria-controls={emojiPanelId}
          className={emojiOpen ? "vc-emoji-active" : ""}
          onClick={() => setEmojiOpen((open) => !open)}
        >
          <Smile size={18} />
        </button>
        {emojiOpen && (
          <div
            className="vc-emoji-picker"
            id={emojiPanelId}
            role="group"
            aria-label="Danh sách emoji"
          >
            <span>Thêm cảm xúc</span>
            <div className="vc-emoji-grid">
              {emojis.map(([emoji, label]) => (
                <button
                  key={emoji}
                  type="button"
                  aria-label={label}
                  title={label}
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
        <button aria-label="Gửi tin nhắn" disabled={!draft.trim() || sending}>
          {sending ? <InlineLoader label="Đang gửi" /> : <Send size={18} />}
        </button>
        <button type="button" aria-label="Đóng trò chuyện" onClick={onClose}>
          <X size={18} />
        </button>
      </form>
    </aside>
  );
}
