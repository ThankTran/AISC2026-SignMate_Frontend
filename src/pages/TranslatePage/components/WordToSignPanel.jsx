import { createRequestLifecycle } from "../requestLifecycle";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  Sparkles,
  BookOpen,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import vslApi from "../../../services/vslApi";
import SignVideoPlayer from "./SignVideoPlayer";
import SupportedVocabularyPicker from "./SupportedVocabularyPicker";
import { QUICK_EXAMPLES } from "../constants";
import "./WordToSignPanel.css";

export default function WordToSignPanel({ draftWord = "", onDraftChange }) {
  const [inputWord, setInputWord] = useState(draftWord);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorState, setErrorState] = useState(null); // { type: 'unsupported' | 'network' | 'missing', message, suggestions: [] }
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [suggestionState, setSuggestionState] = useState({ query: "", items: [] });
  const suggestions =
    inputWord.trim().length >= 2 && suggestionState.query === inputWord.trim()
      ? suggestionState.items
      : [];
  const setSuggestions = (items, query = "") => setSuggestionState({ query, items });

  const requestRef = useRef(null);
  if (requestRef.current === null) requestRef.current = createRequestLifecycle();
  useEffect(() => {
    const requests = requestRef.current;
    return () => requests.cancel();
  }, []);

  useEffect(() => {
    onDraftChange?.(inputWord);
  }, [inputWord, onDraftChange]);

  // Live autocomplete dropdown for input
  useEffect(() => {
    const query = inputWord.trim();
    if (!query || query.length < 2) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      vslApi
        .searchVocabulary(query, { limit: 5, signal: controller.signal })
        .then((items) => {
          if (!controller.signal.aborted) setSuggestionState({ query, items });
        })
        .catch(() => {});
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [inputWord]);

  const handleTranslate = async (wordToTranslate) => {
    const term = (wordToTranslate !== undefined ? wordToTranslate : inputWord)
      .trim()
      .normalize("NFC");
    if (!term) return;

    const signal = requestRef.current.start();

    setIsLoading(true);
    setErrorState(null);
    setSuggestions([]);

    try {
      // 1. Direct word lookup or text-to-vsl-video with exact: true
      const data = await vslApi.translateWordToVideo(term, { exact: true, signal });
      if (signal.aborted) return;
      setResult({
        matchedLabel: data.labels?.[0] || term,
        filename: data.clips?.[0]?.filename || "",
        videoUrl: data.video_url || data.clips?.[0]?.video_url,
      });
    } catch (err) {
      if (signal.aborted || err.name === "AbortError") return;

      console.error("Word translation error:", err);
      // Fetch suggestions if word not found
      if (err.status === 404 || err.status === 422) {
        let candidates = [];
        try {
          const lookup = await vslApi.lookupWord(term, { signal });
          candidates = lookup.suggestions || [];
        } catch {
          // Ignore suggestion error
        }

        if (signal.aborted) return;
        setErrorState({
          type: "unsupported",
          message: `Từ “${term}” hiện chưa có video ký hiệu trong thư viện VSL.`,
          suggestions: candidates,
        });
      } else if (err.status === 503) {
        setErrorState({
          type: "missing",
          message: "Dịch vụ thư viện video hoặc dữ liệu VSL tạm thời chưa sẵn sàng.",
          suggestions: [],
        });
      } else {
        setErrorState({
          type: "network",
          message: err.message || "Không thể kết nối đến máy chủ dịch thuật VSL.",
          suggestions: [],
        });
      }
      setResult(null);
    } finally {
      if (!signal.aborted) setIsLoading(false);
    }
  };

  const handleSelectExample = (example) => {
    setInputWord(example);
    handleTranslate(example);
  };

  const handleClear = () => {
    requestRef.current.cancel();
    setIsLoading(false);
    setInputWord("");
    setResult(null);
    setErrorState(null);
    setSuggestions([]);
  };

  return (
    <div
      className="w2s-panel"
      role="tabpanel"
      id="panel-word-to-sign"
      aria-labelledby="tab-word-to-sign"
    >
      {/* Left / Input column */}
      <div className="w2s-panel__form-section">
        <div className="w2s-panel__field">
          <label htmlFor="word-input" className="w2s-panel__label">
            Nhập từ vựng cần tra cứu
            <span className="w2s-panel__label-hint">(Tiếng Việt có dấu, một từ hoặc cụm từ)</span>
          </label>

          <div className="w2s-panel__input-box">
            <Search className="w2s-panel__input-icon" size={18} />
            <input
              id="word-input"
              type="text"
              className="w2s-panel__input"
              placeholder="Ví dụ: chào, xin lỗi, bàn tay..."
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleTranslate();
                }
              }}
              autoComplete="off"
            />
            {inputWord && (
              <button
                type="button"
                className="w2s-panel__clear-btn"
                onClick={handleClear}
                aria-label="Xóa nội dung"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="button"
              className="w2s-panel__submit-btn"
              onClick={() => handleTranslate()}
              disabled={isLoading || !inputWord.trim()}
              aria-label="Dịch sang ký hiệu"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Dịch ký hiệu
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          {/* Autocomplete suggestions dropdown */}
          {suggestions.length > 0 && (
            <div className="w2s-panel__suggestions" role="listbox">
              <span className="w2s-panel__suggestions-title">Gợi ý từ vựng trong từ điển:</span>
              {suggestions.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="w2s-panel__suggestion-item"
                  onClick={() => handleSelectExample(item.label)}
                >
                  <span>{item.label}</span>
                  <span className="w2s-panel__suggestion-fn">{item.filename}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick examples */}
        <div className="w2s-panel__examples">
          <span className="w2s-panel__examples-title">
            <Sparkles size={14} className="text-teal-600" />
            Từ mẫu có video:
          </span>
          <div className="w2s-panel__example-chips">
            {QUICK_EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                className={`w2s-panel__example-chip ${inputWord.toLowerCase() === ex.toLowerCase() ? "w2s-panel__example-chip--active" : ""}`}
                onClick={() => handleSelectExample(ex)}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Browser modal trigger */}
        <div className="w2s-panel__picker-trigger-box">
          <button
            type="button"
            className="w2s-panel__picker-btn"
            onClick={() => setIsPickerOpen(true)}
          >
            <BookOpen size={16} />
            Duyệt toàn bộ 3.314 từ vựng ký hiệu
          </button>
          <span className="w2s-panel__picker-hint">
            Xem danh sách ký hiệu có sẵn theo thứ tự bảng chữ cái hoặc tìm kiếm
          </span>
        </div>

        {/* Unsupported / Error message */}
        {errorState && (
          <div className={`w2s-panel__alert w2s-panel__alert--${errorState.type}`} role="alert">
            <div className="w2s-panel__alert-header">
              <AlertCircle size={18} className="w2s-panel__alert-icon" />
              <p className="w2s-panel__alert-text">{errorState.message}</p>
            </div>

            {errorState.suggestions && errorState.suggestions.length > 0 && (
              <div className="w2s-panel__alert-suggestions">
                <span>Gợi ý các từ gần giống có sẵn:</span>
                <div className="w2s-panel__alert-chips">
                  {errorState.suggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      className="w2s-panel__alert-chip"
                      onClick={() => handleSelectExample(sug)}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right / Video result column */}
      <div className="w2s-panel__result-section">
        <div className="w2s-panel__result-header">
          <h3 className="w2s-panel__result-title">Video ký hiệu chuẩn (VSL)</h3>
          {result && (
            <span className="w2s-panel__match-badge">
              <CheckCircle2 size={14} /> Khớp chính xác
            </span>
          )}
        </div>

        <div className="w2s-panel__player-wrapper">
          {result ? (
            <SignVideoPlayer
              videoUrl={result.videoUrl}
              label={result.matchedLabel}
              filename={result.filename}
              autoPlay={true}
            />
          ) : (
            <SignVideoPlayer videoUrl="" />
          )}
        </div>

        <div className="w2s-panel__note-card">
          <HelpCircle size={15} className="w2s-panel__note-icon" />
          <p>
            Video được quay trực tiếp bởi người khiếm thính Việt Nam theo tiêu chuẩn cử chỉ VSL.
            Toàn bộ khuôn mặt và cử động hai tay đều được giữ nguyên trọn vẹn trong khung hình.
          </p>
        </div>
      </div>

      {/* Modal picker */}
      <SupportedVocabularyPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectWord={handleSelectExample}
        mode="dictionary"
        title="Từ điển ký hiệu VSL (3.314 từ vựng)"
      />
    </div>
  );
}
