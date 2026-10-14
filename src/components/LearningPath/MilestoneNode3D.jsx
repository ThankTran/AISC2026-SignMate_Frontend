import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Trophy, Lock, Check, Sparkles, X, ArrowRight, RotateCcw, AlertCircle, Award } from "lucide-react";

const MilestoneNode3D = ({ chapter, xPercent = 50, yPx }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const buttonRef = useRef(null);
  const actionButtonRef = useRef(null);
  const navigate = useNavigate();

  const quiz = chapter?.quiz || {};
  const isUnlocked = ["unlocked", "completed"].includes(quiz.status);
  const isCompleted = quiz.status === "completed";
  const isLocked = !isUnlocked;

  const score = quiz.score;

  // Keyboard navigation & accessibility for milestone popover and body scroll lock
  useEffect(() => {
    if (!isPopoverOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsPopoverOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    if (actionButtonRef.current && !actionButtonRef.current.disabled) {
      actionButtonRef.current.focus();
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPopoverOpen]);

  const handleStartQuiz = () => {
    if (isLocked) return;
    navigate(`/learning-path/quiz/${chapter.id}`);
  };

  return (
    <div
      className={`lp-milestone3d-container lp-milestone3d-container--${isCompleted ? "completed" : isUnlocked ? "unlocked" : "locked"}`}
      style={{
        left: `${xPercent}%`,
        top: `${yPx}px`,
      }}
    >
      {/* Ground Contact Shadow */}
      <div className="lp-milestone3d-shadow" aria-hidden="true" />

      {/* 3D Golden Milestone Podium Button */}
      <button
        ref={buttonRef}
        type="button"
        className={`lp-milestone3d-btn lp-milestone3d-btn--${isCompleted ? "completed" : isUnlocked ? "unlocked" : "locked"}`}
        onClick={() => setIsPopoverOpen(true)}
        aria-label={`Bài kiểm tra Chương ${chapter.id}: ${chapter.title} - ${isCompleted ? `Đã hoàn thành ${score} điểm` : isUnlocked ? "Sẵn sàng làm bài" : "Bị khóa"}`}
        aria-expanded={isPopoverOpen}
        aria-haspopup="dialog"
      >
        {/* Active Golden Pulsing Beacon if unlocked and not yet passed */}
        {isUnlocked && !isCompleted && (
          <span className="lp-milestone3d-beacon-ring" aria-hidden="true" />
        )}

        {/* 3D Extrusion Pedestal */}
        <div className="lp-milestone3d-pedestal">
          {/* Top Raised Disc Face */}
          <div className="lp-milestone3d-face">
            {/* Concentric Groove Ring */}
            <div className="lp-milestone3d-groove">
              <span className="lp-milestone3d-icon-wrap">
                {isLocked ? (
                  <Lock className="lp-milestone3d-glyph" size={30} strokeWidth={2.4} />
                ) : (
                  <Trophy className="lp-milestone3d-glyph" size={32} strokeWidth={2.2} />
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Jewel Badges */}
        {isCompleted && (
          <span
            className="lp-milestone3d-badge lp-milestone3d-badge--completed"
            title="Đã đạt bài kiểm tra"
            aria-hidden="true"
          >
            <Check size={14} strokeWidth={3} />
          </span>
        )}

        {isUnlocked && !isCompleted && (
          <span
            className="lp-milestone3d-badge lp-milestone3d-badge--ready"
            title="Thử thách mở"
            aria-hidden="true"
          >
            <Sparkles size={14} />
          </span>
        )}

        {isLocked && (
          <span
            className="lp-milestone3d-badge lp-milestone3d-badge--locked"
            title="Chưa mở khóa"
            aria-hidden="true"
          >
            <Lock size={12} strokeWidth={2.5} />
          </span>
        )}
      </button>

      {/* Upright Under-Node Label */}
      <div
        className="lp-milestone3d-label"
        onClick={() => setIsPopoverOpen(true)}
        style={{ cursor: "pointer" }}
        role="button"
        tabIndex={-1}
        aria-hidden="true"
      >
        <span className="lp-milestone3d-tag">CỘT MỐC CHƯƠNG {chapter.id}</span>
        <span className="lp-milestone3d-title">Bài kiểm tra tổng hợp</span>
        <span className="lp-milestone3d-meta">
          {isCompleted
            ? `Điểm: ${score}/100 · Đã vượt qua`
            : isUnlocked
              ? "Đạt từ 70% để mở chương sau"
              : "Hoàn thành các trạm để mở"}
        </span>
      </div>

      {/* Popover / Dialog for Milestone Details */}
      {isPopoverOpen &&
        createPortal(
          <div
            className="lp-popover-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsPopoverOpen(false);
                buttonRef.current?.focus();
              }
            }}
          >
          <div
            className="lp-popover-card lp-popover-card--milestone"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lp-milestone-title"
          >
            <div className="lp-popover-header">
              <div className="lp-popover-badges">
                <span className="lp-popover-kind-tag lp-popover-kind-tag--milestone">
                  <Trophy size={13} />
                  BÀI KIỂM TRA CHƯƠNG
                </span>
                <span className="lp-popover-step-num">CHƯƠNG {chapter.id}</span>
              </div>

              <button
                type="button"
                className="lp-popover-close-btn"
                onClick={() => {
                  setIsPopoverOpen(false);
                  buttonRef.current?.focus();
                }}
                aria-label="Đóng bảng thông tin"
              >
                <X size={16} />
              </button>
            </div>

            <div className="lp-popover-body">
              <span className="lp-popover-chapter-tag">{chapter.title}</span>
              <h3 id="lp-milestone-title" className="lp-popover-title">
                Bài kiểm tra đánh giá toàn diện Chương {chapter.id}
              </h3>
              <p className="lp-popover-desc">
                Đánh giá kỹ năng nhận diện và thực hiện các ký hiệu đã học trong toàn bộ chương
                này. Điểm số từ 70/100 trở lên là điều kiện để mở khóa chương tiếp theo.
              </p>
            </div>

            <div className="lp-popover-stats">
              <div className="lp-popover-stat-chip">
                <Award size={14} className="text-amber-500" />
                <span>+50 XP</span>
              </div>
              <div className="lp-popover-stat-chip">
                <span>Tiêu chuẩn: ≥ 70 điểm</span>
              </div>
              {isCompleted && score != null && (
                <div className="lp-popover-stat-chip text-emerald-700 font-bold">
                  <span>Kết quả: {score}/100</span>
                </div>
              )}
            </div>

            {isLocked && (
              <div className="lp-popover-alert" role="status">
                <AlertCircle size={15} className="lp-popover-alert-icon" />
                <p className="lp-popover-alert-text">
                  Bạn cần hoàn thành tất cả các trạm lý thuyết và thực hành của Chương {chapter.id} để mở bài kiểm tra này.
                </p>
              </div>
            )}

            <div className="lp-popover-footer">
              {isLocked ? (
                <button
                  type="button"
                  className="lp-popover-btn lp-popover-btn--disabled"
                  disabled
                  aria-disabled="true"
                >
                  <Lock size={16} />
                  <span>Chưa đủ điều kiện mở khóa</span>
                </button>
              ) : isCompleted ? (
                <button
                  ref={actionButtonRef}
                  type="button"
                  className="lp-popover-btn lp-popover-btn--milestone"
                  onClick={handleStartQuiz}
                >
                  <RotateCcw size={16} />
                  <span>Làm lại bài kiểm tra (Điểm: {score}/100)</span>
                </button>
              ) : (
                <button
                  ref={actionButtonRef}
                  type="button"
                  className="lp-popover-btn lp-popover-btn--milestone"
                  onClick={handleStartQuiz}
                >
                  <Sparkles size={16} />
                  <span>Bắt đầu bài kiểm tra ngay</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MilestoneNode3D;
