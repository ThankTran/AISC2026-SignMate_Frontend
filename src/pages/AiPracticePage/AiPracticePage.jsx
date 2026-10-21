import { useCallback, useEffect, useRef, useState } from "react";
import { usePracticeSession } from "../../hooks/usePracticeSession";
import { useProgress } from "../../hooks/useProgress";
import { handSign } from "../../services/handSign";
import CameraViewport from "../../components/AiPractice/CameraViewport";
import AiAnalyticsCard from "../../components/AiPractice/AiAnalyticsCard";
import AiFeedbackCard from "../../components/AiPractice/AiFeedbackCard";
import SignSample from "../../components/AiPractice/SignSample";
import "./AiPracticePage.css";

export default function AiPracticePage() {
  const session = usePracticeSession();
  const { retry: refreshProgress } = useProgress();
  const [lessons, setLessons] = useState([]);
  const [index, setIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("video");
  const [phase, setPhase] = useState("idle");
  const [countdown, setCountdown] = useState(3);
  const [stream, setStream] = useState(null);
  const [framing, setFraming] = useState(null);
  const framingExpiry = useRef(null);
  const onFraming = useCallback((status) => {
    clearTimeout(framingExpiry.current);
    setFraming(status);
    if (!status.ready) setPhase((current) => (current === "countdown" ? "preview" : current));
    framingExpiry.current = setTimeout(() => {
      setFraming({ ready: false, message: "Đang kiểm tra lại vị trí…" });
      setPhase((current) => (current === "countdown" ? "preview" : current));
    }, 2500);
  }, []);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [cameraError, setCameraError] = useState(null);
  const [loading, setLoading] = useState(true);
  const media = useRef(null),
    recorder = useRef(null),
    recording = useRef(null);
  const request = useRef(null),
    generation = useRef(0),
    sample = useRef(null),
    busyRef = useRef(false);
  const label = lessons[index];
  const busy = ["starting", "preview", "countdown", "recording", "processing"].includes(phase);
  const release = () => {
    clearTimeout(framingExpiry.current);
    setFraming(null);
    media.current?.getTracks().forEach((track) => track.stop());
    media.current = null;
    setStream(null);
  };

  async function loadLessons() {
    setLoading(true);
    setError("");

    try {
      setLessons(await handSign.lessons());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    const generationRef = generation;

    handSign
      .lessons(controller.signal)
      .then(setLessons)
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      clearTimeout(framingExpiry.current);
      generationRef.current++;
      request.current?.abort();
      controller.abort();

      if (recorder.current?.state === "recording") {
        recorder.current.stop();
      }

      media.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);
  async function start() {
    if (busyRef.current || !label) {
      return;
    }

    busyRef.current = true;

    const token = ++generation.current;

    setError("");
    setCameraError(null);
    setResult(null);
    setPhase("starting");

    try {
      if (!window.isSecureContext) {
        throw new Error(
          "Camera cần kết nối bảo mật. Hãy mở ứng dụng bằng localhost trên máy này hoặc dùng HTTPS.",
        );
      }

      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        throw new Error(
          "Trình duyệt chưa hỗ trợ ghi hình. Hãy dùng Chrome hoặc Edge và cho phép camera.",
        );
      }

      if (session.hasOpenSession() && !(await session.finish())) {
        throw new Error("Chưa thể kết thúc phiên trước. Vui lòng thử lại.");
      }

      if (!(await session.start(label))) {
        throw (
          session.getStartError() || new Error("Chưa thể tạo phiên luyện tập. Vui lòng thử lại.")
        );
      }

      if (token !== generation.current) {
        await session.finish();

        return;
      }

      const capture = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: 25 },
        audio: false,
      });

      if (token !== generation.current) {
        capture.getTracks().forEach((track) => track.stop());

        return;
      }

      media.current = capture;
      setStream(capture);

      const mimeType = ["video/webm;codecs=vp8", "video/webm", "video/mp4"].find((type) =>
        MediaRecorder.isTypeSupported(type),
      );
      const current = new MediaRecorder(capture, mimeType ? { mimeType } : undefined);
      const chunks = [];

      recording.current = new Promise((resolve, reject) => {
        current.ondataavailable = (event) => {
          if (event.data.size) {
            chunks.push(event.data);
          }
        };

        current.onstop = () => resolve(new Blob(chunks, { type: current.mimeType }));
        current.onerror = () => {
          const error = new Error("Không thể lưu video. Vui lòng thử lại.");

          reject(error);

          if (token === generation.current) {
            release();
            setError(error.message);
            setPhase("idle");
            busyRef.current = false;
            void session.finish();
          }
        };
      });
      // Keep an early recorder error handled until the stop action awaits it.
      recording.current.catch(() => {});
      recorder.current = current;
      setCountdown(3);
      setPhase("preview");
    } catch (err) {
      if (token === generation.current) {
        const cameraMessages = {
          NotAllowedError:
            "Camera đang bị chặn. Mở quyền trang web cạnh thanh địa chỉ, cho phép Camera rồi thử lại.",
          NotFoundError: "Không tìm thấy camera. Hãy kiểm tra kết nối camera rồi thử lại.",
          NotReadableError:
            "Không đọc được camera. Hãy đóng ứng dụng khác đang dùng camera rồi thử lại.",
          AbortError: "Camera bị ngắt khi khởi động. Hãy kết nối lại và thử lại.",
        };
        const message = cameraMessages[err.name] || err.message;

        release();
        setError(message);
        setCameraError(cameraMessages[err.name] ? message : null);
        setPhase("idle");
        busyRef.current = false;
        await session.finish();
      }
    }
  }

  function beginCountdown() {
    if (phase !== "preview" || !framing?.ready || !media.current?.active) return;
    setCountdown(3);
    setPhase("countdown");
  }

  useEffect(() => {
    if (phase !== "countdown") {
      return;
    }
    if (!framing?.ready) {
      return;
    }

    const timer = setTimeout(() => {
      if (countdown > 1) {
        setCountdown(countdown - 1);
      } else {
        recorder.current.start(250);
        setPhase("recording");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [phase, countdown, framing?.ready]);
  async function stop() {
    if (recorder.current?.state !== "recording") {
      return;
    }

    const token = generation.current;

    setPhase("processing");
    recorder.current.stop();
    request.current = new AbortController();

    try {
      const video = await recording.current;

      release();

      const output = await handSign.evaluate(label, video, request.current.signal);

      if (token === generation.current) {
        setResult(output);
        setPhase("result");
      }
    } catch (err) {
      if (token === generation.current) {
        setError(err.message);
        setPhase("idle");
      }
    } finally {
      const finished = await session.finish();

      if (finished) {
        refreshProgress();
      }

      if (token === generation.current) {
        busyRef.current = false;
      }
    }
  }

  // Bound recording length to the service limit; hiding the tab cancels capture.
  useEffect(() => {
    const timer = phase === "recording" ? setTimeout(stop, 15000) : null;
    const hide = () => {
      if (document.hidden && ["starting", "preview", "countdown", "recording"].includes(phase)) {
        generation.current++;

        if (recorder.current?.state === "recording") {
          recorder.current.stop();
        }

        release();
        setPhase("idle");
        busyRef.current = false;
        setError("Phiên quay đã dừng khi bạn rời màn hình. Hãy thử lại.");
        void session.finish();
      }
    };

    document.addEventListener("visibilitychange", hide);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", hide);
    };
  });
  // Keep the shortcut in sync with the visible controls and current recording phase.
  useEffect(() => {
    if (activeTab !== "camera") {
      return;
    }

    const handleCameraShortcut = (event) => {
      if (
        event.code !== "Space" ||
        event.defaultPrevented ||
        event.isComposing ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        document.hidden
      ) {
        return;
      }

      const target = event.target;

      if (target instanceof Element) {
        if (
          target.closest(
            'input, textarea, select, a, video, audio, [role="textbox"], [role="combobox"], [role="slider"], [role="dialog"], [aria-modal="true"]',
          ) ||
          target.isContentEditable
        ) {
          return;
        }

        const button = target.closest('button, [role="button"], [role="tab"]');

        if (button && !button.matches("[data-camera-action], #practice-tab-camera")) {
          return;
        }
      }

      event.preventDefault();

      if (event.repeat) {
        return;
      }

      if (phase === "recording") {
        void stop();
      } else if (phase === "preview") {
        beginCountdown();
      } else if (!busy && !loading && label && session.status !== "loading") {
        void start();
      }
    };

    document.addEventListener("keydown", handleCameraShortcut);

    return () => document.removeEventListener("keydown", handleCameraShortcut);
  });
  function switchTab(next) {
    if (next === "video" && ["starting", "preview", "countdown", "recording"].includes(phase)) {
      generation.current++;

      if (recorder.current?.state === "recording") {
        recorder.current.stop();
      }

      release();
      setPhase("idle");
      busyRef.current = false;
      void session.finish();
    }

    if (next === "camera") {
      sample.current?.pause();
    }

    setActiveTab(next);
  }

  function showSample() {
    switchTab("video");
    document.getElementById("practice-tab-video")?.focus();
  }

  function handleTabKey(event) {
    const next = {
      ArrowLeft: activeTab === "video" ? "camera" : "video",
      ArrowRight: activeTab === "video" ? "camera" : "video",
      Home: "video",
      End: "camera",
    }[event.key];

    if (!next) {
      return;
    }

    event.preventDefault();
    switchTab(next);
    document.getElementById(`practice-tab-${next}`)?.focus();
  }

  function select(next) {
    setIndex(next);
    setResult(null);
    setError("");
    setPhase("idle");
  }

  const passed = result?.status === "correct";

  return (
    <div className="ai-practice">
      <div className="ai-practice__header">
        <h1 className="text-h1">Luyện tập với AI</h1>
        {loading && <p role="status">Đang tải động tác từ HandSign…</p>}
        {(error || session.error) && (
          <div className="practice-error" role="alert">
            <p>{error || session.error?.message || "Không thể đồng bộ phiên luyện tập."}</p>
            {!lessons.length && <button onClick={loadLessons}>Kết nối lại</button>}
          </div>
        )}
        <div className="practice-toolbar">
          <div
            className="practice-tabs"
            role="tablist"
            aria-label="Chế độ luyện tập"
            onKeyDown={handleTabKey}
          >
            {[
              ["video", "Xem video"],
              ["camera", "Luyện tập trước camera"],
            ].map(([id, title]) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`practice-tab-${id}`}
                aria-controls={`practice-panel-${id}`}
                aria-selected={activeTab === id}
                tabIndex={activeTab === id ? 0 : -1}
                onClick={() => switchTab(id)}
              >
                {title}
              </button>
            ))}
          </div>
          <label className="practice-lesson">
            <span className="practice-lesson__heading">
              <span>Động tác đang luyện</span>
              {lessons.length > 0 && (
                <span className="ai-practice__progress-text">
                  {index + 1} / {lessons.length}
                </span>
              )}
            </span>
            <select
              value={index}
              disabled={busy || loading || !lessons.length || session.status === "loading"}
              onChange={(event) => select(Number(event.target.value))}
            >
              {lessons.map((item, i) => (
                <option key={item} value={i}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <section
        id="practice-panel-video"
        role="tabpanel"
        aria-labelledby="practice-tab-video"
        hidden={activeTab !== "video"}
        tabIndex={0}
      >
        {label && <SignSample key={label} label={label} videoRef={sample} />}
        <div className="practice-controls practice-video-actions">
          <button
            className="practice-primary"
            disabled={!label || loading}
            onClick={() => {
              switchTab("camera");
              document.getElementById("practice-tab-camera")?.focus();
            }}
          >
            Luyện tập trước camera
          </button>
        </div>
      </section>
      <section
        className="practice-camera-panel"
        id="practice-panel-camera"
        role="tabpanel"
        aria-labelledby="practice-tab-camera"
        hidden={activeTab !== "camera"}
        tabIndex={0}
      >
        <div className="ai-practice__left">
          <CameraViewport
            phase={phase}
            countdown={countdown}
            currentSign={label || "—"}
            signLabel="Lượt thực hiện của bạn"
            stream={stream}
            framing={framing}
            onFraming={onFraming}
            cameraError={cameraError}
            cameraOn={!!stream}
            onOpenGuide={showSample}
            onRetry={start}
          />
          <p className="practice-shortcut">
            <kbd>Space</kbd>
            <span>
              Mở camera · Khi khung xanh: bắt đầu đếm ngược · Khi đang quay: chấm điểm. Phím tắt tạm
              ngưng khi đếm ngược hoặc AI đang chấm.
            </span>
          </p>
          <p className="practice-hint">
            Giữ tay rõ trong khung hình và thực hiện trọn vẹn động tác. Nhấn “Chấm động tác” khi
            hoàn thành (tối đa 15 giây).
          </p>
        </div>
        <aside className="ai-practice__right">
          <AiAnalyticsCard result={result} phase={phase} />
          <AiFeedbackCard
            feedback={
              result?.status === "incorrect_label" || result?.recognition?.status === "mismatch"
                ? [{ message: "Không khớp yêu cầu. Vui lòng thử lại." }]
                : result?.feedback
            }
          />
          {result ? (
            <section
              className={`practice-result ${passed ? "practice-result--passed" : ""}`}
              aria-live="polite"
            >
              <span className="practice-result__eyebrow">
                {passed ? "ĐÃ HOÀN THÀNH" : "CẦN THỬ LẠI"}
              </span>
              <h2>
                {passed
                  ? "Động tác đã đạt"
                  : result?.status === "incorrect_label"
                    ? "Không khớp yêu cầu. Vui lòng thử lại."
                    : "Chưa thể xác nhận động tác"}
              </h2>
              {!passed && result?.status !== "incorrect_label" && (
                <>
                  <p>Hệ thống chưa ghi nhận động tác khớp với mẫu “{label}”.</p>
                  <p>Hãy giữ tay rõ trong khung hình, thực hiện trọn vẹn động tác và thử lại.</p>
                </>
              )}
              <div className="practice-actions">
                {!passed && <button onClick={showSample}>Xem động tác mẫu</button>}
                <button
                  data-camera-action
                  aria-keyshortcuts="Space"
                  disabled={session.status === "loading"}
                  onClick={start}
                >
                  Thử lại
                </button>
                {passed && (
                  <button
                    className="practice-primary"
                    disabled={session.status === "loading"}
                    onClick={() => {
                      select((index + 1) % lessons.length);
                    }}
                  >
                    Tiếp tục
                  </button>
                )}
              </div>
            </section>
          ) : (
            <section className="practice-controls">
              <button
                data-camera-action
                aria-keyshortcuts="Space"
                className="practice-primary"
                disabled={
                  phase === "preview"
                    ? !framing?.ready
                    : phase !== "recording" &&
                      (busy || loading || !label || session.status === "loading")
                }
                onClick={
                  phase === "recording" ? stop : phase === "preview" ? beginCountdown : start
                }
              >
                {phase === "processing"
                  ? "AI đang chấm động tác…"
                  : phase === "recording"
                    ? "Chấm động tác"
                    : phase === "countdown"
                      ? `Chuẩn bị · ${countdown}`
                      : phase === "starting"
                        ? "Đang mở camera…"
                        : phase === "preview"
                          ? framing?.ready
                            ? "Sẵn sàng · Đếm ngược 3 giây"
                            : "Căn chỉnh đến khi khung xanh"
                          : "Mở camera"}
              </button>
              <button onClick={showSample} disabled={!label}>
                Xem động tác mẫu
              </button>
            </section>
          )}
        </aside>
      </section>
    </div>
  );
}
