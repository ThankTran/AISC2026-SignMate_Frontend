import { replaceSentenceToken } from "../sentenceTokens";
import { createRequestLifecycle } from "../requestLifecycle";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  X,
  Loader2,
  Plus,
} from "lucide-react";
import vslApi from "../../../services/vslApi";
import SignSequencePlayer from "./SignSequencePlayer";
import SupportedVocabularyPicker from "./SupportedVocabularyPicker";
import { VERIFIED_SENTENCES } from "../constants";
import "./SentenceToSignPanel.css";

export default function SentenceToSignPanel({ draftSentence = "", onDraftChange }) {
  const [inputText, setInputText] = useState(draftSentence);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [segmentedData, setSegmentedData] = useState(null); // { original_text, normalized_text, tokens, supported_count, unsupported_count, all_supported }
  const [errorState, setErrorState] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(null);

  const textareaRef = useRef(null);
  const requestRef = useRef(null);
  if (requestRef.current === null) requestRef.current = createRequestLifecycle();
  useEffect(() => {
    const requests = requestRef.current;
    return () => requests.cancel();
  }, []);

  useEffect(() => {
    onDraftChange?.(inputText);
  }, [inputText, onDraftChange]);

  const handleAnalyze = async (textToAnalyze) => {
    const text = (textToAnalyze !== undefined ? textToAnalyze : inputText).trim().normalize("NFC");
    if (!text) return;

    const signal = requestRef.current.start();

    setIsAnalyzing(true);
    setErrorState(null);
    setSelectedTokenIndex(null);

    try {
      const data = await vslApi.segmentSentence(text, { signal });
      if (signal.aborted) return;
      setSegmentedData({ ...data, sourceText: text });
    } catch (err) {
      if (signal.aborted || err.name === "AbortError") return;

      console.error("Sentence segmentation error:", err);
      setErrorState(err.message || "Không thể phân tích cấu trúc câu tiếng Việt.");
      setSegmentedData(null);
    } finally {
      if (!signal.aborted) setIsAnalyzing(false);
    }
  };

  const handleSelectExample = (sentence) => {
    setInputText(sentence);
    handleAnalyze(sentence);
  };

  const handleClear = () => {
    requestRef.current.cancel();
    setIsAnalyzing(false);
    setInputText("");
    setSegmentedData(null);
    setErrorState(null);
    setSelectedTokenIndex(null);
  };

  const handleInsertAtCursor = (word) => {
    if (!textareaRef.current) {
      setInputText((prev) => (prev ? `${prev} ${word}` : word));
      return;
    }
    const area = textareaRef.current;
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const current = inputText;
    const before = current.substring(0, start);
    const after = current.substring(end);
    const separatorBefore = before && !before.endsWith(" ") ? " " : "";
    const separatorAfter = after && !after.startsWith(" ") ? " " : "";
    const updated = `${before}${separatorBefore}${word}${separatorAfter}${after}`;
    setInputText(updated);
    setTimeout(() => {
      area.focus();
      const newPos = start + separatorBefore.length + word.length + separatorAfter.length;
      area.setSelectionRange(newPos, newPos);
    }, 10);
  };

  const handleReplaceTokenInText = (tokenIndex, replacementWord) => {
    if (inputText.trim().normalize("NFC") !== segmentedData.sourceText) {
      setErrorState("Câu đã thay đổi. Hãy phân tích lại trước khi thay từ.");
      return;
    }
    const updated = replaceSentenceToken(
      inputText,
      segmentedData.tokens,
      tokenIndex,
      replacementWord,
    );
    setInputText(updated);
    handleAnalyze(updated);
  };

  // Build playlist of supported clips
  const playlist = useMemo(
    () =>
      (segmentedData?.tokens || [])
        .filter((tok) => tok.supported && tok.video_url)
        .map((tok, idx) => ({
          id: `${tok.label || tok.text}-${idx}`,
          text: tok.text,
          label: tok.label || tok.text,
          filename: tok.filename,
          video_url: tok.video_url,
        })),
    [segmentedData],
  );

  return (
    <div
      className="s2s-panel"
      role="tabpanel"
      id="panel-sentence-to-sequence"
      aria-labelledby="tab-sentence-to-sequence"
    >
      {/* Left Column: Sentence Input & Token Chips */}
      <div className="s2s-panel__left">
        <div className="s2s-panel__field">
          <div className="s2s-panel__label-row">
            <label htmlFor="sentence-input" className="s2s-panel__label">
              Nhập câu tiếng Việt cần chuyển thành ký hiệu VSL
            </label>
            <span className="s2s-panel__char-count">{inputText.length} ký tự</span>
          </div>

          <div className="s2s-panel__textarea-box">
            <textarea
              id="sentence-input"
              ref={textareaRef}
              rows={3}
              className="s2s-panel__textarea"
              placeholder="Nhập câu tiếng Việt (ví dụ: xin lỗi ban ngày, địa chỉ tỉnh, nhân viên tiếp tân...)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            {inputText && (
              <button
                type="button"
                className="s2s-panel__textarea-clear"
                onClick={handleClear}
                aria-label="Xóa câu đã nhập"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Action bar under textarea */}
          <div className="s2s-panel__input-actions">
            <button
              type="button"
              className="s2s-panel__insert-btn"
              onClick={() => setIsPickerOpen(true)}
            >
              <Plus size={15} />
              Chèn từ vựng có sẵn
            </button>

            <button
              type="button"
              className="s2s-panel__submit-btn"
              onClick={() => handleAnalyze()}
              disabled={isAnalyzing || !inputText.trim()}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang phân tích câu...
                </>
              ) : (
                <>
                  Phân tích câu & Tạo chuỗi
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Verified example sentences */}
        <div className="s2s-panel__examples">
          <span className="s2s-panel__examples-title">
            <Sparkles size={14} className="text-teal-600" />
            Các câu mẫu chuẩn có sẵn video:
          </span>
          <div className="s2s-panel__example-chips">
            {VERIFIED_SENTENCES.map((sent) => (
              <button
                key={sent}
                type="button"
                className={`s2s-panel__example-chip ${
                  inputText.toLowerCase() === sent.toLowerCase()
                    ? "s2s-panel__example-chip--active"
                    : ""
                }`}
                onClick={() => handleSelectExample(sent)}
              >
                &ldquo;{sent}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Error alert */}
        {errorState && (
          <div className="s2s-panel__alert s2s-panel__alert--error" role="alert">
            <AlertTriangle size={18} className="shrink-0" />
            <p>{errorState}</p>
          </div>
        )}

        {/* Interpretation / Tokenization Chips Display */}
        {segmentedData && (
          <div className="s2s-panel__interpretation-card">
            <div className="s2s-panel__interp-header">
              <span className="s2s-panel__interp-title">
                Phân tích các thành phần ký hiệu trong câu:
              </span>
              <span className="s2s-panel__interp-stats">
                {segmentedData.supported_count} từ khớp • {segmentedData.unsupported_count} từ chưa
                có
              </span>
            </div>

            {/* Token Chips */}
            <div
              className="s2s-panel__chips-container"
              role="list"
              aria-label="Các từ được phân tích"
            >
              {segmentedData.tokens.map((tok, idx) => (
                <div key={idx} className="s2s-panel__token-wrapper">
                  <button
                    type="button"
                    className={`s2s-panel__token-chip ${
                      tok.supported
                        ? "s2s-panel__token-chip--supported"
                        : "s2s-panel__token-chip--unsupported"
                    } ${selectedTokenIndex === idx ? "s2s-panel__token-chip--selected" : ""}`}
                    onClick={() => setSelectedTokenIndex(selectedTokenIndex === idx ? null : idx)}
                    aria-expanded={selectedTokenIndex === idx}
                  >
                    {tok.supported ? (
                      <CheckCircle2 size={13} className="s2s-panel__token-icon text-teal-600" />
                    ) : (
                      <AlertTriangle size={13} className="s2s-panel__token-icon text-amber-600" />
                    )}
                    <span className="s2s-panel__token-text">{tok.label || tok.text}</span>
                  </button>

                  {/* Suggestions Popover for unsupported token */}
                  {!tok.supported && selectedTokenIndex === idx && (
                    <div className="s2s-panel__suggestions-popover" role="region">
                      <span className="s2s-panel__popover-title">
                        Từ &ldquo;{tok.text}&rdquo; chưa có trong từ điển. Chọn từ thay thế:
                      </span>
                      {tok.suggestions && tok.suggestions.length > 0 ? (
                        <div className="s2s-panel__popover-options">
                          {tok.suggestions.map((sug) => (
                            <button
                              key={sug}
                              type="button"
                              className="s2s-panel__popover-opt-btn"
                              onClick={() => {
                                handleReplaceTokenInText(idx, sug);
                                setSelectedTokenIndex(null);
                              }}
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="s2s-panel__popover-empty">Không tìm thấy gợi ý gần đúng.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Notice if unsupported tokens remain */}
            {!segmentedData.all_supported && (
              <div className="s2s-panel__notice-banner">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Câu có{" "}
                  <strong>{segmentedData.unsupported_count} từ chưa có trong thư viện</strong>.
                  Trình phát sẽ phát tuần tự các từ có sẵn theo đúng thứ tự. Bạn có thể nhấn vào từ
                  màu cam để chọn từ thay thế.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Note on VSL sentence sequencing vs grammar */}
        <div className="s2s-panel__info-box">
          <HelpCircle size={16} className="text-teal-600 shrink-0 mt-0.5" />
          <p>
            Chế độ này hiển thị chuỗi video ký hiệu liên tiếp theo thứ tự từ vựng hỗ trợ của câu.
            Đây là chuỗi ký hiệu đối chiếu từ vựng, không thay thế hoàn toàn ngữ pháp không gian và
            biểu cảm cử chỉ tự nhiên của VSL.
          </p>
        </div>
      </div>

      {/* Right Column: Ordered Sequence Player */}
      <div className="s2s-panel__right">
        <h3 className="s2s-panel__section-title">Trình phát chuỗi ký hiệu theo câu</h3>

        {playlist.length > 0 ? (
          <SignSequencePlayer playlist={playlist} />
        ) : (
          <SignSequencePlayer playlist={[]} />
        )}
      </div>

      {/* Vocabulary Picker Modal */}
      <SupportedVocabularyPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectWord={handleInsertAtCursor}
        mode="dictionary"
        title="Chọn từ vựng để chèn vào câu"
      />
    </div>
  );
}
