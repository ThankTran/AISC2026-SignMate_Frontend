import EmptyState from "../../components/ui/EmptyState";
import DailyQuests from "../../components/LearningPath/DailyQuests";
import "./LearningPathPage.css";

import TopBanner from "../../components/LearningPath/TopBanner";
import SCurvePath from "../../components/LearningPath/SCurvePath";
import ProgressWidget from "../../components/LearningPath/ProgressWidget";
import NextUpCard from "../../components/LearningPath/NextUpCard";
import { useDashboard } from "../../hooks/useLearningData";
import ApiState from "../../components/ApiState";

const LearningPathPage = () => {
  const { data, error, retry } = useDashboard();
  if (!data || error) return <ApiState error={error} retry={retry} />;
  if(!data.chapters.length)return <EmptyState title="Chưa có chương học" description="Lộ trình sẽ xuất hiện khi nội dung được cập nhật." to="/dashboard" actionLabel="Về trang chủ"/>;
  const nextLesson = data.chapters.flatMap((chapter) =>
    chapter.lessons.map((lesson) => ({ ...lesson, chapterId: chapter.id }))
  ).find((lesson) => lesson.status === "active");
  return (
    <div className="lp-page">
      {/* ========== LEFT COLUMN ========== */}
      <div className="lp-page__main">
        <TopBanner totalLessons={data.chapters.reduce((sum, chapter) => sum + chapter.total, 0)} />
        <SCurvePath chapters={data.chapters} />
      </div>

      {/* ========== RIGHT COLUMN ========== */}
      <aside className="lp-page__sidebar">
        <ProgressWidget stats={data.stats} chapters={data.chapters} />
        <section className="lp-page__daily">
          <DailyQuests quests={data.dailyQuests} />
          <p>{data.stats.xpToday} XP đã được ghi nhận.</p>
        </section>
        {nextLesson && <NextUpCard lesson={nextLesson} />}
      </aside>
    </div>
  );
};

export default LearningPathPage;
