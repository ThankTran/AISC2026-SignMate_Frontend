import { useState, useId, useRef, useEffect } from "react";
import {
  Camera,
  CameraOff,
  Video,
  CheckCircle2,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  PhoneOff,
  Smile,
  Hand,
  Maximize2,
  AlertCircle,
} from "lucide-react";

const GESTURE_DEMOS = [
  {
    id: "hello",
    label: "Xin chào 👋",
    vslName: "Xin chào (Chào hỏi cơ bản)",
    level: "Cấp độ A1",
    score: 98.4,
    feedback: "Góc mở bàn tay và vị trí ngang tầm trán đạt chuẩn VSL.",
    nodes: [
      { id: 0, x: 50, y: 88, name: "Cổ tay" },
      { id: 1, x: 42, y: 80, name: "Khớp ngón cái 1" },
      { id: 2, x: 36, y: 70, name: "Khớp ngón cái 2" },
      { id: 3, x: 32, y: 60, name: "Khớp ngón cái 3" },
      { id: 4, x: 28, y: 50, name: "Đầu ngón cái" },
      { id: 5, x: 44, y: 55, name: "Khớp gốc ngón trỏ" },
      { id: 6, x: 42, y: 42, name: "Khớp giữa ngón trỏ" },
      { id: 7, x: 40, y: 30, name: "Khớp trên ngón trỏ" },
      { id: 8, x: 39, y: 18, name: "Đầu ngón trỏ" },
      { id: 9, x: 50, y: 53, name: "Khớp gốc ngón giữa" },
      { id: 10, x: 50, y: 39, name: "Khớp giữa ngón giữa" },
      { id: 11, x: 50, y: 26, name: "Khớp trên ngón giữa" },
      { id: 12, x: 50, y: 14, name: "Đầu ngón giữa" },
      { id: 13, x: 56, y: 56, name: "Khớp gốc ngón áp út" },
      { id: 14, x: 58, y: 43, name: "Khớp giữa ngón áp út" },
      { id: 15, x: 60, y: 31, name: "Khớp trên ngón áp út" },
      { id: 16, x: 61, y: 20, name: "Đầu ngón áp út" },
      { id: 17, x: 62, y: 62, name: "Khớp gốc ngón út" },
      { id: 18, x: 66, y: 52, name: "Khớp giữa ngón út" },
      { id: 19, x: 70, y: 42, name: "Khớp trên ngón út" },
      { id: 20, x: 73, y: 33, name: "Đầu ngón út" },
    ],
    connections: [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [5, 9], [9, 10], [10, 11], [11, 12],
      [9, 13], [13, 14], [14, 15], [15, 16],
      [13, 17], [17, 18], [18, 19], [19, 20],
      [0, 17],
    ],
  },
  {
    id: "thanks",
    label: "Cảm ơn 🙏",
    vslName: "Cảm ơn (Lịch thiệp)",
    level: "Cấp độ A1",
    score: 96.8,
    feedback: "Độ nghiêng lòng bàn tay hướng về phía trước chuẩn xác.",
    nodes: [
      { id: 0, x: 50, y: 90, name: "Cổ tay" },
      { id: 1, x: 44, y: 82, name: "Khớp ngón cái 1" },
      { id: 2, x: 40, y: 74, name: "Khớp ngón cái 2" },
      { id: 3, x: 38, y: 66, name: "Khớp ngón cái 3" },
      { id: 4, x: 37, y: 58, name: "Đầu ngón cái" },
      { id: 5, x: 46, y: 62, name: "Khớp gốc ngón trỏ" },
      { id: 6, x: 46, y: 50, name: "Khớp giữa ngón trỏ" },
      { id: 7, x: 46, y: 38, name: "Khớp trên ngón trỏ" },
      { id: 8, x: 46, y: 26, name: "Đầu ngón trỏ" },
      { id: 9, x: 51, y: 62, name: "Khớp gốc ngón giữa" },
      { id: 10, x: 51, y: 49, name: "Khớp giữa ngón giữa" },
      { id: 11, x: 51, y: 36, name: "Khớp trên ngón giữa" },
      { id: 12, x: 51, y: 24, name: "Đầu ngón giữa" },
      { id: 13, x: 56, y: 64, name: "Khớp gốc ngón áp út" },
      { id: 14, x: 56, y: 52, name: "Khớp giữa ngón áp út" },
      { id: 15, x: 56, y: 40, name: "Khớp trên ngón áp út" },
      { id: 16, x: 56, y: 28, name: "Đầu ngón áp út" },
      { id: 17, x: 61, y: 68, name: "Khớp gốc ngón út" },
      { id: 18, x: 62, y: 58, name: "Khớp giữa ngón út" },
      { id: 19, x: 63, y: 48, name: "Khớp trên ngón út" },
      { id: 20, x: 64, y: 38, name: "Đầu ngón út" },
    ],
    connections: [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [5, 9], [9, 10], [10, 11], [11, 12],
      [9, 13], [13, 14], [14, 15], [15, 16],
      [13, 17], [17, 18], [18, 19], [19, 20],
      [0, 17],
    ],
  },
  {
    id: "love",
    label: "Yêu thương 🤟",
    vslName: "Tôi yêu bạn (I Love You - VSL)",
    level: "Cấp độ A2",
    score: 99.2,
    feedback: "Ngón cái, ngón trỏ và ngón út mở đều, hai ngón giữa gập sát lòng bàn tay.",
    nodes: [
      { id: 0, x: 50, y: 88, name: "Cổ tay" },
      { id: 1, x: 38, y: 80, name: "Khớp ngón cái 1" },
      { id: 2, x: 28, y: 72, name: "Khớp ngón cái 2" },
      { id: 3, x: 20, y: 62, name: "Khớp ngón cái 3" },
      { id: 4, x: 14, y: 52, name: "Đầu ngón cái" },
      { id: 5, x: 44, y: 58, name: "Khớp gốc ngón trỏ" },
      { id: 6, x: 42, y: 44, name: "Khớp giữa ngón trỏ" },
      { id: 7, x: 40, y: 30, name: "Khớp trên ngón trỏ" },
      { id: 8, x: 38, y: 16, name: "Đầu ngón trỏ" },
      { id: 9, x: 50, y: 58, name: "Khớp gốc ngón giữa" },
      { id: 10, x: 50, y: 64, name: "Khớp giữa ngón giữa" },
      { id: 11, x: 50, y: 70, name: "Khớp trên ngón giữa" },
      { id: 12, x: 50, y: 75, name: "Đầu ngón giữa" },
      { id: 13, x: 56, y: 60, name: "Khớp gốc ngón áp út" },
      { id: 14, x: 56, y: 66, name: "Khớp giữa ngón áp út" },
      { id: 15, x: 56, y: 72, name: "Khớp trên ngón áp út" },
      { id: 16, x: 56, y: 76, name: "Đầu ngón áp út" },
      { id: 17, x: 62, y: 64, name: "Khớp gốc ngón út" },
      { id: 18, x: 67, y: 50, name: "Khớp giữa ngón út" },
      { id: 19, x: 72, y: 36, name: "Khớp trên ngón út" },
      { id: 20, x: 76, y: 22, name: "Đầu ngón út" },
    ],
    connections: [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [5, 9], [9, 10], [10, 11], [11, 12],
      [9, 13], [13, 14], [14, 15], [15, 16],
      [13, 17], [17, 18], [18, 19], [19, 20],
      [0, 17],
    ],
  },
];

export default function HeroPreview() {
  const [activeTab, setActiveTab] = useState("ai"); // 'ai' | 'call'
  const [activeGesture, setActiveGesture] = useState(GESTURE_DEMOS[0]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);
  const [webcamError, setWebcamError] = useState(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const videoRef = useRef(null);
  const glowFilterId = useId();

  // Attach stream to video tag
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = webcamStream ?? null;
    }
  }, [webcamStream]);

  // Cleanup webcam stream when switching tabs or unmounting
  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [webcamStream]);

  const handleSwitchTab = (tab) => {
    if (tab !== "ai" && webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
      setIsWebcamOn(false);
    }
    setActiveTab(tab);
  };

  // Audio chime & haptic feedback on gesture selection
  const triggerFeedback = () => {
    if (isSoundEnabled) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.29);
        }
      } catch {
        // AudioContext policy suppression fallback
      }
    }
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate([25, 20, 35]);
      } catch {
        // Safe fallback
      }
    }
  };

  const handleSelectGesture = (gesture) => {
    setActiveGesture(gesture);
    triggerFeedback();
  };

  const toggleWebcam = async () => {
    if (isWebcamOn) {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
      }
      setWebcamStream(null);
      setIsWebcamOn(false);
      setWebcamError(null);
    } else {
      try {
        setWebcamError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        });
        setWebcamStream(stream);
        setIsWebcamOn(true);
        triggerFeedback();
      } catch (err) {
        console.warn("Webcam access error:", err);
        setWebcamError(
          "Không thể mở camera (quyền bị từ chối hoặc camera đang bận). Chế độ mô phỏng AI 3D vẫn hoạt động bình thường."
        );
        setIsWebcamOn(false);
      }
    }
  };

  return (
    <div className="hero-preview-wrapper">
      {/* Top Segmented Controls */}
      <div className="preview-mode-switch" role="tablist" aria-label="Chế độ xem trước sản phẩm">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "ai"}
          className={`mode-tab ${activeTab === "ai" ? "mode-tab--active" : ""}`}
          onClick={() => handleSwitchTab("ai")}
        >
          <Camera size={15} aria-hidden="true" />
          <span>AI Chấm điểm cử chỉ</span>
          <span className="mode-badge">21 Khớp</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "call"}
          className={`mode-tab ${activeTab === "call" ? "mode-tab--active" : ""}`}
          onClick={() => handleSwitchTab("call")}
        >
          <Video size={15} aria-hidden="true" />
          <span>SignConnect Video 1-1</span>
          <span className="mode-badge mode-badge--purple">P2P</span>
        </button>
      </div>

      {/* Main Preview Container */}
      <div className="preview-window">
        {/* Window Chrome / Header */}
        <div className="preview-window-bar">
          <div className="window-dots" aria-hidden="true">
            <span className="dot dot--red" />
            <span className="dot dot--yellow" />
            <span className="dot dot--green" />
          </div>
          <div className="window-status">
            {activeTab === "ai" ? (
              <>
                <span className="live-indicator" />
                <span className="window-title">AI Camera Studio • MediaPipe 21 Landmarks</span>
              </>
            ) : (
              <>
                <span className="live-indicator live-indicator--green" />
                <span className="window-title">SignConnect Room #VSL-8024 • WebRTC HD</span>
              </>
            )}
          </div>
          <div className="window-actions">
            <button
              type="button"
              className={`btn-sound-toggle ${isSoundEnabled ? "btn-sound-toggle--active" : ""}`}
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              title={isSoundEnabled ? "Tắt âm thanh hiệu ứng" : "Bật âm thanh hiệu ứng"}
              aria-label="Bật tắt âm thanh hiệu ứng"
            >
              {isSoundEnabled ? <Volume2 size={13} aria-hidden="true" /> : <VolumeX size={13} aria-hidden="true" />}
            </button>
            <span className="fps-badge">{activeTab === "ai" ? (isWebcamOn ? "LIVE 30FPS" : "30 FPS") : "18ms"}</span>
          </div>
        </div>

        {/* Tab 1: AI Hand Pose Practice Mode */}
        {activeTab === "ai" && (
          <div className="preview-content preview-content--ai">
            {/* Visual Canvas: Video Background + SVG Skeleton */}
            <div className="ai-canvas">
              {isWebcamOn && webcamStream ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="ai-webcam-video"
                    aria-label="Luồng video webcam trực tiếp"
                  />
                  <div className="ai-webcam-badge">
                    <span className="rec-dot-pulse" aria-hidden="true" />
                    <span>Webcam Trực tiếp • Client-side 100%</span>
                  </div>
                </>
              ) : (
                <>
                  {/* Background gradient & grid */}
                  <div className="ai-camera-feed" />
                  {/* Hand Silhouette Guide */}
                  <div className="ai-hand-silhouette" />
                </>
              )}

              {/* 21 Landmarks SVG Overlay */}
              <svg
                className="ai-skeleton-svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
                aria-label="Khung xương 21 khớp bàn tay MediaPipe"
              >
                <defs>
                  <linearGradient id="boneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1D9E75" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#7F77DD" stopOpacity="0.8" />
                  </linearGradient>
                  <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Connections (Bones) */}
                {activeGesture.connections.map(([fromIdx, toIdx], i) => {
                  const p1 = activeGesture.nodes[fromIdx];
                  const p2 = activeGesture.nodes[toIdx];
                  if (!p1 || !p2) return null;
                  return (
                    <line
                      key={`bone-${i}`}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      className="skeleton-bone"
                      stroke="url(#boneGrad)"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* 21 Landmark Nodes */}
                {activeGesture.nodes.map((node) => (
                  <g
                    key={`node-${node.id}`}
                    className={`skeleton-node-group ${hoveredNode === node.id ? "node--hovered" : ""}`}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="2.8"
                      className="skeleton-node-halo"
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="1.8"
                      className="skeleton-node-dot"
                      filter={`url(#${glowFilterId})`}
                    />
                  </g>
                ))}
              </svg>

              {/* Top Floating Feedback Card */}
              <div className="ai-floating-card ai-floating-card--top">
                <div className="accuracy-pill">
                  <CheckCircle2 size={16} className="text-teal" />
                  <span className="accuracy-number">{activeGesture.score}%</span>
                  <span className="accuracy-label">Chính xác</span>
                </div>
                <div className="accuracy-progress-bar">
                  <div
                    className="accuracy-progress-fill"
                    style={{ width: `${activeGesture.score}%` }}
                  />
                </div>
              </div>

              {/* Bottom Floating Feedback Card */}
              <div className="ai-floating-card ai-floating-card--bottom">
                <div className="feedback-header">
                  <Sparkles size={14} className="text-purple" />
                  <span className="feedback-tag">AI Phản hồi trực tiếp</span>
                </div>
                <p className="feedback-text">{activeGesture.feedback}</p>
              </div>

              {/* Landmark tooltip */}
              {hoveredNode !== null && (
                <div className="node-tooltip">
                  Khớp #{hoveredNode}: {activeGesture.nodes[hoveredNode]?.name}
                </div>
              )}
            </div>

            {/* Camera error toast */}
            {webcamError && (
              <div className="webcam-error-toast" role="alert">
                <AlertCircle size={15} aria-hidden="true" />
                <span>{webcamError}</span>
                <button
                  type="button"
                  onClick={() => setWebcamError(null)}
                  className="btn-toast-close"
                  aria-label="Đóng thông báo lỗi"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Gesture Selection Bar with Live Webcam Toggle */}
            <div className="gesture-select-bar">
              <div className="gesture-select-header">
                <span className="gesture-select-title">Thử đổi ký hiệu VSL:</span>
                <button
                  type="button"
                  className={`btn-webcam-toggle ${isWebcamOn ? "btn-webcam-toggle--active" : ""}`}
                  onClick={toggleWebcam}
                  aria-label={isWebcamOn ? "Tắt Webcam" : "Thử trực tiếp với Webcam của bạn"}
                >
                  {isWebcamOn ? <CameraOff size={13} aria-hidden="true" /> : <Camera size={13} aria-hidden="true" />}
                  <span>{isWebcamOn ? "Tắt Webcam" : "Thử với Webcam"}</span>
                </button>
              </div>
              <div className="gesture-pill-group">
                {GESTURE_DEMOS.map((gesture) => (
                  <button
                    key={gesture.id}
                    type="button"
                    className={`gesture-btn ${activeGesture.id === gesture.id ? "gesture-btn--active" : ""}`}
                    onClick={() => handleSelectGesture(gesture)}
                  >
                    {gesture.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: SignConnect 1-1 Video Mode */}
        {activeTab === "call" && (
          <div className="preview-content preview-content--call">
            <div className="call-grid">
              {/* Local Participant (Learner) */}
              <div className="call-participant call-participant--local">
                <div className="participant-badge">
                  <span>Bạn (Học viên)</span>
                  <span className="framing-status">✓ Góc quay chuẩn</span>
                </div>
                <div className="video-avatar-box">
                  <div className="avatar-placeholder avatar-placeholder--local">
                    <Hand size={36} className="text-teal" />
                  </div>
                  <div className="hand-framing-box">
                    <span className="corner corner--tl" />
                    <span className="corner corner--tr" />
                    <span className="corner corner--bl" />
                    <span className="corner corner--br" />
                    <span className="framing-text">Khung quan sát bàn tay & khuôn mặt</span>
                  </div>
                </div>
              </div>

              {/* Remote Participant (Partner) */}
              <div className="call-participant call-participant--remote">
                <div className="participant-badge">
                  <span>Khánh Vy (Bạn luyện tập • Deaf)</span>
                  <span className="partner-level">Level B1</span>
                </div>
                <div className="video-avatar-box">
                  <div className="avatar-placeholder avatar-placeholder--remote">
                    <Smile size={36} className="text-purple" />
                  </div>
                  {/* Live Caption / Gesture translation bubble */}
                  <div className="call-caption-bubble">
                    <span className="caption-tag">Ký hiệu VSL:</span>
                    <p className="caption-text">"Chào bạn! Rất vui được cùng luyện tập hôm nay."</p>
                  </div>
                </div>
              </div>
            </div>

            {/* WebRTC Control Bar */}
            <div className="call-control-bar">
              <div className="control-btn-group">
                <button type="button" className="call-ctrl-btn" aria-label="Micro">
                  <Volume2 size={16} />
                </button>
                <button type="button" className="call-ctrl-btn call-ctrl-btn--active" aria-label="Camera">
                  <Camera size={16} />
                </button>
                <button type="button" className="call-ctrl-btn" aria-label="Phóng to">
                  <Maximize2 size={16} />
                </button>
              </div>
              <div className="call-p2p-info">
                <Zap size={13} className="text-teal" />
                <span>P2P WebRTC • Mã hóa đầu-cuối</span>
              </div>
              <button type="button" className="call-hangup-btn" aria-label="Thoát phòng">
                <PhoneOff size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Ambient Badge Underneath */}
      <div className="preview-ambient-stats">
        <div className="stat-pill">
          <span className="stat-pill-dot" />
          <span>Thời gian phản hồi AI &lt; 50ms</span>
        </div>
        <div className="stat-pill stat-pill--purple">
          <span>Chuẩn Ngôn ngữ Ký hiệu Việt Nam (VSL)</span>
        </div>
      </div>
    </div>
  );
}
