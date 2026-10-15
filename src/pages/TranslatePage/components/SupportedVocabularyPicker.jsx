import { useEffect, useState, useMemo, useRef } from "react";
import { Search, X, BookOpen, Sparkles, Check, Loader2 } from "lucide-react";
import vslApi from "../../../services/vslApi";
import "./SupportedVocabularyPicker.css";

export default function SupportedVocabularyPicker({
  isOpen,
  onClose,
  onSelectWord,
  mode = "dictionary", // "dictionary" (3,314 words) or "recognition" (100 labels)
  title = "Từ điển từ vựng ký hiệu VSL",
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState(mode);
  const [searchState, setSearchState] = useState({ query: "", items: [], error: "" });
  const query = searchQuery.trim();
  const isLoading =
    isOpen && activeTab === "dictionary" && Boolean(query) && searchState.query !== query;
  const modalRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement;
    modalRef.current?.querySelector("input")?.focus();
    return () => previousFocus?.focus();
  }, [isOpen]);

  const handleModalKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
    if (event.key !== "Tab") return;
    const controls = modalRef.current?.querySelectorAll(
      'button:not(:disabled), input:not(:disabled), [tabindex="0"]',
    );
    if (!controls?.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  // Load summary on open
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    vslApi
      .getVocabularySummary()
      .then((data) => {
        if (isMounted) setSummary(data);
      })
      .catch((err) => console.error("Could not fetch vocabulary summary", err));

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Live search debounced for dictionary tab
  useEffect(() => {
    if (!isOpen || activeTab !== "dictionary") return;
    const query = searchQuery.trim();
    if (!query) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      vslApi
        .searchVocabulary(query, { limit: 40, signal: controller.signal })
        .then((items) => {
          if (!controller.signal.aborted) setSearchState({ query, items, error: "" });
        })
        .catch((err) => {
          if (!controller.signal.aborted && err.name !== "AbortError") {
            setSearchState({ query, items: [], error: "Không thể tải từ vựng. Hãy thử tìm lại." });
          }
        });
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, activeTab, isOpen]);

  // Derived displayed items based on tab and query
  const displayedItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (activeTab === "recognition") {
      const labels = summary?.recognition_labels || [];
      const filtered = query ? labels.filter((lbl) => lbl.toLowerCase().includes(query)) : labels;
      return filtered.map((label) => ({ label }));
    }

    if (query) {
      return searchState.query === searchQuery.trim() ? searchState.items : [];
    }

    return (
      summary?.sample_words || [
        "chào",
        "xin lỗi",
        "tạm biệt",
        "ban ngày",
        "ban đêm",
        "bàn tay",
        "địa chỉ",
        "tỉnh",
        "nhân viên",
        "tiếp tân",
        "không cần",
        "không nên",
        "chúng ta",
        "hôm nay",
        "giúp",
      ]
    ).map((label) => ({ label }));
  }, [searchQuery, searchState, activeTab, summary]);

  if (!isOpen) return null;

  return (
    <div
      className="vocab-picker-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vocab-picker-title"
      onClick={onClose}
      onKeyDown={handleModalKeyDown}
    >
      <div ref={modalRef} className="vocab-picker-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="vocab-picker-header">
          <div className="vocab-picker-header-info">
            <h2 id="vocab-picker-title" className="vocab-picker-title">
              {title}
            </h2>
            <p className="vocab-picker-subtitle">
              {summary
                ? `${summary.dictionary_count.toLocaleString("vi-VN")} từ vựng có video • ${summary.recognition_count} cử chỉ nhận diện AI`
                : "Tra cứu từ vựng có sẵn trong SignMate VSL"}
            </p>
          </div>
          <button
            type="button"
            className="vocab-picker-close-btn"
            onClick={onClose}
            aria-label="Đóng bảng tra cứu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="vocab-picker-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "dictionary"}
            className={`vocab-picker-tab ${activeTab === "dictionary" ? "vocab-picker-tab--active" : ""}`}
            onClick={() => setActiveTab("dictionary")}
          >
            <BookOpen size={16} />
            Toàn bộ từ điển ({summary?.dictionary_count || 3314})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "recognition"}
            className={`vocab-picker-tab ${activeTab === "recognition" ? "vocab-picker-tab--active" : ""}`}
            onClick={() => setActiveTab("recognition")}
          >
            <Sparkles size={16} />
            Mẫu AI nhận diện ({summary?.recognition_count || 100})
          </button>
        </div>

        {/* Search bar */}
        <div className="vocab-picker-search-bar">
          <Search size={18} className="vocab-picker-search-icon" />
          <input
            type="text"
            aria-label="Tìm kiếm từ vựng"
            className="vocab-picker-search-input"
            placeholder={
              activeTab === "recognition"
                ? "Lọc 100 cử chỉ mô hình nhận diện (vd: Chào, Xin lỗi, Ăn...)"
                : "Tìm kiếm từ hoặc cụm từ (vd: địa chỉ, ban ngày, xin lỗi...)"
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              className="vocab-picker-search-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Xóa tìm kiếm"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* List of items */}
        <div className="vocab-picker-body">
          {isLoading ? (
            <div className="vocab-picker-loading" role="status">
              <Loader2 size={24} className="animate-spin text-teal-600" />
              <span>Đang tìm từ vựng...</span>
            </div>
          ) : activeTab === "dictionary" &&
            query &&
            searchState.query === query &&
            searchState.error ? (
            <p role="alert">{searchState.error}</p>
          ) : displayedItems.length === 0 ? (
            <div className="vocab-picker-empty">
              <p>Không tìm thấy từ vựng khớp với &ldquo;{searchQuery}&rdquo;.</p>
              <span className="vocab-picker-empty-hint">
                Hãy thử tìm cụm từ khác hoặc kiểm tra lại dấu tiếng Việt.
              </span>
            </div>
          ) : (
            <div className="vocab-picker-grid">
              {displayedItems.map((item, idx) => (
                <button
                  key={`${item.label}-${idx}`}
                  type="button"
                  className="vocab-picker-item"
                  onClick={() => {
                    onSelectWord(item.label);
                    onClose();
                  }}
                >
                  <span className="vocab-picker-item-label">{item.label}</span>
                  <Check size={14} className="vocab-picker-item-check" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="vocab-picker-footer">
          <span>Nhấn vào từ bất kỳ để chọn vào ô nhập</span>
          <button type="button" className="vocab-picker-done-btn" onClick={onClose}>
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
}
