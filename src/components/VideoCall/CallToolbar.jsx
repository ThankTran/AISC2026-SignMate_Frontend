import { useEffect, useId, useRef, useState } from "react";
import { emojis } from "../../mockdata/videoCall/emojis";
import {
  MessageCircle,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Smile,
  MonitorUp,
} from "lucide-react";

export default function CallToolbar({
  mic,
  camera,
  chatOpen,
  onToggleMic,
  onToggleCamera,
  onToggleChat,
  onShareScreen,
  onReact,
  onEndCall,
}) {
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const toolbarRef = useRef(null);
  const reactionButtonRef = useRef(null);
  const panelId = useId();
  useEffect(() => {
    if (!reactionsOpen) return;
    function outside(event) {
      if (!toolbarRef.current?.contains(event.target)) setReactionsOpen(false);
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
    <div className="vc-call-toolbar" ref={toolbarRef} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setReactionsOpen(false);
    }}>
      <button
        aria-label={mic ? "Tắt micro" : "Bật micro"}
        title={mic ? "Tắt micro" : "Bật micro"}
        aria-pressed={mic}
        className={mic ? "active" : ""}
        onClick={onToggleMic}
      >
        {mic ? <Mic size={21} /> : <MicOff size={21} />}
      </button>
      <button
        aria-label={camera ? "Tắt camera" : "Bật camera"}
        title={camera ? "Tắt camera" : "Bật camera"}
        aria-pressed={camera}
        className={camera ? "active" : ""}
        onClick={onToggleCamera}
      >
        {camera ? <Video size={21} /> : <VideoOff size={21} />}
      </button>
      {[
        {
          icon: MessageCircle,
          label: "Trò chuyện",
          onClick: onToggleChat,
          active: chatOpen,
        },
        { icon: MonitorUp, label: "Chia sẻ màn hình", onClick: onShareScreen },
      ].map(({ icon: Icon, label, onClick, active }) => (
        <button
          key={label}
          aria-label={label}
          title={label}
          aria-pressed={active}
          className={active ? "active" : ""}
          onClick={onClick}
        >
          <Icon size={21} />
        </button>
      ))}
      <button type="button" ref={reactionButtonRef}
        aria-label="Thả cảm xúc" title="Thả cảm xúc"
        aria-expanded={reactionsOpen} aria-controls={panelId}
        className={reactionsOpen ? "active" : ""}
        onClick={() => setReactionsOpen((open) => !open)}>
        <Smile size={21} />
      </button>
      {reactionsOpen && (
        <div className="vc-emoji-picker vc-reaction-picker" id={panelId} role="group" aria-label="Chọn cảm xúc">
          <span>Thả cảm xúc</span>
          <div className="vc-emoji-grid">
            {emojis.map(([emoji, label]) => (
              <button type="button" key={emoji} aria-label={label} title={label}
                onClick={() => {
                  onReact(emoji);
                }}>{emoji}</button>
            ))}
          </div>
        </div>
      )}
      <span />
      <button
        className="vc-hangup"
        aria-label="Kết thúc cuộc gọi"
        title="Kết thúc cuộc gọi"
        onClick={onEndCall}
      >
        <PhoneOff size={23} />
      </button>
    </div>
  );
}
