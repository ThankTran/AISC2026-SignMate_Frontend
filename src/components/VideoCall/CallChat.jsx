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
  const wasNearBottomRef = useRef(true);

  function handleScroll() {
    const el = chatRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    wasNearBottomRef.current = distanceToBottom < 60;
  }

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
      if (!input?.isConnected) {
        return;
      }

      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }

  useEffect(() => {
    const element = chatRef.current;
    if (!element) return;

    const latestMessage = messages[messages.length - 1];
    // Auto-scroll only if user was already at bottom or if they sent the message
    if (wasNearBottomRef.current || latestMessage?.mine) {
      element.scrollTo({
        top: element.scrollHeight,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    }
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
      wasNearBottomRef.current = true;
    } catch (failure) {
      setSendError(failure.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <aside className="vc-chat" aria-label="Khung trò chuyện trong cuộc gọi">
      <div className="vc-chat-panel">
        {/* Chat Drawer Header */}
        <div className="vc-chat-header">
          <div className="vc-chat-header-user">
            <ParticipantAvatar person={partner} className="vc-chat-header-avatar" />
            <div>
              <strong>{partner.name}</strong>
              <small>Trò chuyện trực tiếp</small>
            </div>
          </div>
          <button
            type="button"
            className="vc-chat-close-btn"
            aria-label="Đóng trò chuyện"
            title="Đóng trò chuyện"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Message stream */}
        <div
          className="vc-chat-messages"
          ref={chatRef}
          onScroll={handleScroll}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          tabIndex={0}
        >
          {status === "loading" && <p className="vc-chat-empty">Đang tải cuộc trò chuyện…</p>}
          {status === "ready" && messages.length === 0 && (
            <p className="vc-chat-empty">Chưa có tin nhắn. Hãy gửi tin nhắn chào bạn học!</p>
          )}
          {error && <p className="vc-chat-error" role="alert">{error} Đang thử kết nối lại…</p>}
          {messages.map((m, i) => (
            <div key={i} className={`vc-chat-message${m.mine ? " mine" : ""}`}>
              {!m.mine && (
                <ParticipantAvatar person={partner} className="vc-chat-msg-avatar" />
              )}
              <div className="vc-chat-bubble">
                <span className="vc-chat-sender">
                  {m.mine ? "Bạn" : partner.name}
                </span>
                <p>{m.text}</p>
              </div>
            </div>
          ))}
        </div>

        {sendError && <p className="vc-chat-error" role="alert">{sendError}</p>}

        {/* Composer Form */}
        <label className="sr-only" htmlFor={messageInputId}>
          Nhập tin nhắn gửi tới {partner.name}
        </label>
        <form
          className="vc-chat-composer"
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
            placeholder="Nhập tin nhắn…"
            value={draft}
            disabled={sending}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={500}
            autoComplete="off"
          />

          <button
            type="button"
            ref={emojiButtonRef}
            aria-label="Chọn biểu cảm emoji"
            aria-expanded={emojiOpen}
            aria-controls={emojiPanelId}
            className={`vc-chat-tool-btn ${emojiOpen ? "vc-emoji-active" : ""}`}
            onClick={() => setEmojiOpen((open) => !open)}
          >
            <Smile size={18} />
          </button>

          {emojiOpen && (
            <div
              className="vc-emoji-picker vc-chat-picker"
              id={emojiPanelId}
              role="group"
              aria-label="Danh sách emoji nhanh"
            >
              <span className="vc-picker-title">Chèn biểu cảm</span>
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

          <button
            type="submit"
            className="vc-chat-send-btn"
            aria-label="Gửi tin nhắn"
            disabled={!draft.trim() || sending}
          >
            {sending ? <InlineLoader label="Đang gửi" /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </aside>
  );
}
