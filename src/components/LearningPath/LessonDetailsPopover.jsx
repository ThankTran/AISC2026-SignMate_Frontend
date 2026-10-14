import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  PencilLine,
  Check,
  Lock,
  Clock,
  Award,
  ArrowRight,
  RotateCcw,
  X,
  AlertCircle,
  Sparkles,
} from "lucide-react";

const LESSON_INFO = {
  1: {
    theory: "Làm quen với bảng chữ cái ngôn ngữ ký hiệu và các chữ số cơ bản từ 0 đến 9 trong VSL.",
    practice: "Luyện tập nhận diện và thực hiện các ký hiệu chữ cái, chữ số trước camera với AI chấm điểm.",
    time: "5 phút",
    xp: 20,
  },
  2: {
    theory: "Tìm hiểu các ký hiệu chào hỏi thông dụng: Xin chào, Tạm biệt, Cảm ơn, Xin lỗi và cách phối hợp biểu cảm.",
    practice: "Thực hành phản xạ cử chỉ chào hỏi tự nhiên kết hợp biểu cảm khuôn mặt chân thực.",
    time: "5 phút",
    xp: 20,
  },
  3: {
    theory: "Học các ký hiệu chỉ Ông, Bà, Bố, Mẹ, Anh, Chị, Em trong gia đình Việt Nam.",
    practice: "Luyện ghép câu đơn giản giới thiệu người thân trong gia đình bằng ký hiệu liền mạch.",
    time: "6 phút",
    xp: 25,
  },
  4: {
    theory: "Các ký hiệu chỉ màu sắc cơ bản (Đỏ, Xanh, Vàng...) và hình học không gian trực quan.",
    practice: "Nhận biết và miêu tả màu sắc của đồ vật thông qua cử chỉ bàn tay chuẩn xác.",
    time: "5 phút",
    xp: 20,
  },
  5: {
    theory: "Ký hiệu các thói quen hằng ngày: Ăn cơm, Uống nước, Đi học, Đi làm, Nghỉ ngơi.",
    practice: "Mô phỏng chuỗi hoạt động thường nhật bằng ngôn ngữ ký hiệu mượt mà.",
    time: "7 phút",
    xp: 25,
  },
  6: {
    theory: "Ký hiệu diễn đạt Vui vẻ, Buồn, Ngạc nhiên, Lo lắng kèm cử chỉ ánh mắt và khuôn mặt.",
    practice: "Thực hành đồng bộ giữa chuyển động tay và sắc thái cảm xúc khuôn mặt trước camera AI.",
    time: "6 phút",
    xp: 25,
  },
};

const LessonDetailsPopover = ({ lesson, chapter, onClose, triggerRef }) => {
  const navigate = useNavigate();
  const popoverRef = useRef(null);
  const actionButtonRef = useRef(null);

  const isTheory = lesson.kind === "theory";
  const isCompleted = lesson.status === "completed";
  const isLocked = lesson.status === "locked";
  const isActive = lesson.status === "active" || lesson.status === "unlocked";

  const resolvedLessonId =
    lesson.lessonId ??
    (typeof lesson.id === "string" ? lesson.id.replace(/-.*$/, "") : lesson.id);

  const lessonMeta = LESSON_INFO[resolvedLessonId] || {
    theory: "Tìm hiểu các cử chỉ và nguyên tắc ngôn ngữ ký hiệu chuẩn xác.",
    practice: "Thực hành cử chỉ với hệ thống chấm điểm trí tuệ nhân tạo.",
    time: "5 phút",
    xp: 20,
  };

  const description = isTheory ? lessonMeta.theory : lessonMeta.practice;

  // Handle keyboard events (ESC to close), focus trapping and body scroll lock
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        triggerRef?.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    if (actionButtonRef.current && !actionButtonRef.current.disabled) {
      actionButtonRef.current.focus();
    } else {
      popoverRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, triggerRef]);

  const handleStart = () => {
    if (isLocked) return;
    const url = `/learning-path/lesson/${resolvedLessonId}${isTheory ? "" : "?step=practice"}`;
    navigate(url);
  };

  const getPrerequisiteText = () => {
    if (isTheory) {
      return "Cần hoàn thành bài kiểm tra của trạm trước đó để mở khóa lý thuyết bài này.";
    }
    if (lesson.published === false) {
      return "Bài thực hành này đang được cập nhật nội dung.";
    }
    return "Cần hoàn thành phần Lý thuyết của bài này trước khi bắt đầu bài thực hành.";
  };

  return createPortal(
    <div
      className="lp-popover-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
          triggerRef?.current?.focus();
        }
      }}
    >
      <div
        ref={popoverRef}
        className="lp-popover-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lp-popover-title"
      >
        {/* Header Tag & Close button */}
        <div className="lp-popover-header">
          <div className="lp-popover-badges">
            <span className={`lp-popover-kind-tag lp-popover-kind-tag--${lesson.kind}`}>
              {isTheory ? <BookOpen size={12} /> : <PencilLine size={12} />}
              {isTheory ? "LÝ THUYẾT" : "THỰC HÀNH"}
            </span>
            <span className="lp-popover-step-num">BƯỚC {lesson.number}</span>
          </div>

          <button
            type="button"
            className="lp-popover-close-btn"
            onClick={() => {
              onClose();
              triggerRef?.current?.focus();
            }}
            aria-label="Đóng bảng thông tin"
          >
            <X size={16} />
          </button>
        </div>

        {/* Lesson Title & Chapter */}
        <div className="lp-popover-body">
          <span className="lp-popover-chapter-tag">
            CHƯƠNG {chapter?.id || lesson.chapterId} · {chapter?.title || "Ký hiệu cơ bản"}
          </span>
          <h3 id="lp-popover-title" className="lp-popover-title">
            {lesson.title}
          </h3>
          <p className="lp-popover-desc">{description}</p>
        </div>

        {/* Stats Chips (Time, XP, Status) */}
        <div className="lp-popover-stats">
          <div className="lp-popover-stat-chip">
            <Clock size={14} className="text-teal-600" />
            <span>{lessonMeta.time}</span>
          </div>
          <div className="lp-popover-stat-chip">
            <Award size={14} className="text-amber-500" />
            <span>+{lessonMeta.xp} XP</span>
          </div>
          <div
            className={`lp-popover-status-chip lp-popover-status-chip--${lesson.status}`}
          >
            {isCompleted && (
              <>
                <Check size={13} strokeWidth={2.5} />
                <span>Đã hoàn thành</span>
              </>
            )}
            {isActive && (
              <>
                <Sparkles size={13} />
                <span>Sẵn sàng học</span>
              </>
            )}
            {isLocked && (
              <>
                <Lock size={13} />
                <span>Đang khóa</span>
              </>
            )}
          </div>
        </div>

        {/* Prerequisite Alert if locked */}
        {isLocked && (
          <div className="lp-popover-alert" role="status">
            <AlertCircle size={15} className="lp-popover-alert-icon" />
            <p className="lp-popover-alert-text">{getPrerequisiteText()}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="lp-popover-footer">
          {isLocked ? (
            <button
              type="button"
              className="lp-popover-btn lp-popover-btn--disabled"
              disabled
              aria-disabled="true"
            >
              <Lock size={16} />
              <span>Chưa mở khóa</span>
            </button>
          ) : isCompleted ? (
            <button
              ref={actionButtonRef}
              type="button"
              className="lp-popover-btn lp-popover-btn--review"
              onClick={handleStart}
            >
              <RotateCcw size={16} />
              <span>Ôn tập lại bài học</span>
            </button>
          ) : (
            <button
              ref={actionButtonRef}
              type="button"
              className="lp-popover-btn lp-popover-btn--primary"
              onClick={handleStart}
            >
              <span>{isTheory ? "Bắt đầu học lý thuyết" : "Bắt đầu luyện tập"}</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LessonDetailsPopover;
