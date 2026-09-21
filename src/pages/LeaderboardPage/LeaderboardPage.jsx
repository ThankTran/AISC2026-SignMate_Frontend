import { useEffect, useState } from "react";
import {
  ArrowUp,
  Crown,
  Flame,
  Star,
  Trophy,
  Zap,
} from "lucide-react";

import "./LeaderboardPage.css";

// ===== Mock data =====
const AVATAR = (img) => `https://i.pravatar.cc/96?img=${img}`;

const FILTERS = [
  {
    key: "level",
    idleLabel: "Cùng Level",
    activeLabel: "Cùng Level · 128 người",
  },
  {
    key: "all",
    idleLabel: "Toàn bộ Users",
    activeLabel: "Tất cả · 1,284 người",
  },
];

const PODIUM = [
  {
    rank: 2,
    name: "Lê Phương Anh",
    handle: "@phuonganh",
    level: 80,
    weeklyXp: 12400,
    avatar: AVATAR(32),
  },
  {
    rank: 1,
    name: "Hoàng Minh Khôi",
    handle: "@minhkhoi",
    level: 85,
    weeklyXp: 15920,
    avatar: AVATAR(59),
  },
  {
    rank: 3,
    name: "Trần Bảo Ngọc",
    handle: "@baongoc",
    level: 76,
    weeklyXp: 10880,
    avatar: AVATAR(47),
  },
];

const LEADERBOARD = [
  { rank: 4, name: "Trần Ngọc Huy", handle: "@huy.tran", level: 72, weeklyXp: 9240, totalXp: 893120, avatar: AVATAR(12) },
  { rank: 5, name: "Lê Thanh Bình", handle: "@binh.le", level: 68, weeklyXp: 8560, totalXp: 812480, avatar: AVATAR(22) },
  { rank: 6, name: "Phạm Minh Châu", handle: "@minhchau", level: 65, weeklyXp: 7910, totalXp: 748220, avatar: AVATAR(33) },
  { rank: 7, name: "Võ Khánh Linh", handle: "@khanhlinh", level: 63, weeklyXp: 7255, totalXp: 684900, avatar: AVATAR(45) },
  { rank: 8, name: "Ngô Hải Đăng", handle: "@haidang", level: 60, weeklyXp: 6840, totalXp: 619340, avatar: AVATAR(51) },
  { rank: 9, name: "Đặng Thu Hà", handle: "@thuha", level: 58, weeklyXp: 6480, totalXp: 562110, avatar: AVATAR(68) },
  { rank: 10, name: "Bùi Quốc Bảo", handle: "@quocbao", level: 55, weeklyXp: 6120, totalXp: 501075, avatar: AVATAR(13) },
  { rank: 11, name: "Hồ Ngọc Diệp", handle: "@ngocdiep", level: 51, weeklyXp: 5760, totalXp: 447890, avatar: AVATAR(26) },
  { rank: 12, name: "Trương Gia Hân", handle: "@giahan", level: 47, weeklyXp: 5420, totalXp: 392600, avatar: AVATAR(38) },
  { rank: 13, name: "Nguyễn Đức Phong", handle: "@ducphong", level: 42, weeklyXp: 4980, totalXp: 310250, avatar: AVATAR(56) },
  { rank: 14, name: "Cassie", handle: "@cassie", level: 25, weeklyXp: 2740, totalXp: 52128, avatar: null, isMe: true },
  { rank: 15, name: "Mai Quỳnh Anh", handle: "@quynhanh", level: 38, weeklyXp: 3950, totalXp: 205780, avatar: AVATAR(41) },
  { rank: 16, name: "Đỗ Minh Quân", handle: "@minhquan", level: 36, weeklyXp: 3480, totalXp: 168240, avatar: AVATAR(15) },
  { rank: 17, name: "Lý Gia Bảo", handle: "@giabao", level: 33, weeklyXp: 3060, totalXp: 131900, avatar: AVATAR(30) },
  { rank: 18, name: "Tô Diệu Linh", handle: "@dieulinh", level: 30, weeklyXp: 2610, totalXp: 98460, avatar: AVATAR(57) },
  { rank: 19, name: "Hà Anh Tuấn", handle: "@anhtuan", level: 28, weeklyXp: 2190, totalXp: 73870, avatar: AVATAR(20) },
  { rank: 20, name: "Đinh Thảo Vy", handle: "@thaovy", level: 24, weeklyXp: 1780, totalXp: 51660, avatar: AVATAR(69) },
];

const CURRENT_USER = {
  name: "Cassie",
  handle: "@cassie",
  rank: 14,
  level: 25,
  weeklyXp: 2740,
  weeklyGoal: 2980,
  xpToNextRank: 240,
  streak: 7,
  totalXpLabel: "52.1K",
};

const WEEKLY_ACTIVITY = [
  { day: "T2", xp: 180 },
  { day: "T3", xp: 320 },
  { day: "T4", xp: 210 },
  { day: "T5", xp: 260 },
  { day: "T6", xp: 450 },
  { day: "T7", xp: 620 },
  { day: "CN", xp: 700 },
];

const MILESTONES = [
  {
    tone: "coral",
    icon: <Trophy size={16} strokeWidth={2.2} />,
    title: "Vượt hạng #13",
    desc: "Ghi thêm 240 XP để vượt người đứng ngay trên",
  },
  {
    tone: "gold",
    icon: <Zap size={16} strokeWidth={2.2} />,
    title: "Level 26",
    desc: "Còn 1,450 XP để đạt cấp độ tiếp theo",
  },
  {
    tone: "green",
    icon: <Flame size={16} strokeWidth={2.2} />,
    title: "Streak 14 ngày",
    desc: "Duy trì chuỗi học thêm 7 ngày nữa",
  },
];

const RISERS = [
  { name: "Hồ Thị Thu", handle: "@thithu.ho", jump: 6, currentRank: 22, avatar: AVATAR(48) },
  { name: "Nguyễn Anh Khoa", handle: "@anhkhoa", jump: 4, currentRank: 25, avatar: AVATAR(25) },
  { name: "Phan Minh Quân", handle: "@minhquan.p", jump: 3, currentRank: 29, avatar: AVATAR(42) },
  { name: "Lê Hoàng Yến", handle: "@hoangyen", jump: 2, currentRank: 31, avatar: AVATAR(31) },
];

const formatXp = (value) => value.toLocaleString("en-US");

const MAX_DAY_XP = Math.max(...WEEKLY_ACTIVITY.map((d) => d.xp));

// ===== Helpers =====
const UserAvatar = ({ user, size }) =>
  user.isMe ? (
    <span className={`lb-avatar lb-avatar--${size}`} aria-hidden="true">
      {user.name.charAt(0)}
    </span>
  ) : (
    <img src={user.avatar} alt={user.name} className={`lb-avatar lb-avatar--${size}`} />
  );

const LeaderboardPage = () => {
  const [filter, setFilter] = useState("all");

  // Single-scroll: quay về đầu trang khi mount
  useEffect(() => {
    const bodyEl = document.querySelector(".main-layout__body");
    if (bodyEl) bodyEl.scrollTop = 0;
    window.scrollTo(0, 0);
  }, []);

  const visibleRows = LEADERBOARD.filter((user) =>
    filter === "level" ? user.level >= 24 && user.level <= 26 : true
  );

  const weeklyProgressPct = Math.round(
    (CURRENT_USER.weeklyXp / CURRENT_USER.weeklyGoal) * 100
  );

  return (
    <div className="lb">
      {/* ========== PAGE HEADER ========== */}
      <header className="lb-header">
        <div className="lb-header__heading">
          <h1 className="lb-header__title">Bảng xếp hạng</h1>
          <p className="lb-header__subtitle">
            Tuần này · Cập nhật lúc 08:00 sáng
          </p>
        </div>

        <div className="lb-header__status">
          <span className="lb-streak">
            <Flame size={15} strokeWidth={2.4} />
            Streak 7 ngày
          </span>
          <span className="lb-header-avatar" aria-label="Hồ sơ của bạn">
            C
          </span>
        </div>
      </header>

      {/* ========== LEFT COLUMN (MAIN) ========== */}
      <div className="lb-main">
        {/* Filter pills */}
        <div className="lb-filters" role="group" aria-label="Lọc bảng xếp hạng">
          <div className="lb-filters__group">
            {FILTERS.map((f) => {
              const isActive = filter === f.key;
              return (
                <button
                  type="button"
                  key={f.key}
                  aria-pressed={isActive}
                  className={`lb-filter ${isActive ? "lb-filter--active" : ""}`}
                  onClick={() => setFilter(f.key)}
                >
                  {isActive ? f.activeLabel : f.idleLabel}
                </button>
              );
            })}
          </div>

          <span className="lb-filters__hint">
            {filter === "level"
              ? "Chỉ hiện người dùng cùng level với bạn"
              : "Tất cả người dùng · cập nhật 08:00"}
          </span>
        </div>

        {/* Top 3 podium banner */}
        <section className="lb-podium">
          <header className="lb-podium__head">
            <span className="lb-podium__emblem">
              <Trophy size={16} strokeWidth={2.2} />
            </span>
            <h2 className="lb-podium__title">Top 3 tuần này</h2>
          </header>

          <div className="lb-podium__grid">
            {PODIUM.map((user) => (
              <div
                className={`lb-podium__card lb-podium__card--rank-${user.rank}`}
                key={user.rank}
              >
                <div className="lb-podium__person">
                  {user.rank === 1 && (
                    <span className="lb-podium__crown" aria-hidden="true">
                      <Crown size={15} strokeWidth={2.4} fill="currentColor" />
                    </span>
                  )}

                  <div className="lb-podium__avatar-wrap">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="lb-podium__avatar"
                    />
                    <span
                      className={`lb-podium__badge lb-podium__badge--${user.rank}`}
                    >
                      {user.rank}
                    </span>
                  </div>

                  <strong className="lb-podium__name">{user.name}</strong>
                  <span className="lb-podium__handle">{user.handle}</span>
                  <span className="lb-podium__xp">
                    {formatXp(user.weeklyXp)} XP
                  </span>
                </div>

                <div className="lb-podium__stand" />
              </div>
            ))}
          </div>
        </section>

        {/* Rankings table #4 - #20 */}
        <section className="lb-board">
          <div className="lb-board__head" aria-hidden="true">
            <span>#</span>
            <span>Người dùng</span>
            <span>Level</span>
            <span>XP tuần</span>
            <span>Tổng XP</span>
          </div>

          <div className="lb-board__list">
            {visibleRows.map((user) => (
              <div
                className={`lb-row ${user.isMe ? "lb-row--me" : ""}`}
                key={user.rank}
              >
                <span className="lb-row__rank">{user.rank}</span>

                <div className="lb-row__user">
                  <UserAvatar user={user} />
                  <div className="lb-row__identity">
                    <strong className="lb-row__name">
                      {user.name}
                      {user.isMe && (
                        <em className="lb-row__me-tag">Bạn</em>
                      )}
                    </strong>
                    <span className="lb-row__handle">{user.handle}</span>
                  </div>
                </div>

                <span className="lb-row__level">
                  <span className="lb-level">Lv.{user.level}</span>
                </span>

                <span className="lb-row__weekly">
                  {formatXp(user.weeklyXp)} xp
                </span>

                <span className="lb-row__total">
                  {formatXp(user.totalXp)} xp
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ========== RIGHT COLUMN (SIDEBAR) ========== */}
      <aside className="lb-side">
        {/* Current user status card */}
        <section className="lb-me">
          <div className="lb-me__top">
            <UserAvatar user={{ name: CURRENT_USER.name, isMe: true }} size="lg" />

            <div className="lb-me__identity">
              <div className="lb-me__name-row">
                <strong className="lb-me__name">{CURRENT_USER.name}</strong>
                <span className="lb-me__rank">#{CURRENT_USER.rank}</span>
              </div>
              <span className="lb-me__handle">{CURRENT_USER.handle}</span>
            </div>
          </div>

          <div className="lb-me__level-row">
            <span className="lb-me__level-chip">Lv.{CURRENT_USER.level}</span>

            <div className="lb-me__progress-head">
              <span className="lb-me__progress-label">XP tuần này</span>
              <span className="lb-me__progress-values">
                {formatXp(CURRENT_USER.weeklyXp)} /{" "}
                {formatXp(CURRENT_USER.weeklyGoal)}
              </span>
            </div>
          </div>

          <div className="lb-me__track">
            <div
              className="lb-me__track-fill"
              style={{ width: `${weeklyProgressPct}%` }}
            />
          </div>

          <p className="lb-me__hint">
            Cần thêm {formatXp(CURRENT_USER.xpToNextRank)} XP để vượt hạng #
            {CURRENT_USER.rank - 1}
          </p>

          <div className="lb-me__metrics">
            <div className="lb-me__metric">
              <span className="lb-me__metric-icon lb-me__metric-icon--coral">
                <Flame size={15} strokeWidth={2.2} />
              </span>
              <strong className="lb-me__metric-value">
                {CURRENT_USER.streak} Ngày
              </strong>
              <span className="lb-me__metric-label">Streak</span>
            </div>

            <div className="lb-me__metric">
              <span className="lb-me__metric-icon lb-me__metric-icon--gold">
                <Star size={15} strokeWidth={2.2} />
              </span>
              <strong className="lb-me__metric-value">
                {CURRENT_USER.totalXpLabel}
              </strong>
              <span className="lb-me__metric-label">Tổng XP</span>
            </div>
          </div>
        </section>

        {/* Weekly activity chart */}
        <section className="lb-card">
          <h3 className="lb-card__title">Hoạt động tuần này</h3>

          <div className="lb-chart">
            {WEEKLY_ACTIVITY.map((d) => (
              <div className="lb-chart__row" key={d.day}>
                <span className="lb-chart__day">{d.day}</span>
                <div className="lb-chart__track">
                  <div
                    className="lb-chart__fill"
                    style={{ width: `${(d.xp / MAX_DAY_XP) * 100}%` }}
                  />
                </div>
                <span className="lb-chart__xp">{formatXp(d.xp)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Next milestones */}
        <section className="lb-card">
          <h3 className="lb-card__title">Mốc tiếp theo</h3>

          <div className="lb-milestones">
            {MILESTONES.map((m) => (
              <div className="lb-milestone" key={m.title}>
                <span className={`lb-milestone__icon lb-milestone__icon--${m.tone}`}>
                  {m.icon}
                </span>
                <div className="lb-milestone__body">
                  <strong className="lb-milestone__title">{m.title}</strong>
                  <span className="lb-milestone__desc">{m.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Fastest risers */}
        <section className="lb-card">
          <h3 className="lb-card__title">Đang tăng nhanh 🚀</h3>

          <div className="lb-risers">
            {RISERS.map((r) => (
              <div className="lb-riser" key={r.handle}>
                <img
                  src={r.avatar}
                  alt={r.name}
                  className="lb-riser__avatar"
                />
                <div className="lb-riser__body">
                  <strong className="lb-riser__name">{r.name}</strong>
                  <span className="lb-riser__meta">
                    lên hạng #{r.currentRank}
                  </span>
                </div>
                <span className="lb-riser__jump">
                  <ArrowUp size={12} strokeWidth={2.6} />
                  {r.jump}
                </span>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
};

export default LeaderboardPage;