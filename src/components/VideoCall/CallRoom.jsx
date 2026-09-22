import { useEffect, useRef, useState } from "react";
import {
  Hand,
  Sparkles,
  VideoOff,
  MicOff,
  Mic,
  Flag,
  Ban,
  Columns2,
  Minimize2,
} from "lucide-react";
import ParticipantAvatar from "./ParticipantAvatar";
import { formatTime } from "../../utils/videoCall/formatTime";
import { useLocalMedia } from "../../hooks/videoCall/useLocalMedia";
import { useCallChat } from "../../hooks/videoCall/useCallChat";
import CallChat from "./CallChat";
import CallToolbar from "./CallToolbar";

import { demoRewards } from "../../mockdata/videoCall/review";

export default function CallRoom({
  partner,
  duration,
  onEndCall,
  onSafetyAction,
  onNotice,
}) {
  const [chatOpen, setChatOpen] = useState(true);
  const [splitView, setSplitView] = useState(false);
  const [reactions, setReactions] = useState([]);
  const reactionId = useRef(0);
  const reactionTimers = useRef(new Set());
  useEffect(() => {
    const timers = reactionTimers.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);
  function sendReaction(emoji) {
    const id = ++reactionId.current;
    setReactions((current) => [...current.slice(-39), { id, emoji }]);
    const timer = setTimeout(() => {
      setReactions((current) => current.filter((item) => item.id !== id));
      reactionTimers.current.delete(timer);
    }, 2000);
    reactionTimers.current.add(timer);
  }
  const { mic, camera, previewRef, toggleMedia } = useLocalMedia(onNotice);
  const { messages, sendMessage } = useCallChat(duration);
  return (
    <section className={`vc-call vc-enter${splitView ? " vc-call--split" : ""}`}>
      <div className="vc-call-backdrop">
        <ParticipantAvatar person={partner} className="vc-remote-avatar" />
        <h1>{partner.name}</h1>
        <span>Phòng luyện tập demo</span>
        <p>
          Camera của đối tác sẽ hiển thị tại đây khi kết nối dịch vụ gọi video.
        </p>
        <div className="vc-wave" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <i key={i} style={{ "--i": i }} />
          ))}
        </div>
      </div>
      <header className="vc-call-header">
        <div>
          <span className="vc-call-logo">
            <Hand size={24} />
          </span>
          <div>
            <strong>SignConnect</strong>
            <small>
              <i /> Phiên demo · {formatTime(duration)}
            </small>
          </div>
        </div>
        <span className="vc-call-xp">
          <Sparkles size={15} /> XP +{demoRewards.callXp}
        </span>
      </header>
      <div className="vc-self">
        <video
          ref={previewRef}
          autoPlay
          playsInline
          muted
          className={camera ? "" : "vc-hidden"}
        />
        {!camera && (
          <div>
            <VideoOff size={28} />
            <span>Camera đang tắt</span>
          </div>
        )}
        <button
          type="button"
          className={`vc-self-mic ${mic ? "is-on" : "is-off"}`}
          aria-label={mic ? "Tắt micro của bạn" : "Bật micro của bạn"}
          title={mic ? "Micro đang bật — bấm để tắt" : "Micro đang tắt — bấm để bật"}
          aria-pressed={mic}
          onClick={() => toggleMedia("audio")}
        >
          {mic ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button
          type="button"
          className="vc-self-expand"
          aria-label={splitView ? "Thu nhỏ camera của bạn" : "Chia đôi màn hình cuộc gọi"}
          title={splitView ? "Thu nhỏ camera" : "Chia đôi màn hình"}
          aria-pressed={splitView}
          onClick={() => setSplitView((value) => !value)}
        >
          {splitView ? <Minimize2 size={18} /> : <Columns2 size={18} />}
        </button>
      </div>
      {chatOpen && (
        <CallChat
          partner={partner}
          messages={messages}
          onSend={sendMessage}
          onClose={() => setChatOpen(false)}
        />
      )}
      {reactions.map((reaction) => (
        <div className="vc-floating-reaction" key={reaction.id} aria-hidden="true"
          style={{ left: `calc(55% + ${(reaction.id % 5 - 2) * 24}px)` }}>
          {reaction.emoji}
        </div>
      ))}
      <CallToolbar
        mic={mic}
        camera={camera}
        chatOpen={chatOpen}
        onToggleMic={() => toggleMedia("audio")}
        onToggleCamera={() => toggleMedia("video")}
        onToggleChat={() => setChatOpen((open) => !open)}
        onShareScreen={() =>
          onNotice(
            "Chia sẻ màn hình sẽ khả dụng khi kết nối dịch vụ gọi video.",
          )
        }
        onReact={sendReaction}
        onEndCall={onEndCall}
      />
      <div className="vc-call-safety">
        <button
          title="Báo cáo"
          aria-label="Báo cáo"
          onClick={() => onSafetyAction("report")}
        >
          <Flag size={17} />
        </button>
        <button
          title="Chặn"
          aria-label="Chặn"
          onClick={() => onSafetyAction("block")}
        >
          <Ban size={17} />
        </button>
      </div>
      <div className="vc-call-hint">
        <Hand size={14} /> Giữ đôi tay trong khung hình để bạn học dễ quan sát
      </div>
    </section>
  );
}
