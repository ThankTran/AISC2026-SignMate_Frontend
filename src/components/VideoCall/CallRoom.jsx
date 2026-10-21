import { useConfirm } from "../../hooks/useConfirm";
import { VIDEO_DEMO } from "../../services/videoCall/config";
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
  Wifi,
  WifiOff,
  Radio,
} from "lucide-react";
import ParticipantAvatar from "./ParticipantAvatar";
import { formatTime } from "../../utils/videoCall/formatTime";
import { useLocalMedia } from "../../hooks/videoCall/useLocalMedia";
import { useCallChat } from "../../hooks/videoCall/useCallChat";
import { useWebRTCCall } from "../../hooks/videoCall/useWebRTCCall";
import CallChat from "./CallChat";
import CallToolbar from "./CallToolbar";

import { demoRewards } from "../../mockdata/videoCall/review";

export default function CallRoom({
  call,
  partner,
  duration,
  onEndCall,
  onSafetyAction,
  onNotice,
  mediaOptions,
}) {
  const confirm = useConfirm();
  const [chatOpen, setChatOpen] = useState(() => window.innerWidth > 768);
  const [readMessages, setReadMessages] = useState(0);
  const [splitView, setSplitView] = useState(false);
  const [reactions, setReactions] = useState([]);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);
  const reactionId = useRef(0);
  const reactionTimers = useRef(new Set());

  useEffect(() => {
    const timers = reactionTimers.current;

    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  function showReaction(emoji) {
    const id = ++reactionId.current;

    setReactions((current) => [...current.slice(-39), { id, emoji }]);

    const timer = setTimeout(() => {
      setReactions((current) => current.filter((item) => item.id !== id));
      reactionTimers.current.delete(timer);
    }, 2000);

    reactionTimers.current.add(timer);
  }

  const { mic, camera, previewRef, toggleMedia, stream, mediaRevision } = useLocalMedia(
    onNotice,
    mediaOptions,
  );
  const { messages, sendMessage, status: chatStatus, error: chatError } = useCallChat(call?.id);
  const {
    state: connectionState,
    remoteRef,
    sendReaction: transmitReaction,
  } = useWebRTCCall(call?.id, call?.role, {
    stream,
    mediaRevision,
    onError: onNotice,
    onEnd: onEndCall,
    onReaction: showReaction,
  });

  function sendReaction(emoji) {
    if (VIDEO_DEMO || transmitReaction(emoji)) {
      showReaction(emoji);
    }
  }

  const connectionDetails = {
    connecting: { label: "Đang kết nối…", icon: Radio, tone: "warning" },
    connected: { label: "Kết nối ổn định", icon: Wifi, tone: "success" },
    reconnecting: { label: "Đang kết nối lại…", icon: Radio, tone: "warning" },
    failed: { label: "Mất kết nối", icon: WifiOff, tone: "danger" },
  }[connectionState] || { label: "Đang kết nối", icon: Radio, tone: "warning" };

  const StatusIcon = connectionDetails.icon;

  return (
    <section className={`vc-call vc-enter${splitView ? " vc-call--split" : ""}`}>
      {/* Remote Video Stage */}
      <div className="vc-call-backdrop" role="region" aria-label={`Khung hình của ${partner.name}`}>
        <h1 className={connectionState === "connected" && !VIDEO_DEMO ? "sr-only" : "text-h1"}>
          {partner.name}
        </h1>

        {!VIDEO_DEMO && (
          <video
            ref={remoteRef}
            autoPlay
            playsInline
            onCanPlay={(event) => {
              event.currentTarget
                .play()
                .then(() => setPlaybackBlocked(false))
                .catch(() => setPlaybackBlocked(true));
            }}
            className="vc-remote-video"
            aria-label={`Video đối tác ${partner.name}`}
          />
        )}
        {!VIDEO_DEMO && playbackBlocked && (
          <button
            className="vc-button vc-playback-unlock"
            onClick={() => {
              remoteRef.current
                ?.play()
                .then(() => setPlaybackBlocked(false))
                .catch(() => {
                  onNotice(
                    "Trình duyệt chưa phát được âm thanh/video. Hãy kiểm tra quyền phát âm thanh của trang.",
                  );
                });
            }}
          >
            Phát video và âm thanh của đối tác
          </button>
        )}

        {(VIDEO_DEMO || connectionState !== "connected") && (
          <div className="vc-placeholder-stage">
            <div className="vc-avatar-wrapper">
              <ParticipantAvatar person={partner} className="vc-remote-avatar" />
              <span className="vc-avatar-ring" aria-hidden="true" />
            </div>
            <strong className="vc-partner-name">{partner.name}</strong>
            <span className="vc-stage-status">
              {VIDEO_DEMO ? "Phòng luyện tập đối thoại demo" : "Phòng luyện tập trực tiếp"}
            </span>
            <p className="vc-stage-desc">
              {VIDEO_DEMO
                ? "Camera mô phỏng đối tác luyện tập ngôn ngữ ký hiệu."
                : connectionState === "failed"
                  ? "Không thể kết nối. Vui lòng kiểm tra mạng hoặc kết thúc cuộc gọi."
                  : connectionState === "reconnecting"
                    ? "Đang tự động kết nối lại tín hiệu video…"
                    : "Đang chờ đối tác kích hoạt camera…"}
            </p>
            <div className="vc-wave" aria-hidden="true">
              {Array.from({ length: 9 }, (_, i) => (
                <i key={i} style={{ "--i": i }} />
              ))}
            </div>
          </div>
        )}

        {/* Remote participant badge */}
        <div className="vc-video-badge vc-badge-partner">
          <span className="vc-badge-dot" aria-hidden="true" />
          <span className="vc-badge-name">{partner.name}</span>
        </div>
      </div>

      {/* Top Header Bar */}
      <header className="vc-call-header">
        <div className="vc-header-brand">
          <span className="vc-call-logo" aria-hidden="true">
            <Hand size={22} />
          </span>
          <div className="vc-brand-info">
            <div className="vc-brand-row">
              <strong>SignMate</strong>
              <span className="vc-live-indicator" title="Cuộc gọi đang diễn ra">
                <span className="vc-live-dot" /> LIVE
              </span>
            </div>
            <small className="vc-duration-timer">
              {VIDEO_DEMO ? "Demo · " : ""}
              {formatTime(duration)}
            </small>
          </div>
        </div>

        <div className="vc-header-status-group">
          {VIDEO_DEMO ? (
            <span className="vc-call-xp" title="Điểm kinh nghiệm nhận được">
              <Sparkles size={14} /> XP +{demoRewards.callXp}
            </span>
          ) : (
            <span
              className={`vc-connection-pill vc-tone-${connectionDetails.tone}`}
              role="status"
              aria-live="polite"
            >
              <StatusIcon size={14} className="vc-status-icon" />
              {connectionDetails.label}
            </span>
          )}

          {/* Quick safety actions */}
          <div className="vc-header-actions">
            <button
              type="button"
              className="vc-safety-btn"
              title="Báo cáo người dùng"
              aria-label="Báo cáo người dùng"
              onClick={() => onSafetyAction("report")}
            >
              <Flag size={15} />
            </button>
            <button
              type="button"
              className="vc-safety-btn"
              title="Chặn người dùng này"
              aria-label="Chặn người dùng này"
              onClick={() => onSafetyAction("block")}
            >
              <Ban size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Self-View Container (PiP or Split Tile) */}
      <div className="vc-self" role="region" aria-label="Khung hình camera của bạn">
        <video
          ref={previewRef}
          autoPlay
          playsInline
          muted
          className={`vc-self-video ${camera ? "" : "vc-hidden"}`}
        />

        {!camera && (
          <div className="vc-camera-off-state">
            <div className="vc-camera-off-icon">
              <VideoOff size={26} />
            </div>
            <span>Camera của bạn đang tắt</span>
          </div>
        )}

        {/* Self-view control pill: mic toggle + view toggle */}
        <div className="vc-self-controls">
          <button
            type="button"
            className={`vc-self-mic-pill ${mic ? "is-on" : "is-off"}`}
            aria-label={mic ? "Tắt micro của bạn" : "Bật micro của bạn"}
            title={mic ? "Micro đang bật" : "Micro đang tắt"}
            aria-pressed={mic}
            onClick={() => toggleMedia("audio")}
          >
            {mic ? <Mic size={15} /> : <MicOff size={15} />}
            <span className="vc-self-mic-label">{mic ? "Bật" : "Tắt"}</span>
          </button>

          <button
            type="button"
            className="vc-self-expand"
            aria-label={
              splitView ? "Thu nhỏ camera (Chế độ PiP)" : "Chia đôi màn hình (Chế độ Split)"
            }
            title={splitView ? "Chế độ góc nhỏ (PiP)" : "Chia đôi màn hình (Split)"}
            aria-pressed={splitView}
            onClick={() => setSplitView((value) => !value)}
          >
            {splitView ? <Minimize2 size={15} /> : <Columns2 size={15} />}
            <span className="vc-expand-label">{splitView ? "Thu nhỏ" : "Chia đôi"}</span>
          </button>
        </div>

        {/* Self-view participant badge */}
        <div className="vc-video-badge vc-badge-self">
          <span className="vc-badge-dot vc-dot-self" aria-hidden="true" />
          <span className="vc-badge-name">Bạn (Tôi)</span>
        </div>
      </div>

      {/* Floating Chat Drawer */}
      {chatOpen && (
        <CallChat
          partner={partner}
          messages={messages}
          status={chatStatus}
          error={chatError}
          onSend={sendMessage}
          onClose={() => {
            setReadMessages(messages.length);
            setChatOpen(false);
          }}
        />
      )}

      {/* Floating Emoji Reactions */}
      {reactions.map((reaction) => (
        <div
          className="vc-floating-reaction"
          key={reaction.id}
          aria-hidden="true"
          style={{ left: `calc(52% + ${((reaction.id % 5) - 2) * 28}px)` }}
        >
          {reaction.emoji}
        </div>
      ))}

      {/* Signing Space Helper Hint */}
      <div className="vc-call-hint" role="note">
        <Hand size={14} className="vc-hint-icon" />
        <span>Giữ đôi tay và khuôn mặt trong khung hình để bạn học dễ quan sát</span>
      </div>

      {/* Main Call Action Toolbar */}
      <CallToolbar
        mic={mic}
        camera={camera}
        chatOpen={chatOpen}
        onToggleMic={() => toggleMedia("audio")}
        onToggleCamera={() => toggleMedia("video")}
        unreadCount={chatOpen ? 0 : Math.max(0, messages.length - readMessages)}
        onToggleChat={() => {
          setReadMessages(messages.length);
          setChatOpen((open) => !open);
        }}
        onReact={sendReaction}
        onEndCall={async () => {
          if (
            await confirm({
              title: "Kết thúc buổi luyện tập?",
              message:
                "Bạn sẽ hoàn tất phiên gọi và chuyển sang phần ghi nhận XP & đánh giá đóng góp.",
              confirmLabel: "Kết thúc cuộc gọi",
              cancelLabel: "Ở lại",
            })
          ) {
            onEndCall();
          }
        }}
      />
    </section>
  );
}
