import { useState } from "react";
import { Award, Flame, Trophy, Check, Lock, Star } from "lucide-react";
import "./Dashboard.css";

// DATA MẪU
const user = {
  name: "Cassie",
  level: "Cơ bản",
  xp: 800,
  streak: 12,
  bestStreak: 20,
  rank: 20,
};

const chapters = [
  { id: 1, title: "Chào hỏi", done: 10, total: 10, status: "completed" },
  { id: 2, title: "Gia đình", done: 6, total: 10, status: "active" },
  { id: 3, title: "Trường học", status: "locked", unlockAfter: "Chương 2" },
  { id: 4, title: "Mua bán", status: "locked", unlockAfter: "Chương 3" },
];

const leaderboard = {
  month: [
    { id: 1, name: "Nguyễn Văn A", score: 1240 },
    { id: 2, name: "Nguyễn Văn B", score: 1105 },
    { id: 3, name: "Nguyễn Văn C", score: 980 },
    { id: 4, name: "Nguyễn Văn D", score: 920 },
    { id: 5, name: "Nguyễn Văn E", score: 860 },
    { id: 6, name: "Nguyễn Văn F", score: 855 },
  ],
  all: [
    { id: 1, name: "Nguyễn Văn B", score: 5320 },
    { id: 2, name: "Nguyễn Văn A", score: 5105 },
    { id: 3, name: "Nguyễn Văn E", score: 4870 },
    { id: 4, name: "Nguyễn Văn C", score: 4210 },
    { id: 5, name: "Nguyễn Văn F", score: 3960 },
    { id: 6, name: "Nguyễn Văn D", score: 3800 },
  ],
};

const MEDALS = ["🥇", "🥈", "🥉"];

const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();

const percent = (done, total) => Math.round((done / total) * 100);

function StatCard({ icon, value, label }) {
  return (
    <div className="db-stat">
      <span className="db-stat__icon">{icon}</span>
      <span className="db-stat__value">{value}</span>
      <span className="db-stat__label">{label}</span>
    </div>
  );
}

function ChapterItem({ chapter }) {
  const { id, title, done, total, status, unlockAfter } = chapter;

  if (status === "locked") {
    return (
      <div className="db-chapter db-chapter--locked">
        <span className="db-chapter__lead">
          <Lock size={26} strokeWidth={1.8} />
        </span>
        <div className="db-chapter__body">
          <p className="db-chapter__title">
            Chương {id} · {title}
          </p>
          <p className="db-chapter__sub">Mở khóa sau khi hoàn thành {unlockAfter}</p>
        </div>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="db-chapter db-chapter--completed">
        <span className="db-chapter__lead db-chapter__lead--check">
          <Check size={30} strokeWidth={2.4} />
        </span>
        <div className="db-chapter__body">
          <p className="db-chapter__title">
            Chương {id} · {title}
          </p>
          <p className="db-chapter__sub db-chapter__sub--green">
            {done}/{total} bài
          </p>
        </div>
        <Star className="db-chapter__star" size={34} fill="#f6c945" stroke="#e0a800" />
      </div>
    );
  }

  return (
    <div className="db-chapter db-chapter--active">
      <span className="db-chapter__lead db-chapter__lead--num">{id}</span>
      <div className="db-chapter__body">
        <p className="db-chapter__title">
          Chương {id} · {title}
        </p>
        <p className="db-chapter__sub db-chapter__sub--green">
          {done}/{total} bài · Đang học
        </p>
      </div>
      <div className="db-chapter__bar" aria-hidden="true">
        <span style={{ width: `${percent(done, total)}%` }} />
      </div>
    </div>
  );
}

function Dashboard() {
  const [tab, setTab] = useState("month");
  const current = chapters.find((c) => c.status === "active");
  const currentPercent = percent(current.done, current.total);

  return (
    <div className="db">
      {/* ===== Banner chào mừng ===== */}
      <section className="db-welcome">
        <div className="db-welcome__text">
          <p className="db-welcome__eyebrow">CHÀO MỪNG TRỞ LẠI</p>
          <h1 className="db-welcome__title">
            Chào {user.name} <span aria-hidden="true">👋</span>
            <span className="db-welcome__level">Cấp độ: {user.level}</span>
          </h1>
          <p className="db-welcome__desc">
            Hôm nay là ngày học thứ {user.streak} liên tiếp - giữ vững phong độ nhé.
          </p>
        </div>

        <div className="db-welcome__stats">
          <StatCard
            icon={<Award size={25} strokeWidth={1.6} color="#c0644a" />}
            value={user.xp}
            label="Điểm XP"
          />
          <StatCard
            icon={<Flame size={25} strokeWidth={1.6} color="#3f7a5f" />}
            value={user.streak}
            label="Chuỗi ngày"
          />
          <StatCard
            icon={<Trophy size={25} strokeWidth={1.6} color="#5b56c9" />}
            value={user.bestStreak}
            label="Streak dài nhất"
          />
        </div>
      </section>

      <div className="db-grid">
        {/* ===== Cột trái: tiếp tục học + lộ trình ===== */}
        <div className="db-left">
          <section className="db-continue">
            <div className="db-continue__info">
              <p className="db-continue__eyebrow">TIẾP TỤC HỌC</p>
              <h2 className="db-continue__title">
                Chương {current.id} · {current.title}
              </h2>
              <div className="db-continue__bar" aria-hidden="true">
                <span style={{ width: `${currentPercent}%` }} />
              </div>
              <p className="db-continue__meta">
                {current.done}/{current.total} bài · {currentPercent}%
              </p>
            </div>
            <button type="button" className="db-continue__btn">
              Tiếp tục →
            </button>
          </section>

          <section className="db-path">
            <div className="db-path__head">
              <h2>Lộ trình của bạn</h2>
              <span>Thiết kế theo cấp độ {user.level}</span>
            </div>
            <div className="db-path__list">
              {chapters.map((c) => (
                <ChapterItem key={c.id} chapter={c} />
              ))}
            </div>
          </section>
        </div>

        {/* ===== Cột phải: bảng xếp hạng ===== */}
        <aside className="db-board">
          <h2 className="db-board__title">BẢNG XẾP HẠNG</h2>

          <div className="db-board__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "month"}
              className={tab === "month" ? "is-active" : ""}
              onClick={() => setTab("month")}
            >
              Tháng này
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "all"}
              className={tab === "all" ? "is-active" : ""}
              onClick={() => setTab("all")}
            >
              Tất cả
            </button>
          </div>

          <ol className="db-board__list">
            {leaderboard[tab].map((p, i) => (
              <li key={p.id} className="db-rank">
                <span className="db-rank__pos">
                  {i < 3 ? MEDALS[i] : `#${i + 1}`}
                </span>
                <span className="db-rank__avatar">{getInitials(p.name)}</span>
                <span className="db-rank__name">{p.name}</span>
                <span className="db-rank__score">
                  {p.score.toLocaleString("vi-VN")}
                </span>
              </li>
            ))}
          </ol>

          <div className="db-rank db-rank--me">
            <span className="db-rank__pos">#{user.rank}</span>
            <span className="db-rank__avatar">{getInitials(user.name)}</span>
            <span className="db-rank__name">{user.name}</span>
            <span className="db-rank__score">
              {user.xp.toLocaleString("vi-VN")}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;