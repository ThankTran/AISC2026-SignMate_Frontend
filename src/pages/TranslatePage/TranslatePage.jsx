import { useState, useEffect } from "react";
import TranslationModeTabs from "./components/TranslationModeTabs";
import WordToSignPanel from "./components/WordToSignPanel";
import VideoToWordPanel from "./components/VideoToWordPanel";
import SentenceToSignPanel from "./components/SentenceToSignPanel";
import vslApi from "../../services/vslApi";
import { Languages } from "lucide-react";
import "./TranslatePage.css";

export default function TranslatePage() {
  const [activeMode, setActiveMode] = useState("word-to-sign");
  const [draftWord, setDraftWord] = useState("");
  const [draftVideo, setDraftVideo] = useState(null);
  const [draftSentence, setDraftSentence] = useState("");
  const [vocabSummary, setVocabSummary] = useState(null);

  // Load summary once on mount to show capability badge
  useEffect(() => {
    let isMounted = true;
    vslApi
      .getVocabularySummary()
      .then((data) => {
        if (isMounted) setVocabSummary(data);
      })
      .catch((err) => {
        console.warn("Could not reach VSL backend vocabulary summary:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="trans-page">
      {/* Header */}
      <header className="trans-page__header">
        <div className="trans-page__title-group">
          <div className="trans-page__tag">
            <Languages size={14} />
            <span>Ngôn ngữ Ký hiệu Việt Nam (VSL)</span>
          </div>
          <h1 className="trans-page__title">Dịch thuật Ký hiệu</h1>
          <p className="trans-page__subtitle">
            Chuyển đổi hai chiều giữa tiếng Việt và Ngôn ngữ ký hiệu Việt Nam (VSL), hỗ trợ tra cứu
            từ đơn, nhận diện cử chỉ từ video bằng AI, và chuỗi ký hiệu theo câu.
          </p>
        </div>

        {vocabSummary && (
          <div className="trans-page__stats-badge" aria-label="Khả năng từ điển VSL">
            <span className="trans-page__stats-item">
              <strong>{vocabSummary.dictionary_count?.toLocaleString("vi-VN") || 3314}</strong> từ
              vựng VSL
            </span>
            <span className="trans-page__stats-divider">•</span>
            <span className="trans-page__stats-item">
              <strong>{vocabSummary.recognition_count || 100}</strong> cử chỉ nhận diện AI
            </span>
          </div>
        )}
      </header>

      {/* Mode Navigation Tabs */}
      <div className="trans-page__tabs-wrapper">
        <TranslationModeTabs activeMode={activeMode} onSelectMode={setActiveMode} />
      </div>

      {/* Panel Content (preserves drafts across mode switches) */}
      <main className="trans-page__content">
        {activeMode === "word-to-sign" && (
          <WordToSignPanel draftWord={draftWord} onDraftChange={setDraftWord} />
        )}

        {activeMode === "video-to-word" && (
          <VideoToWordPanel draftVideo={draftVideo} onDraftChange={setDraftVideo} />
        )}

        {activeMode === "sentence-to-sequence" && (
          <SentenceToSignPanel draftSentence={draftSentence} onDraftChange={setDraftSentence} />
        )}
      </main>
    </div>
  );
}
