import { useState, useRef } from "react";
import {
  BookOpen,
  PencilLine,
  Check,
  Lock,
  MessageCircle,
  Users,
  Palette,
  Sun,
  Smile,
} from "lucide-react";
import LessonDetailsPopover from "./LessonDetailsPopover";

// Map lesson topic icon from mock data
const ICON_MAP = {
  bookOpen: BookOpen,
  messageCircle: MessageCircle,
  users: Users,
  palette: Palette,
  sun: Sun,
  smile: Smile,
};

const LessonNode3D = ({ lesson, chapter, xPercent, yPx }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const buttonRef = useRef(null);

  const isTheory = lesson.kind === "theory";
  const isCompleted = lesson.status === "completed";
  const isLocked = lesson.status === "locked";
  const isActive = lesson.status === "active" || lesson.status === "unlocked";

  // Pick suitable icon: Theory uses BookOpen, Practice uses the lesson topic icon
  const TopicIcon = ICON_MAP[lesson.icon] || PencilLine;
  const CenterIcon = isTheory ? BookOpen : TopicIcon;

  const statusLabel = isCompleted
    ? "Đã hoàn thành"
    : isActive
      ? "Đang học"
      : "Bị khóa";

  const kindLabel = isTheory ? "Lý thuyết" : "Thực hành";

  return (
    <div
      className={`lp-node3d-container lp-node3d-container--${lesson.status}`}
      style={{
        left: `${xPercent}%`,
        top: `${yPx}px`,
      }}
    >
      {/* Ground Contact Shadow beneath platform */}
      <div className="lp-node3d-shadow" aria-hidden="true" />

      {/* Interactive 3D Platform Button */}
      <button
        ref={buttonRef}
        type="button"
        className={`lp-node3d-btn lp-node3d-btn--${lesson.status} lp-node3d-btn--${lesson.kind}`}
        onClick={() => setIsPopoverOpen(true)}
        aria-label={`${kindLabel} bước ${lesson.number}: ${lesson.title} (${statusLabel})`}
        aria-expanded={isPopoverOpen}
        aria-haspopup="dialog"
      >
        {/* Active Concentric Ripple / Beacon Ring */}
        {isActive && !isCompleted && (
          <span className="lp-node3d-beacon-ring" aria-hidden="true" />
        )}

        {/* 3D Extrusion Pedestal */}
        <div className="lp-node3d-pedestal">
          {/* Raised Top Platform Face */}
          <div className="lp-node3d-face">
            {/* Concentric Groove Ring */}
            <div className="lp-node3d-groove">
              <span className="lp-node3d-icon-wrap">
                <CenterIcon
                  className="lp-node3d-glyph"
                  size={26}
                  strokeWidth={2.4}
                />
              </span>
            </div>
          </div>
        </div>

        {/* State Badges */}
        {isCompleted && (
          <span
            className="lp-node3d-status-badge lp-node3d-status-badge--completed"
            title="Đã hoàn thành"
            aria-hidden="true"
          >
            <Check size={13} strokeWidth={3} />
          </span>
        )}

        {isLocked && (
          <span
            className="lp-node3d-status-badge lp-node3d-status-badge--locked"
            title="Bị khóa"
            aria-hidden="true"
          >
            <Lock size={12} strokeWidth={2.5} />
          </span>
        )}

        {isActive && !isCompleted && (
          <span
            className="lp-node3d-status-badge lp-node3d-status-badge--active"
            title="Đang học"
            aria-hidden="true"
          >
            <span className="lp-node3d-beacon-dot" />
          </span>
        )}
      </button>

      {/* Upright, Non-overlapping Under-Node Label */}
      <div
        className="lp-node3d-label"
        onClick={() => setIsPopoverOpen(true)}
        style={{ cursor: "pointer" }}
        role="button"
        tabIndex={-1}
        aria-hidden="true"
      >
        <span className={`lp-node3d-kind-tag lp-node3d-kind-tag--${lesson.kind}`}>
          {isTheory ? "LÝ THUYẾT" : "THỰC HÀNH"}
        </span>
        <span className="lp-node3d-title">{lesson.title}</span>

        {isActive && !isCompleted && (
          <span className="lp-node3d-live-tag">
            <span className="lp-node3d-live-dot" />
            Đang học
          </span>
        )}
      </div>

      {/* Accessible Detail Popover / Bottom Sheet */}
      {isPopoverOpen && (
        <LessonDetailsPopover
          lesson={lesson}
          chapter={chapter}
          onClose={() => setIsPopoverOpen(false)}
          triggerRef={buttonRef}
        />
      )}
    </div>
  );
};

export default LessonNode3D;
