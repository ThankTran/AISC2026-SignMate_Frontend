import EmptyState from "../../components/ui/EmptyState";
import { curriculumLevel, xpLevel } from "../../utils/learningLevels";
import { useDashboard, useLeaderboard } from "../../hooks/useLearningData";
import Skeleton from "../../components/ui/Skeleton";
import Avatar from "../../components/ui/Avatar";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ApiState from "../../components/ApiState";
import { getContinueTarget, percent } from "./learningProgress";
import { Award, Flame, Trophy, Check, Lock, Star } from "lucide-react";
import "./Dashboard.css";

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
  const { id, title, done, total, status, quiz } = chapter;

  if (status === "locked") {
    return (
      <div
        className="db-chapter db-chapter--locked"
        tabIndex={0}
        title="Hoàn thành các bài học trước để mở khóa chương này."
        aria-label={`${title}: Hoàn thành các bài học trước để mở khóa.`}
      >
        <span className="db-chapter__lead">
          <Lock size={26} strokeWidth={1.8} />
        </span>
        <div className="db-chapter__body">
          <p className="db-chapter__title">
            Chương {id} · {title}
          </p>
          <p className="db-chapter__sub">{total} bài học · Chưa mở khóa</p>
        </div>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <Link to="/learning-path" className="db-chapter db-chapter--completed">
        <span className="db-chapter__lead db-chapter__lead--check">
          <Check size={30} strokeWidth={2.4} />
        </span>
        <div className="db-chapter__body">
          <p className="db-chapter__title">
            Chương {id} · {title}
          </p>
          <p className="db-chapter__sub db-chapter__sub--green">
            {done}/{total} bài học ·{" "}
            {quiz.status === "completed" ? "Đã hoàn thành kiểm tra" : "Chờ kiểm tra cuối chương"}
          </p>
        </div>
        <Star className="db-chapter__star" size={34} fill="#f6c945" stroke="#e0a800" />
      </Link>
    );
  }

  return (
    <Link to="/learning-path" className="db-chapter db-chapter--active">
      <span className="db-chapter__lead db-chapter__lead--num">{id}</span>
      <div className="db-chapter__body">
        <p className="db-chapter__title">
          Chương {id} · {title}
        </p>
        <p className="db-chapter__sub db-chapter__sub--green">
          {done}/{total} bài học · Đang học
        </p>
      </div>
      <div className="db-chapter__bar" aria-hidden="true">
        <span style={{ width: `${percent(done, total)}%` }} />
      </div>
    </Link>
  );
}

function Dashboard() {
  const currentUser = useCurrentUser();
  const [tab, setTab] = useState("all");
  const navigate = useNavigate();
  const { data, error, retry } = useDashboard();
  const board = useLeaderboard(tab);

  if (!data || error) {
    return error ? <ApiState error={error} retry={retry} /> : <Skeleton variant="dashboard" />;
  }

  if (!data.chapters.length) {
    return (
      <EmptyState
        title="Chưa có tiến độ học"
        description="Mở lộ trình để bắt đầu bài học đầu tiên."
        to="/learning-path"
        actionLabel="Bắt đầu bài học"
      />
    );
  }

  const { chapters } = data;
  const user = {
    ...currentUser,
    ...data.stats,
    name: currentUser.name,
    photoURL: currentUser.photoURL,
  };
  const myRanking = board.data?.entries.find((entry) => entry.isMe || entry.id === currentUser.uid);
  const weeklyXp = myRanking?.weeklyXp ?? data.stats.weeklyXp ?? 0;
  const rank = myRanking?.rank ?? user.rank;
  const target = getContinueTarget(chapters);
  const current = target?.chapter;
  const currentPercent = current ? percent(current.done, current.total) : 0;
  const allCompleted =
    chapters.length > 0 &&
    chapters.every(
      (chapter) => chapter.done === chapter.total && chapter.quiz.status === "completed",
    );

  return (
    <div className="db">
      {/* ===== Banner chào mừng ===== */}
      <section className="db-welcome">
        <div className="db-welcome__text">
          <p className="db-welcome__eyebrow">CHÀO MỪNG TRỞ LẠI</p>
          <h1 className="db-welcome__title text-h1">
            Chào {user.name}
            <span className="db-welcome__level">
              Cấp độ: {curriculumLevel(user)} · Level {xpLevel(user.xp)}
            </span>
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
              <h2 className="db-continue__title text-h2">
                {current
                  ? `Chương ${current.id} · ${current.title}`
                  : allCompleted
                    ? "Bạn đã hoàn thành lộ trình!"
                    : "Chưa có bài học khả dụng"}
              </h2>
              {current && (
                <div className="db-continue__bar" aria-hidden="true">
                  <span style={{ width: `${currentPercent}%` }} />
                </div>
              )}
              <p className="db-continue__meta">
                {current
                  ? `${current.done}/${current.total} bài học · ${currentPercent}% · 1 bài kiểm tra cuối chương`
                  : allCompleted
                    ? "Ôn tập các bài học trong lộ trình."
                    : "Xem lộ trình để biết các bài học hiện có."}
              </p>
            </div>
            <button
              type="button"
              className="db-continue__btn"
              onClick={() => navigate(target?.path ?? "/learning-path")}
            >
              {target?.label ?? "Xem lộ trình →"}
            </button>
          </section>

          <section className="db-path">
            <div className="db-path__head">
              <h2 className="text-h2">Lộ trình của bạn</h2>
              <span>Thiết kế theo cấp độ {curriculumLevel(user)}</span>
            </div>
            <div className="db-path__list">
              {chapters.length === 0 && <p>Chưa có chương học. Vui lòng quay lại sau.</p>}
              {chapters.map((c) => (
                <ChapterItem key={c.id} chapter={c} />
              ))}
            </div>
          </section>
        </div>

        {/* ===== Cột phải: bảng xếp hạng ===== */}
        <aside className="db-board">
          <h2 className="db-board__title text-h2">BẢNG XẾP HẠNG</h2>

          <div className="db-board__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "level"}
              className={tab === "level" ? "is-active" : ""}
              onClick={() => setTab("level")}
            >
              Cùng Level
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

          {!board.data &&
            (board.error ? (
              <ApiState error={board.error} retry={board.retry} />
            ) : (
              <Skeleton variant="leaderboard" />
            ))}
          {board.data?.entries.length === 0 && <p>Chưa có dữ liệu xếp hạng.</p>}
          <ol className="db-board__list">
            {(board.data?.entries || []).slice(0, 6).map((p, i) => (
              <li key={p.id} className="db-rank">
                <span className="db-rank__pos">{`#${p.rank ?? i + 1}`}</span>
                <Avatar user={p} size={36} />
                <span className="db-rank__name">{p.name}</span>
                <span className="db-rank__score">{p.weeklyXp.toLocaleString("vi-VN")}</span>
              </li>
            ))}
          </ol>

          <div className="db-rank db-rank--me">
            <span className="db-rank__pos">{rank == null ? "—" : `#${rank}`}</span>
            <Avatar user={user} size={36} />
            <span className="db-rank__name">{user.name}</span>
            <span className="db-rank__score">{weeklyXp.toLocaleString("vi-VN")}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;
