import { useEffect, useId, useRef, useState } from "react";
import { emojis } from "../../mockdata/videoCall/emojis";
import { MessageCircle, Video, VideoOff, Mic, MicOff, PhoneOff, Smile } from "lucide-react";

export default function CallToolbar({
  mic,
  camera,
  chatOpen,
  onToggleMic,
  onToggleCamera,
  onToggleChat,
  unreadCount = 0,
  onReact,
  onEndCall,
}) {
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const toolbarRef = useRef(null);
  const reactionButtonRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!reactionsOpen) {
      return;
    }

    function outside(event) {
      if (!toolbarRef.current?.contains(event.target)) {
        setReactionsOpen(false);
      }
    }

    function escape(event) {
      if (event.key === "Escape") {
        setReactionsOpen(false);
        reactionButtonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);

    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [reactionsOpen]);

  return (
    <div
      className="vc-call-toolbar"
      ref={toolbarRef}
      role="toolbar"
      aria-label="Điều khiển cuộc gọi"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setReactionsOpen(false);
        }
      }}
    >
      <button
        type="button"
        aria-label={mic ? "Tắt micro" : "Bật micro"}
        title={mic ? "Micro đang bật — Bấm để tắt" : "Micro đang tắt — Bấm để bật"}
        aria-pressed={mic}
        className={`vc-tool-btn ${mic ? "active vc-btn-active" : "vc-btn-muted"}`}
        onClick={onToggleMic}
      >
        {mic ? <Mic size={20} /> : <MicOff size={20} />}
        <span className="vc-tool-sr">{mic ? "Tắt micro" : "Bật micro"}</span>
      </button>

      <button
        type="button"
        aria-label={camera ? "Tắt camera" : "Bật camera"}
        title={camera ? "Camera đang bật — Bấm để tắt" : "Camera đang tắt — Bấm để bật"}
        aria-pressed={camera}
        className={`vc-tool-btn ${camera ? "active vc-btn-active" : "vc-btn-muted"}`}
        onClick={onToggleCamera}
      >
        {camera ? <Video size={20} /> : <VideoOff size={20} />}
        <span className="vc-tool-sr">{camera ? "Tắt camera" : "Bật camera"}</span>
      </button>

      <button
        type="button"
        aria-label="Trò chuyện"
        title={chatOpen ? "Đóng khung trò chuyện" : "Mở khung trò chuyện"}
        aria-pressed={chatOpen}
        className={`vc-tool-btn ${chatOpen ? "active vc-btn-active" : ""}`}
        onClick={onToggleChat}
      >
        <MessageCircle size={20} />
        {unreadCount > 0 && (
          <span className="vc-unread" aria-label={`${unreadCount} tin nhắn mới`}>
            {unreadCount}
          </span>
        )}
      </button>

      <button
        type="button"
        ref={reactionButtonRef}
        aria-label="Thả cảm xúc biểu cảm"
        title="Thả cảm xúc"
        aria-expanded={reactionsOpen}
        aria-controls={panelId}
        className={`vc-tool-btn ${reactionsOpen ? "active vc-btn-active" : ""}`}
        onClick={() => setReactionsOpen((open) => !open)}
      >
        <Smile size={20} />
      </button>

      {reactionsOpen && (
        <div
          className="vc-emoji-picker vc-reaction-picker"
          id={panelId}
          role="group"
          aria-label="Chọn cảm xúc gửi đến đối tác"
        >
          <span className="vc-picker-title">Thả cảm xúc trực tiếp</span>
          <div className="vc-emoji-grid">
            {emojis.map(([emoji, label]) => (
              <button
                type="button"
                key={emoji}
                aria-label={label}
                title={label}
                onClick={() => {
                  onReact(emoji);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <span className="vc-toolbar-separator" aria-hidden="true" />

      <button
        type="button"
        className="vc-hangup"
        aria-label="Kết thúc cuộc gọi"
        title="Kết thúc cuộc gọi"
        onClick={onEndCall}
      >
        <PhoneOff size={22} />
      </button>
    </div>
  );
}
