import { Check, Sparkles, Lock } from "lucide-react";

const SON_CHUONG_LABEL = {
  completed: "Hoàn thành",
  active: "Đang học",
  locked: "Bị khóa",
};

const ChapterHeader3D = ({ chapter }) => {
  const { status } = chapter;
  const total = chapter.total || 0;
  const done = chapter.done || 0;
  const pct = total ? Math.min(100, Math.round((done / total) * 100)) : 0;

  const isCompleted = status === "completed";
  const isActive = status === "active";
  const isLocked = status === "locked";

  return (
    <header className={`lp-chapter3d lp-chapter3d--${status}`} aria-label={chapter.title}>
      {/* Chapter Tag & Status Pill */}
      <div className="lp-chapter3d__head">
        <span className="lp-chapter3d__tag">{chapter.tag || `CHƯƠNG ${chapter.id}`}</span>
        <span className="lp-chapter3d__status">
          {isCompleted && <Check size={13} strokeWidth={2.8} />}
          {isActive && <Sparkles size={13} />}
          {isLocked && <Lock size={12} />}
          <span>{SON_CHUONG_LABEL[status] || status}</span>
        </span>
      </div>

      {/* Chapter Title & Description */}
      <h2 className="lp-chapter3d__title text-h2">{chapter.title}</h2>
      {chapter.desc && <p className="lp-chapter3d__desc">{chapter.desc}</p>}

      {/* Progress Track */}
      <div className="lp-chapter3d__foot">
        <div
          className="lp-chapter3d__bar"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={`Tiến độ chương ${chapter.id}: ${pct}%`}
        >
          <div className="lp-chapter3d__bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="lp-chapter3d__count">
          {total ? `${done}/${total} Bài học` : "Nội dung đang cập nhật"}
        </span>
      </div>
    </header>
  );
};

export default ChapterHeader3D;
