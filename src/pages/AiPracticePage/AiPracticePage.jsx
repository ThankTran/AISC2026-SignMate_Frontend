import Modal from "../../components/ui/Modal";
import { useState, useEffect, useCallback, useRef } from "react";

import "./AiPracticePage.css";

import CameraViewport from "../../components/AiPractice/CameraViewport";
import TipBox from "../../components/AiPractice/TipBox";
import AiAnalyticsCard from "../../components/AiPractice/AiAnalyticsCard";
import AiFeedbackCard from "../../components/AiPractice/AiFeedbackCard";
import SessionControls from "../../components/AiPractice/SessionControls";
import SignGuideModal from "../../components/AiPractice/SignGuideModal";

/* ===== Mock data ===== */
const SIGNS = Array.from({length:10}, (_, index) => ({
 sign:String(index + 1), label:`VSL: Số ${index + 1}`,
 tip:'Đặt camera ngang tầm mắt, giữ đủ sáng và để cả hai tay trong khung hình.',
 steps:['Video và hướng dẫn VSL đang được cập nhật sau khi nhóm nội dung xác minh.'],
}));

const TOTAL_SIGNS = SIGNS.length;

const AI_FEEDBACKS = [
  "Hình thức ngón tay tốt! Ngón áp út hơi lệch — thử giữ cổ tay chắc hơn.",
  "Cử chỉ rất rõ ràng. Cố gắng giữ tư thế ổn định trong suốt quá trình.",
  "Tuyệt vời! Độ chính xác cao. Tiếp tục duy trì!",
  "Ngón trỏ hơi cong — thử duỗi thẳng hơn để AI nhận diện chính xác.",
  "Đã cải thiện đáng kể! Tư thế tay tốt hơn so với lần trước.",
];

const CAMERA_DENIED_MSG =
  "Vui lòng cho phép truy cập Camera để thực hiện bài tập";


/* ===== MAIN COMPONENT ===== */
const AiPracticePage = () => {
  /* ---- Core state ---- */
  const [phase, setPhase] = useState("idle"); // idle | countdown | recording | paused
  const [countdown, setCountdown] = useState(3);
  const [signIndex, setSignIndex] = useState(0); // Bắt đầu từ ký hiệu đầu tiên

  /* ---- AI metrics (simulated) ---- */
  const [accuracy, setAccuracy] = useState(null);
  const [stability, setStability] = useState(null);
  const [speed, setSpeed] = useState(null);
  const [posture, setPosture] = useState(null);
  const [clarity, setClarity] = useState(null);
  const [confidence, setConfidence] = useState(null);

  /* ---- Webcam / device state ---- */
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [summary, setSummary] = useState(null);
  const samples = useRef({sum:0,count:0,seconds:0});
  const cameraRequest = useRef(0);

  /* ---- Popup đề bài ---- */
  const [guideOpen, setGuideOpen] = useState(false);

  const metricsTimer = useRef(null);
  const streamRef = useRef(null);

  const currentSign = SIGNS[signIndex];
  const feedbackIndex = signIndex % AI_FEEDBACKS.length;

  /* ---- Dọn dẹp MediaStream khi rời trang ---- */
  useEffect(() => {
    const requestRef = cameraRequest;
    return () => {
      requestRef.current++;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  /* ---- Countdown logic ---- */
  const startCountdown = useCallback(() => {
    setPhase("countdown");
    setCountdown(3);
  }, []);

  useEffect(() => {
    if (phase !== "countdown") return;

    const t = setTimeout(() => {
      if (countdown <= 1) {
        setPhase("recording");
      } else {
        setCountdown((c) => c - 1);
      }
    }, 1000);

    return () => clearTimeout(t);
  }, [phase, countdown]);

  /* ---- Simulate fluctuating AI metrics while recording ---- */
  useEffect(() => {
    if (phase !== "recording") {
      if (metricsTimer.current) clearInterval(metricsTimer.current);
      return;
    }

    metricsTimer.current = setInterval(() => {
      samples.current.seconds += 0.2;
      const target = 85 + 7 * Math.sin(samples.current.seconds / 3);
      setAccuracy(value => { const next = Math.round((value ?? 85) + (target - (value ?? 85)) * 0.15); return next; });
      samples.current.sum += target; samples.current.count++;
      const lerp = (value) => Math.round((value ?? 85) + (target - (value ?? 85)) * 0.15);
      setStability(lerp); setPosture(lerp); setClarity(lerp); setConfidence(lerp); setSpeed(1.2);
    }, 200);

    return () => clearInterval(metricsTimer.current);
  }, [phase]);

  /* ---- Controls ---- */

  /* Yêu cầu bật Camera (trả về true nếu thành công) */
  const activateCamera = async () => {
    setCameraError(null);
    const request = ++cameraRequest.current;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null; setStream(null); setCameraOn(false);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Trình duyệt của bạn không hỗ trợ truy cập Camera.");
        setCameraOn(false);
        return false;
      }
      const media = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      if (request !== cameraRequest.current || document.hidden) { media.getTracks().forEach(track => track.stop()); return false; }
      streamRef.current = media;
      setStream(media);
      setCameraOn(true);
      return true;
    } catch (err) {
      setCameraOn(false);
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setCameraError(CAMERA_DENIED_MSG);
      } else if (
        err.name === "NotFoundError" ||
        err.name === "DevicesNotFoundError"
      ) {
        setCameraError("Không tìm thấy Camera trên thiết bị này.");
      } else {
        setCameraError("Không thể kết nối Camera. Vui lòng thử lại.");
      }
      return false;
    }
  };

  const handleStart = async () => {
    if (phase === "idle" || phase === "paused") {
      // 1) Bật Camera trước (yêu cầu quyền truy cập)
      if (!cameraOn) {
        const ok = await activateCamera();
        // Từ chối quyền: dừng, không đếm ngược
        if (!ok) return;
      }
      // 2) Bắt đầu đếm ngược 3... 2... 1...
      setSummary(null); samples.current = {sum:0,count:0,seconds:0};
      startCountdown();
    }
  };

  const handleStop = ({showSummary=true} = {}) => {
    setPhase("paused");
    if(showSummary && (phase === "recording" || phase === "countdown") && samples.current.count>0) setSummary({accuracy:Math.round(samples.current.sum / samples.current.count),seconds:Math.round(samples.current.seconds)});
    cameraRequest.current++; streamRef.current?.getTracks().forEach(track => track.stop()); streamRef.current=null; setStream(null); setCameraOn(false);
    if (metricsTimer.current) clearInterval(metricsTimer.current);
  };

  const handleToggleCamera = async () => {
    if (cameraOn) {
      handleStop();
      // TẮT triệt để: dừng mọi video track của luồng camera phần cứng
      streamRef.current?.getVideoTracks().forEach((t) => t.stop());
      setStream(null);
      setCameraOn(false);
      return;
    }
    // BẬT lại: yêu cầu luồng camera mới
    await activateCamera();
  };

  function changeSign(next) {
    handleStop({showSummary:false}); setSignIndex(next); setPhase('idle'); setSummary(null);
    setAccuracy(null); setStability(null); setSpeed(null); setPosture(null); setClarity(null); setConfidence(null);
  }
  useEffect(() => {
    const hide = () => { if (document.hidden && (cameraOn || phase === "recording" || phase === "countdown")) handleStop({showSummary:false}); };
    document.addEventListener('visibilitychange', hide);
    return () => document.removeEventListener('visibilitychange', hide);
  });

  /* ---- Guide popup ---- */
  const handleOpenGuide = () => setGuideOpen(true);
  const handleCloseGuide = () => setGuideOpen(false);
  const handleGuideStart = () => {
    setGuideOpen(false);
    handleStart();
  };

  return (
    <div className="ai-practice">
      {/* ===== LEFT COLUMN: Camera + Tip ===== */}
      <div className="ai-practice__left">
        {/* ---- Top nav bar ---- */}
        <div className="ai-practice__topnav">
          <h1 className="ai-practice__topnav-title text-h1">
            Luyện tập ký hiệu
            <span className="ai-practice__topnav-sep">·</span>
            <span className="ai-practice__topnav-sub">VSL: Số đếm 1–10</span>
          </h1>

          <div className="ai-practice__topnav-right">
            <div className="ai-practice__progress-bar">
              <div
                className="ai-practice__progress-fill"
                style={{ width: `${((signIndex + 1) / TOTAL_SIGNS) * 100}%` }}
              />
            </div>
            <span className="ai-practice__progress-text">
              {signIndex + 1} / {TOTAL_SIGNS}
            </span>
          </div>
        </div>

        <p className="ai-practice__demo" role="note">Chế độ demo · Chỉ số minh họa, chưa đánh giá cử chỉ từ camera.</p>
        <nav className="ai-practice__sign-nav" aria-label="Chọn ký hiệu"><button type="button" disabled={signIndex === 0} onClick={() => changeSign(signIndex - 1)}>← Ký hiệu trước</button><button type="button" disabled={signIndex === TOTAL_SIGNS - 1} onClick={() => changeSign(signIndex + 1)}>Ký hiệu sau →</button></nav>
        {/* ---- Camera viewport ---- */}
        <CameraViewport
          phase={phase}
          countdown={countdown}
          currentSign={currentSign.sign}
          signLabel={currentSign.label}
          confidence={confidence}
          stream={stream}
          cameraError={cameraError}
          cameraOn={cameraOn}
          onOpenGuide={handleOpenGuide}
          onRetry={activateCamera}
        />

        {/* ---- Tip box ---- */}
        <TipBox
          tip={currentSign.tip}
          signIndex={signIndex + 1}
          totalSigns={TOTAL_SIGNS}
        />
      </div>

      {/* ===== RIGHT COLUMN: Analytics + Controls ===== */}
      <div className="ai-practice__right">
        <AiAnalyticsCard
          accuracy={accuracy}
          stability={stability}
          speed={speed}
          posture={posture}
          clarity={clarity}
          isActive={phase === "recording"}
        />

        <AiFeedbackCard feedback={phase === "recording" ? `Phản hồi demo: ${AI_FEEDBACKS[feedbackIndex]}` : "Bắt đầu phiên demo để xem cách hiển thị phản hồi. Nội dung VSL đang được cập nhật."} />

        <SessionControls
          phase={phase}
          cameraOn={cameraOn}
          onToggleCamera={handleToggleCamera}
          onStart={handleStart}
          onStop={handleStop}
        />
      </div>

      {summary && <Modal labelledBy="ai-summary-title" onClose={() => setSummary(null)}><h2 id="ai-summary-title" className="text-h2">Tổng kết phiên demo</h2><p>Độ chính xác TB (minh họa): {summary.accuracy == null ? '--' : `${summary.accuracy}%`}</p><p>Thời gian: {summary.seconds} giây</p><button type="button" onClick={handleStart}>Thử lại</button><button type="button" disabled={signIndex === TOTAL_SIGNS - 1} onClick={() => changeSign(signIndex + 1)}>Ký hiệu tiếp theo</button></Modal>}
      {/* ===== POPUP: Đề bài / Hướng dẫn ký hiệu ===== */}
      {guideOpen && (
        <SignGuideModal
          sign={currentSign.sign}
          label={currentSign.label}
          steps={currentSign.steps}
          onClose={handleCloseGuide}
          onStart={handleGuideStart}
        />
      )}
    </div>
  );
};

export default AiPracticePage;
