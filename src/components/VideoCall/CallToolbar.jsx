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
  return (
    <div className="vc-call-toolbar">
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
        { icon: Smile, label: "Gửi trái tim", onClick: onReact },
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
