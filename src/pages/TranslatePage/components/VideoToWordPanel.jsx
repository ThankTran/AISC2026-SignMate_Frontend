import { createRequestLifecycle } from "../requestLifecycle";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  UploadCloud,
  FileVideo,
  X,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Loader2,
  Sliders,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import vslApi from "../../../services/vslApi";
import "./VideoToWordPanel.css";

const ALLOWED_EXTENSIONS = [".mp4", ".mov", ".avi", ".mkv", ".webm"];
const MAX_FILE_SIZE_MB = 100;

export default function VideoToWordPanel({ draftVideo = null, onDraftChange }) {
  const [selectedFile, setSelectedFile] = useState(draftVideo);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [minConfidence, setMinConfidence] = useState(0.35);
  const [result, setResult] = useState(null);
  const [errorState, setErrorState] = useState(null);
  const [showVocabList, setShowVocabList] = useState(true);
  const [recLabels, setRecLabels] = useState([]);
  const [vocabError, setVocabError] = useState("");
  const [vocabLoading, setVocabLoading] = useState(true);
  const [vocabAttempt, setVocabAttempt] = useState(0);

  const fileInputRef = useRef(null);
  const requestRef = useRef(null);
  if (requestRef.current === null) requestRef.current = createRequestLifecycle();
  useEffect(() => {
    const requests = requestRef.current;
    return () => requests.cancel();
  }, []);

  // Derived preview URL
  const previewUrl = useMemo(() => {
    if (!selectedFile) return null;
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Load the 100 recognition labels
  useEffect(() => {
    let isMounted = true;
    vslApi
      .getVocabularySummary()
      .then((data) => {
        if (isMounted && data?.recognition_labels) {
          setRecLabels(data.recognition_labels);
        }
      })
      .catch((error) => {
        if (isMounted) setVocabError(error.message || "Không tải được danh sách cử chỉ.");
      })
      .finally(() => {
        if (isMounted) setVocabLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [vocabAttempt]);

  // Sync draft
  useEffect(() => {
    onDraftChange?.(selectedFile);
  }, [selectedFile, onDraftChange]);

  const validateFile = (file) => {
    if (!file) return "Vui lòng chọn một file video.";
    const name = file.name.toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
    if (!hasValidExt) {
      return `Chỉ hỗ trợ định dạng: ${ALLOWED_EXTENSIONS.join(", ").toUpperCase()}`;
    }
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_FILE_SIZE_MB) {
      return `File quá lớn (${sizeMb.toFixed(1)} MB). Giới hạn tối đa là ${MAX_FILE_SIZE_MB} MB.`;
    }
    return null;
  };

  const handleFileSelect = (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setErrorState({ message: validationError, code: "VALIDATION_ERROR" });
      return;
    }
    setErrorState(null);
    setResult(null);
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setResult(null);
    setErrorState(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRecognize = async () => {
    if (!selectedFile || isProcessing) return;

    const signal = requestRef.current.start();

    setIsProcessing(true);
    setErrorState(null);
    setResult(null);

    try {
      const data = await vslApi.translateVideoToText(selectedFile, {
        expectedSigns: 1, // Single word gesture prediction
        minConfidence,
        signal,
      });

      if (signal.aborted) return;
      const firstSeg = data.segments?.[0] || null;
      const predictedLabel = data.labels?.[0] || data.text || firstSeg?.label;
      const confidence = firstSeg?.confidence ?? null;
      const topPredictions = firstSeg?.top_predictions || [];

      setResult({
        predictedLabel,
        confidence,
        topPredictions,
        duration: data.duration_seconds,
        modelName: data.recognition_model,
        rawText: data.text,
      });
    } catch (err) {
      if (signal.aborted || err.name === "AbortError") return;

      console.error("Video recognition error:", err);
      let userMsg = err.message || "Quá trình nhận diện thất bại.";
      if (!err.message) {
        if (err.status === 422) {
          userMsg =
            "Không nhận diện được cử chỉ đạt ngưỡng tin cậy. Hãy thử quay lại rõ nét hơn hoặc hạ ngưỡng tin cậy.";
        } else if (err.status === 503) {
          userMsg =
            "Mô hình nhận diện VideoMAE đang tải hoặc chưa sẵn sàng. Vui lòng thử lại sau vài giây.";
        }
      }

      setErrorState({
        message: userMsg,
        code: err.status || "SERVER_ERROR",
      });
    } finally {
      if (!signal.aborted) setIsProcessing(false);
    }
  };

  return (
    <div
      className="v2w-panel"
      role="tabpanel"
      id="panel-video-to-word"
      aria-labelledby="tab-video-to-word"
    >
      {/* Left column: Upload & settings */}
      <div className="v2w-panel__left">
        {/* Upload Zone */}
        {!selectedFile ? (
          <div
            className={`v2w-panel__dropzone ${isDragging ? "v2w-panel__dropzone--active" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            aria-label="Tải lên video ký hiệu VSL"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_EXTENSIONS.join(",")}
              className="v2w-panel__file-input"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
              }}
            />
            <div className="v2w-panel__dropzone-content">
              <div className="v2w-panel__dropzone-icon">
                <UploadCloud size={32} />
              </div>
              <p className="v2w-panel__dropzone-title">
                Kéo thả video vào đây hoặc <span className="v2w-panel__browse-link">chọn file</span>
              </p>
              <p className="v2w-panel__dropzone-formats">
                Hỗ trợ MP4, MOV, AVI, MKV, WebM (tối đa {MAX_FILE_SIZE_MB} MB)
              </p>
            </div>
          </div>
        ) : (
          /* File Preview Card */
          <div className="v2w-panel__file-card">
            <div className="v2w-panel__preview-box">
              {previewUrl && (
                <video
                  src={previewUrl}
                  controls
                  playsInline
                  muted
                  className="v2w-panel__preview-video"
                />
              )}
            </div>

            <div className="v2w-panel__file-info">
              <div className="v2w-panel__file-meta">
                <FileVideo size={20} className="text-teal-600 shrink-0" />
                <div className="v2w-panel__file-names">
                  <span className="v2w-panel__file-name">{selectedFile.name}</span>
                  <span className="v2w-panel__file-size">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>

              <div className="v2w-panel__file-actions">
                <button
                  type="button"
                  className="v2w-panel__action-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  Thay đổi file
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_EXTENSIONS.join(",")}
                  className="v2w-panel__file-input"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                  }}
                />
                <button
                  type="button"
                  className="v2w-panel__remove-btn"
                  onClick={handleRemoveFile}
                  disabled={isProcessing}
                  aria-label="Xóa video đã chọn"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Recognition Threshold setting */}
            <div className="v2w-panel__settings-box">
              <div className="v2w-panel__setting-row">
                <label htmlFor="conf-slider" className="v2w-panel__setting-label">
                  <Sliders size={14} />
                  Ngưỡng độ tin cậy tối thiểu:
                </label>
                <span className="v2w-panel__setting-value">{Math.round(minConfidence * 100)}%</span>
              </div>
              <input
                id="conf-slider"
                type="range"
                min="0.10"
                max="0.80"
                step="0.05"
                value={minConfidence}
                onChange={(e) => setMinConfidence(Number(e.target.value))}
                className="v2w-panel__slider"
              />
            </div>

            {/* Submit Action */}
            <button
              type="button"
              className="v2w-panel__recognize-btn"
              onClick={handleRecognize}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Đang phân tích khung hình với VideoMAE...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Bắt đầu nhận diện cử chỉ
                </>
              )}
            </button>
          </div>
        )}

        {/* Guidance card */}
        <div className="v2w-panel__guidance-card">
          <h4 className="v2w-panel__guidance-title">
            <HelpCircle size={16} className="text-teal-600" />
            Hướng dẫn quay video cử chỉ VSL:
          </h4>
          <ul className="v2w-panel__guidance-list">
            <li>Quay rõ phần thân trên, toàn bộ khuôn mặt và hai bàn tay.</li>
            <li>Độ dài clip lý tưởng từ 2 đến 5 giây cho một cử chỉ hoàn chỉnh.</li>
            <li>Ánh sáng đầy đủ, tránh đứng ngược sáng hoặc hậu cảnh quá rối.</li>
            <li>Giữ camera cố định ngang tầm ngực khi thực hiện động tác.</li>
          </ul>
        </div>
      </div>

      {/* Right column: Results & Vocabulary info */}
      <div className="v2w-panel__right">
        <h3 className="v2w-panel__section-title">Kết quả nhận diện</h3>

        {/* Loading state */}
        {isProcessing && (
          <div className="v2w-panel__processing-card" role="status">
            <Loader2 size={40} className="v2w-panel__spinner animate-spin" />
            <h4 className="v2w-panel__processing-title">Đang phân tích video cử chỉ</h4>
            <p className="v2w-panel__processing-desc">
              Mô hình VideoMAE đang trích xuất 16 khung hình đại diện và đối chiếu với 100 nhãn cử
              chỉ VSL...
            </p>
          </div>
        )}

        {/* Error state */}
        {errorState && !isProcessing && (
          <div className="v2w-panel__error-card" role="alert">
            <AlertCircle size={28} className="v2w-panel__error-icon" />
            <div className="v2w-panel__error-content">
              <h4 className="v2w-panel__error-title">Nhận diện chưa thành công</h4>
              <p className="v2w-panel__error-desc">{errorState.message}</p>
            </div>
            <button type="button" className="v2w-panel__retry-btn" onClick={handleRecognize}>
              <RotateCcw size={14} /> Thử lại
            </button>
          </div>
        )}

        {/* Success result card */}
        {result && !isProcessing && (
          <div className="v2w-panel__result-card" role="region" aria-label="Kết quả nhận diện VSL">
            <div className="v2w-panel__result-badge">
              <CheckCircle2 size={16} /> Nhận diện thành công
            </div>

            <div className="v2w-panel__predicted-box">
              <span className="v2w-panel__predicted-label">Từ vựng dự đoán:</span>
              <span className="v2w-panel__predicted-word">{result.predictedLabel}</span>
              {result.confidence !== null && (
                <div className="v2w-panel__confidence-meter">
                  <span className="v2w-panel__confidence-text">
                    Độ tin cậy: <strong>{(result.confidence * 100).toFixed(1)}%</strong>
                  </span>
                  <div className="v2w-panel__confidence-bar">
                    <div
                      className="v2w-panel__confidence-fill"
                      style={{ width: `${Math.min(100, Math.round(result.confidence * 100))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Top alternative predictions */}
            {result.topPredictions && result.topPredictions.length > 1 && (
              <div className="v2w-panel__alternatives">
                <span className="v2w-panel__alternatives-title">Các dự đoán tiếp theo:</span>
                <div className="v2w-panel__alternatives-list">
                  {result.topPredictions.slice(1, 4).map((alt, idx) => (
                    <div key={idx} className="v2w-panel__alt-item">
                      <span className="v2w-panel__alt-label">{alt.label}</span>
                      <span className="v2w-panel__alt-conf">
                        {Math.round(alt.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="v2w-panel__result-footer">
              <span className="v2w-panel__model-tag">
                Mô hình: {result.modelName || "VideoMAE VSL"}
              </span>
            </div>
          </div>
        )}

        {/* Idle empty state */}
        {!selectedFile && !isProcessing && !result && !errorState && (
          <div className="v2w-panel__empty-card">
            <p>Chọn hoặc kéo thả một video cử chỉ VSL để bắt đầu nhận diện.</p>
          </div>
        )}

        {/* Collapsible 100 recognizable vocabulary list */}
        <div className="v2w-panel__vocab-drawer">
          <button
            type="button"
            className="v2w-panel__vocab-drawer-header"
            onClick={() => setShowVocabList(!showVocabList)}
            aria-expanded={showVocabList}
          >
            <span className="v2w-panel__vocab-drawer-title">
              Cử chỉ mô hình AI hiện nhận diện được
              {recLabels.length > 0 ? ` (${recLabels.length})` : ""}
            </span>
            {showVocabList ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showVocabList && (
            <div className="v2w-panel__vocab-drawer-content">
              {vocabLoading ? (
                <p role="status">Đang tải danh sách cử chỉ...</p>
              ) : vocabError ? (
                <div role="alert">
                  <p>{vocabError}</p>
                  <button
                    type="button"
                    className="v2w-panel__retry-btn"
                    onClick={() => {
                      setVocabError("");
                      setVocabLoading(true);
                      setVocabAttempt((attempt) => attempt + 1);
                    }}
                  >
                    Thử tải lại danh sách
                  </button>
                </div>
              ) : (
                <p className="v2w-panel__vocab-notice">
                  Mô hình hiện nhận diện {recLabels.length} cử chỉ sau:
                </p>
              )}
              <div className="v2w-panel__labels-grid">
                {recLabels.map((label, idx) => (
                  <span key={idx} className="v2w-panel__label-tag">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
