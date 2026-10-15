import { useRef } from "react";
import { MODES } from "../constants";
import "./TranslationModeTabs.css";

export default function TranslationModeTabs({ activeMode, onSelectMode }) {
  const tabListRef = useRef(null);

  const handleKeyDown = (e, index) => {
    let targetIndex = -1;
    if (e.key === "ArrowRight") {
      targetIndex = (index + 1) % MODES.length;
    } else if (e.key === "ArrowLeft") {
      targetIndex = (index - 1 + MODES.length) % MODES.length;
    } else if (e.key === "Home") {
      targetIndex = 0;
    } else if (e.key === "End") {
      targetIndex = MODES.length - 1;
    }

    if (targetIndex !== -1) {
      e.preventDefault();
      onSelectMode(MODES[targetIndex].id);
      const buttons = tabListRef.current?.querySelectorAll('[role="tab"]');
      buttons?.[targetIndex]?.focus();
    }
  };

  return (
    <div
      className="trans-tabs"
      role="tablist"
      aria-label="Chế độ dịch thuật ngôn ngữ ký hiệu"
      ref={tabListRef}
    >
      {MODES.map((mode, index) => {
        const Icon = mode.icon;
        const isActive = activeMode === mode.id;
        return (
          <button
            key={mode.id}
            role="tab"
            id={`tab-${mode.id}`}
            aria-controls={`panel-${mode.id}`}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={`trans-tab ${isActive ? "trans-tab--active" : ""}`}
            onClick={() => onSelectMode(mode.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            <span className="trans-tab__icon-wrapper">
              <Icon size={18} />
            </span>
            <div className="trans-tab__text">
              <span className="trans-tab__title">{mode.title}</span>
              <span className="trans-tab__desc">{mode.description}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
