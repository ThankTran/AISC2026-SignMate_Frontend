import { useState } from "react";
import {
  Hand,
  Sparkles,
  VideoOff,
  MicOff,
  Flag,
  Ban,
  Heart,
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
  selected,
  duration,
  onEndCall,
  onSafetyAction,
  onNotice,
}) {
  const [chatOpen, setChatOpen] = useState(true);
  const [reaction, setReaction] = useState(0);
  const { mic, camera, previewRef, toggleMedia } = useLocalMedia(onNotice);
  const { messages, sendMessage } = useCallChat(duration);
  return (
    <section className="vc-call vc-enter">
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
        <span className="vc-call-topic">
          <Sparkles size={14} />
          {selected[0]}
        </span>
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
        <small>Bạn {!mic && <MicOff size={12} />}</small>
      </div>
      {chatOpen && (
        <CallChat
          partner={partner}
          messages={messages}
          onSend={sendMessage}
          onClose={() => setChatOpen(false)}
        />
      )}
      {reaction > 0 && (
        <div className="vc-floating-reaction" key={reaction}>
          <Heart size={64} fill="currentColor" />
        </div>
      )}
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
        onReact={() => setReaction((value) => value + 1)}
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
