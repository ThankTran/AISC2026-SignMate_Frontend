import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Users,
  Settings,
  PhoneOff,
  ArrowRight,
  X,
  Pin,
  Columns2,
  Send,
  RotateCcw,
  Check,
  Camera,
  WifiOff,
} from "lucide-react";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useDemoCallController } from "../../hooks/videoCall/useDemoCallController";
import { demoScenarios, demoStatusLabels } from "../../services/videoCall/demoContent.js";
import { formatTime } from "../../utils/videoCall/formatTime";
import "./DemoCallPage.css";

function Control({ icon: Icon, label, ...props }) {
  return (
    <button type="button" {...props}>
      <Icon size={20} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

export default function DemoCallPage() {
  const user = useCurrentUser();
  const [params] = useSearchParams();
  const initialScenario = import.meta.env.DEV
    ? params.get("scenario") || (params.get("step") === "call" ? "connected" : "pre-call")
    : "pre-call";
  const call = useDemoCallController(
    user?.name || user?.displayName || "Minh Anh",
    initialScenario,
  );
  const { actions, status } = call;
  const [draft, setDraft] = useState("");
  const videoRef = useRef(null),
    panelRef = useRef(null),
    opener = useRef(null),
    messageEnd = useRef(null),
    joinRef = useRef(null),
    endRef = useRef(null);
  const live = status === "connected";
  const inSession = !["pre-call", "ended"].includes(status);
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = call.stream;
  }, [call.stream, call.camera, call.pinned, call.layout, status]);
  useEffect(() => {
    if (!call.panel) return;
    panelRef.current?.focus();
    const escape = (event) => {
      if (event.key === "Escape") {
        actions.closePanel();
        opener.current?.focus();
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [call.panel, actions]);
  useEffect(() => {
    messageEnd.current?.scrollIntoView({ block: "nearest" });
  }, [call.messages, call.panel]);
  useEffect(() => {
    if (status === "ended") endRef.current?.focus();
    if (status === "connected") joinRef.current?.focus();
  }, [status]);
  function openPanel(name, event) {
    opener.current = event.currentTarget;
    actions.panel(name);
  }
  function closePanel() {
    actions.closePanel();
    opener.current?.focus();
  }
  function freshJoin() {
    setDraft("");
    actions.rejoin();
  }
  function tile(person) {
    const self = person.id === "self";
    const videoOn = self && call.preview && call.camera;
    return (
      <article
        key={person.id}
        className={`dc-tile ${self ? "dc-tile--self" : "dc-tile--partner"} ${call.pinned === person.id ? "dc-tile--pinned" : ""}`}
        aria-label={`${person.name}${self ? ", bạn" : ", người tham gia mẫu"}`}
      >
        {videoOn ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            aria-label="Camera của bạn, chỉ xem trên máy này"
          />
        ) : (
          <div className="dc-portrait">
            <span className="dc-initials" aria-hidden="true">
              {person.initials}
            </span>
            <h2>{person.name}</h2>
            <p>
              {self
                ? call.camera
                  ? "Khung hình mô phỏng"
                  : "Camera đang tắt"
                : ["joining", "waiting"].includes(status)
                  ? "Sẽ tham gia trong giây lát"
                  : "Người tham gia mẫu"}
            </p>
          </div>
        )}
        <div className="dc-tile-label">
          <span>
            {person.name}
            {self ? " · Bạn" : ""}
          </span>
          {self && !call.mic && <MicOff size={16} aria-label="Micro đã tắt" />}
        </div>
        {inSession && (
          <button
            className="dc-pin"
            aria-label={`Ghim ${person.name}`}
            aria-pressed={call.pinned === person.id && call.layout === "focus"}
            onClick={() => actions.pin(person.id)}
          >
            <Pin size={17} />
          </button>
        )}
      </article>
    );
  }
  return (
    <section className="dc-page" aria-label="Phòng luyện tập SignMate">
      <header className="dc-heading">
        <div>
          <h1>Cùng nhau luyện ký hiệu</h1>
          <p>Chào hỏi & giao tiếp hằng ngày</p>
        </div>
        <div className="dc-session">
          <span className="dc-demo">Demo</span>
          <span className="dc-clock" aria-label="Thời gian luyện tập">
            {formatTime(call.elapsed)}
          </span>
        </div>
      </header>
      <div className="dc-status" role="status">
        <span className={`dc-status-dot ${live ? "dc-status-dot--on" : ""}`} />
        {demoStatusLabels[status]}
      </div>

      {status === "ended" ? (
        <div className="dc-ended">
          <span className="dc-end-icon">
            <Check size={36} />
          </span>
          <h2 ref={endRef} tabIndex={-1}>
            Hẹn gặp lại ở buổi luyện tập tới.
          </h2>
          <p>
            Bạn đã dành <strong>{formatTime(call.elapsed)}</strong> luyện tập cùng hồ sơ mẫu{" "}
            {call.participants[1].name}.
          </p>
          <p className="dc-muted">Phiên demo đã kết thúc. Camera và micro đã được đóng.</p>
          <button className="dc-primary" onClick={freshJoin}>
            <RotateCcw size={18} />
            Tham gia lại
          </button>
          <Link className="dc-return" to="/learning-path">
            Về lộ trình học <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          <div className={`dc-workspace ${call.panel ? "dc-workspace--panel" : ""}`}>
            <div className={`dc-stage dc-stage--${call.layout}`}>
              {call.participants.map(tile)}
              {["joining", "waiting", "interrupted", "reconnecting"].includes(status) && (
                <div className="dc-connection">
                  {status === "interrupted" ? (
                    <WifiOff size={26} />
                  ) : (
                    <span className="dc-loader" aria-hidden="true" />
                  )}
                  <h2>{demoStatusLabels[status]}</h2>
                  <p>
                    {status === "interrupted"
                      ? "Cuộc trò chuyện của bạn vẫn ở đây. Kết nối lại khi sẵn sàng."
                      : "Một chút thời gian để sẵn sàng luyện tập cùng nhau."}
                  </p>
                  {status === "interrupted" && (
                    <button className="dc-primary" onClick={actions.reconnect}>
                      Kết nối lại
                    </button>
                  )}
                </div>
              )}
            </div>
            {call.panel && (
              <aside className="dc-panel" aria-labelledby="dc-panel-title">
                <header>
                  <h2 id="dc-panel-title">
                    {
                      { chat: "Trò chuyện", people: "Người tham gia", settings: "Cài đặt phiên" }[
                        call.panel
                      ]
                    }
                  </h2>
                  <button ref={panelRef} aria-label="Đóng bảng bên" onClick={closePanel}>
                    <X size={21} />
                  </button>
                </header>
                {call.panel === "chat" && (
                  <>
                    <p className="dc-panel-note">Hội thoại mẫu · Tin nhắn chỉ ở trong phiên này.</p>
                    <div
                      className="dc-messages"
                      role="log"
                      aria-label="Tin nhắn trong phiên"
                      aria-live="polite"
                    >
                      {call.messages.map((message) => (
                        <article
                          key={message.id}
                          className={`dc-message ${message.author === "self" ? "dc-message--mine" : ""}`}
                        >
                          <div>
                            <strong>
                              {call.participants.find((p) => p.id === message.author)?.name}
                            </strong>
                            <time>{formatTime(message.time)}</time>
                          </div>
                          <p>{message.text}</p>
                        </article>
                      ))}
                      <span ref={messageEnd} />
                    </div>
                    <form
                      className="dc-compose"
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (actions.sendMessage(draft)) setDraft("");
                      }}
                    >
                      <label className="sr-only" htmlFor="dc-message">
                        Tin nhắn
                      </label>
                      <input
                        id="dc-message"
                        maxLength={1000}
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder={live ? "Viết tin nhắn…" : "Chat mở khi đã kết nối"}
                        disabled={!live}
                      />
                      <button
                        type="submit"
                        aria-label="Gửi tin nhắn trong phiên"
                        disabled={!live || !draft.trim()}
                      >
                        <Send size={20} />
                      </button>
                    </form>
                  </>
                )}
                {call.panel === "people" && (
                  <div className="dc-panel-body">
                    <p className="dc-muted">Bạn và một người tham gia mẫu.</p>
                    {call.participants.map((p) => (
                      <div className="dc-person" key={p.id}>
                        <span className="dc-person-avatar">{p.initials}</span>
                        <div>
                          <strong>{p.name}</strong>
                          <p>{p.role}</p>
                        </div>
                        <button
                          aria-label={`Ghim ${p.name} từ danh sách`}
                          onClick={() => actions.pin(p.id)}
                        >
                          <Pin size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {call.panel === "settings" && (
                  <div className="dc-panel-body">
                    <h3>Thiết bị của bạn</h3>
                    <p className="dc-muted">
                      Xem camera hoặc thử micro trên máy này khi bạn cho phép.
                    </p>
                    <button
                      className="dc-setting"
                      disabled={call.mediaBusy || call.preview}
                      onClick={() => actions.enablePreview("video")}
                    >
                      <Camera size={19} />
                      {call.preview ? "Camera máy đang mở" : "Mở camera máy"}
                    </button>
                    <button
                      className="dc-setting"
                      disabled={call.mediaBusy || call.localMic}
                      onClick={() => actions.enablePreview("audio")}
                    >
                      <Mic size={19} />
                      {call.localMic ? "Micro máy đang mở" : "Mở micro máy"}
                    </button>
                    {call.mediaBusy && <p role="status">Đang chờ quyền truy cập thiết bị…</p>}
                    {(call.preview || call.localMic) && (
                      <button className="dc-setting" onClick={actions.stopPreview}>
                        Đóng thiết bị, dùng mô phỏng
                      </button>
                    )}
                    {call.mediaError && (
                      <p className="dc-error" role="alert">
                        {call.mediaError}
                      </p>
                    )}
                    <h3>Bố cục</h3>
                    <button className="dc-setting" onClick={actions.layout}>
                      <Columns2 size={19} />
                      {call.layout === "focus" ? "Chuyển sang chia đều" : "Chuyển sang tập trung"}
                    </button>
                  </div>
                )}
              </aside>
            )}
          </div>
          <footer className="dc-toolbar">
            <div className="dc-controls">
              <Control
                icon={call.mic ? Mic : MicOff}
                label={call.mic ? "Tắt micro" : "Bật micro"}
                aria-pressed={call.mic}
                onClick={actions.toggleMic}
              />
              <Control
                icon={call.camera ? Video : VideoOff}
                label={call.camera ? "Tắt camera" : "Bật camera"}
                aria-pressed={call.camera}
                onClick={actions.toggleCamera}
              />
              <Control
                icon={Columns2}
                label="Bố cục"
                aria-pressed={call.layout === "grid"}
                onClick={actions.layout}
              />
            </div>
            <div className="dc-controls">
              <Control
                icon={MessageSquare}
                label="Chat"
                aria-expanded={call.panel === "chat"}
                onClick={(e) => openPanel("chat", e)}
              />
              <Control
                icon={Users}
                label="Người tham gia"
                aria-expanded={call.panel === "people"}
                onClick={(e) => openPanel("people", e)}
              />
              <Control
                icon={Settings}
                label="Cài đặt"
                aria-expanded={call.panel === "settings"}
                onClick={(e) => openPanel("settings", e)}
              />
            </div>
            {status === "pre-call" ? (
              <button className="dc-primary" onClick={actions.join}>
                Tham gia luyện tập <ArrowRight size={19} />
              </button>
            ) : (
              <button ref={joinRef} className="dc-leave" onClick={actions.leave}>
                <PhoneOff size={20} />
                {["joining", "waiting"].includes(status) ? "Hủy tham gia" : "Rời phòng"}
              </button>
            )}
          </footer>
          {status === "pre-call" && (
            <p className="dc-footnote">
              Một không gian để thử giao diện và luyện thao tác, cùng người tham gia mô phỏng.
            </p>
          )}
        </>
      )}
      {import.meta.env.DEV && (
        <details className="dc-scenarios">
          <summary>Tình huống xem trước</summary>
          <label htmlFor="dc-scenario">Trạng thái demo</label>
          <select
            id="dc-scenario"
            value={call.scenario}
            onChange={(e) => {
              setDraft("");
              actions.scenario(e.target.value);
            }}
          >
            {demoScenarios.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {live && <button onClick={actions.interrupt}>Giả lập gián đoạn</button>}
          {["joining", "waiting", "reconnecting"].includes(status) && (
            <button onClick={actions.advance}>Tiếp tục đến kết nối</button>
          )}
        </details>
      )}
    </section>
  );
}
