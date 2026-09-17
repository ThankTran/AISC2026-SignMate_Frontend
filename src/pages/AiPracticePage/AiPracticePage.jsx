import { useState, useEffect, useCallback, useRef } from "react";

import "./AiPracticePage.css";

import CameraViewport from "../../components/AiPractice/CameraViewport";
import TipBox from "../../components/AiPractice/TipBox";
import AiAnalyticsCard from "../../components/AiPractice/AiAnalyticsCard";
import AiFeedbackCard from "../../components/AiPractice/AiFeedbackCard";
import SessionControls from "../../components/AiPractice/SessionControls";
import SignGuideModal from "../../components/AiPractice/SignGuideModal";

/* ===== Mock data ===== */
const SIGNS = [
  {
    sign: "1",
    label: "ASL Number One",
    tip: "Giữ một ngón tay trỏ hướng lên trên, các ngón còn lại nắm chặt.",
    steps: [
      "Giơ bàn tay hướng về phía trước.",
      "Dựng ngón tay trỏ thẳng lên, các ngón còn lại nắm chặt.",
      "Giữ tư thế ổn định trong vài giây.",
    ],
  },
  {
    sign: "2",
    label: "ASL Number Two",
    tip: "Giữ hai ngón tay trỏ và giữa hướng lên trên, duỗi thẳng.",
    steps: [
      "Giơ bàn tay hướng về phía trước.",
      "Duỗi thẳng ngón trỏ và ngón giữa, tạo hình chữ V.",
      "Gập các ngón áp út và út vào lòng bàn tay.",
    ],
  },
  {
    sign: "3",
    label: "ASL Number Three",
    tip: "Giữ ba ngón trỏ, giữa, và út hướng lên trên.",
    steps: [
      "Giơ bàn tay hướng về phía trước.",
      "Duỗi thẳng ngón trỏ, ngón giữa và ngón cái.",
      "Gập ngón áp út và ngón út vào lòng bàn tay.",
    ],
  },
  {
    sign: "4",
    label: "ASL Number Four",
    tip: "Giữ bốn ngón tay duỗi thẳng và hướng lên trên. Gập ngón cái vào lòng bàn tay.",
    steps: [
      "Giơ bàn tay hướng về phía trước.",
      "Duỗi thẳng 4 ngón tay (ngón trỏ, giữa, áp út, út).",
      "Gập ngón tay cái vào sát lòng bàn tay.",
    ],
  },
  {
    sign: "5",
    label: "ASL Number Five",
    tip: "Mở rộng cả năm ngón tay, tất cả hướng lên trên.",
    steps: [
      "Giơ bàn tay hướng về phía trước.",
      "Duỗi thẳng và tách đều cả 5 ngón tay.",
      "Giữ lòng bàn tay úp ra trước mặt.",
    ],
  },
  {
    sign: "6",
    label: "ASL Number Six",
    tip: "Chạm đầu ngón cái vào đầu ngón út, ba ngón giữa duỗi lên.",
    steps: [
      "Giơ bàn tay hướng về phía trước.",
      "Chạm đầu ngón cái vào đầu ngón út.",
      "Duỗi thẳng ba ngón trỏ, giữa và áp út lên trên.",
    ],
  },
  {
    sign: "7",
    label: "ASL Number Seven",
    tip: "Chạm đầu ngón cái vào đầu ngón áp út, ba ngón giữa duỗi lên.",
    steps: [
      "Giơ bàn tay hướng về phía trước.",
      "Chạm đầu ngón cái vào đầu ngón áp út.",
      "Duỗi thẳng ngón trỏ, giữa và út lên trên.",
    ],
  },
  {
    sign: "8",
    label: "ASL Number Eight",
    tip: "Chạm đầu ngón cái vào đầu ngón giữa, các ngón còn lại duỗi lên.",
    steps: [
      "Giơ bàn tay hướng về phía trước.",
      "Chạm đầu ngón cái vào đầu ngón giữa.",
      "Duỗi thẳng ngón trỏ, áp út và út lên trên.",
    ],
  },
  {
    sign: "9",
    label: "ASL Number Nine",
    tip: "Chạm đầu ngón cái vào đầu ngón trỏ, các ngón còn lại duỗi lên.",
    steps: [
      "Giơ bàn tay hướng về phía trước.",
      "Chạm đầu ngón cái vào đầu ngón trỏ tạo vòng khép.",
      "Duỗi thẳng ngón giữa, áp út và út lên trên.",
    ],
  },
  {
    sign: "10",
    label: "ASL Number Ten",
    tip: "Nắm chặt tay rồi giơ ngón cái lên và lắc nhẹ qua lại.",
    steps: [
      "Nắm chặt bàn tay lại.",
      "Giơ ngón cái hướng lên trên.",
      "Lắc nhẹ cổ tay qua lại để thể hiện số 10.",
    ],
  },
];

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

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => +(Math.random() * (max - min) + min).toFixed(1);

/* ===== MAIN COMPONENT ===== */
const AiPracticePage = () => {
  /* ---- Core state ---- */
  const [phase, setPhase] = useState("idle"); // idle | countdown | recording | paused
  const [countdown, setCountdown] = useState(3);
  const [signIndex] = useState(3); // start at sign "4" (index 3)

  /* ---- AI metrics (simulated) ---- */
  const [accuracy, setAccuracy] = useState(100);
  const [stability, setStability] = useState(100);
  const [speed, setSpeed] = useState(1.2);
  const [posture, setPosture] = useState(100);
  const [clarity, setClarity] = useState(100);
  const [confidence, setConfidence] = useState(92);

  /* ---- Webcam / device state ---- */
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);

  /* ---- Popup đề bài ---- */
  const [guideOpen, setGuideOpen] = useState(false);

  const metricsTimer = useRef(null);
  const streamRef = useRef(null);

  const currentSign = SIGNS[signIndex];
  const feedbackIndex = signIndex % AI_FEEDBACKS.length;

  /* ---- Dọn dẹp MediaStream khi rời trang ---- */
  useEffect(() => {
    return () => {
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
      setAccuracy(rand(88, 100));
      setStability(rand(85, 100));
      setSpeed(randFloat(0.8, 2.0));
      setPosture(rand(87, 100));
      setClarity(rand(90, 100));
      setConfidence(rand(78, 99));
    }, 1500);

    return () => clearInterval(metricsTimer.current);
  }, [phase]);

  /* ---- Controls ---- */

  /* Yêu cầu bật Camera (trả về true nếu thành công) */
  const activateCamera = async () => {
    setCameraError(null);
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
      startCountdown();
    }
  };

  const handleStop = () => {
    setPhase("paused");
    if (metricsTimer.current) clearInterval(metricsTimer.current);
  };

  const handleToggleCamera = async () => {
    if (cameraOn) {
      // TẮT triệt để: dừng mọi video track của luồng camera phần cứng
      streamRef.current?.getVideoTracks().forEach((t) => t.stop());
      setStream(null);
      setCameraOn(false);
      return;
    }
    // BẬT lại: yêu cầu luồng camera mới
    await activateCamera();
  };

  const handleToggleMic = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (!track) {
      setMicOn((v) => !v);
      return;
    }
    const next = !track.enabled;
    track.enabled = next;
    setMicOn(next);
  };

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
          <h1 className="ai-practice__topnav-title">
            Luyện tập ký hiệu
            <span className="ai-practice__topnav-sep">·</span>
            <span className="ai-practice__topnav-sub">ASL: Số đếm 1–10</span>
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

        <AiFeedbackCard feedback={AI_FEEDBACKS[feedbackIndex]} />

        <SessionControls
          phase={phase}
          cameraOn={cameraOn}
          micOn={micOn}
          onToggleCamera={handleToggleCamera}
          onToggleMic={handleToggleMic}
          onStart={handleStart}
          onStop={handleStop}
        />
      </div>

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