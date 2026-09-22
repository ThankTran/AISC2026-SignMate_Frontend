import { Star, Flame, Trophy, BookOpen, Lock, Medal } from "lucide-react";
import "./Stats.css";

// DATA MẪU
const stats = {
  level: "Cơ bản",
  nextLevel: "Trung cấp",
  xp: 800,
  xpTarget: 1000,
  streak: 12,
  bestStreak: 20,
  lessonsLearned: 68,
  rank: 20,
  xpToday: 45,
  chapters: [
    { id: 1, title: "Chào hỏi", done: 10, total: 10, status: "completed" },
    { id: 2, title: "Gia đình", done: 6, total: 10, status: "active" },
    { id: 3, title: "Trường học", done: 0, total: 10, status: "locked" },
    { id: 4, title: "Mua bán", done: 0, total: 10, status: "locked" },
  ],
};

const percent = (done, total) =>
  total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;

function SummaryCard({ tone, icon, value, label }) {
  return (
    <div className={`st-summary st-summary--${tone}`}>
      <span className="st-summary__icon">{icon}</span>
      <span className="st-summary__value">{value}</span>
      <span className="st-summary__label">{label}</span>
    </div>
  );
}

function ChapterRow({ chapter }) {
  const { id, title, done, total, status } = chapter;

  let badge;
  if (status === "completed") {
    badge = <Star size={18} fill="#fff" stroke="#fff" />;
  } else if (status === "active") {
    badge = <span className="st-chapter__num">{done}</span>;
  } else {
    badge = <Lock size={18} strokeWidth={1.8} />;
  }

  return (
    <div className="st-chapter">
      <span className={`st-chapter__badge st-chapter__badge--${status}`}>
        {badge}
      </span>

      <div className="st-chapter__body">
        <div className="st-chapter__head">
          <span className="st-chapter__title">
            Chương {id} · {title}
          </span>
          <span className="st-chapter__count">
            {done}/{total}
          </span>
        </div>
        <div
          className="st-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
          aria-label={`Chương ${id} · ${title}`}
        >
          <span style={{ width: `${percent(done, total)}%` }} />
        </div>
      </div>
    </div>
  );
}

function StatsPage() {
  const xpPercent = percent(stats.xp, stats.xpTarget);
  const xpRemaining = Math.max(0, stats.xpTarget - stats.xp);

  return (
    <div className="st">
      <header className="st-header">
        <h1>Thống kê</h1>
        <p>Thống kê kết quả học tập</p>
      </header>

      <div className="st-content">
        {/* ===== 4 thẻ tổng quan ===== */}
        <section className="st-summaries">
          <SummaryCard
            tone="gold"
            icon={<Star size={26} fill="#f6c945" stroke="#d9a400" />}
            value={stats.level}
            label="Cấp độ hiện tại"
          />
          <SummaryCard
            tone="fire"
            icon={<Flame size={26} fill="#f08a3c" stroke="#d9552b" />}
            value={stats.streak}
            label="Chuỗi ngày học"
          />
          <SummaryCard
            tone="trophy"
            icon={<Trophy size={26} fill="#f2b632" stroke="#b9851a" />}
            value={stats.bestStreak}
            label="Streak dài nhất"
          />
          <SummaryCard
            tone="book"
            icon={<BookOpen size={26} stroke="#4e7a62" />}
            value={stats.lessonsLearned}
            label="Bài học đã học"
          />
        </section>

        {/* ===== Điểm kinh nghiệm ===== */}
        <section className="st-card st-xp">
          <div className="st-xp__row">
            <h2>Điểm kinh nghiệm (XP)</h2>
            <span className="st-xp__total">{stats.xp} XP</span>
          </div>
          <div className="st-xp__row st-xp__row--sub">
            <span>
              {stats.level} → {stats.nextLevel}
            </span>
            <span className="st-mono">
              {stats.xp} / {stats.xpTarget} XP
            </span>
          </div>
          <div
            className="st-bar st-bar--xp"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={stats.xpTarget}
            aria-valuenow={stats.xp}
            aria-label="Điểm kinh nghiệm"
          >
            <span style={{ width: `${xpPercent}%` }} />
          </div>
          <p className="st-xp__hint">
            Cần thêm <strong className="st-mono">{xpRemaining} XP</strong> để lên cấp{" "}
            {stats.nextLevel}
          </p>
        </section>

        {/* ===== Tiến độ học ===== */}
        <section className="st-card st-progress">
          <h2>Tiến độ học</h2>
          <div className="st-progress__list">
            {stats.chapters.map((c) => (
              <ChapterRow key={c.id} chapter={c} />
            ))}
          </div>
        </section>

        {/* ===== Xếp hạng ===== */}
        <section className="st-card st-rank">
          <span className="st-rank__icon">
            <Medal size={28} stroke="#7b6fd6" />
          </span>
          <div className="st-rank__main">
            <p className="st-rank__label">XẾP HẠNG</p>
            <p className="st-rank__value">
              <span className="st-rank__num">#{stats.rank}</span>
              <span className="st-rank__desc">toàn bộ người dùng</span>
            </p>
          </div>
          <div className="st-rank__today">
            <p className="st-rank__label st-rank__label--plain">Hôm nay</p>
            <p className="st-rank__xp">+{stats.xpToday} XP</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default StatsPage;