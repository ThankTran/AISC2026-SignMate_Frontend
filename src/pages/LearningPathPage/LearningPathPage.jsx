import "./LearningPathPage.css";

import TopBanner from "../../components/LearningPath/TopBanner";
import SCurvePath from "../../components/LearningPath/SCurvePath";
import ProgressWidget from "../../components/LearningPath/ProgressWidget";
import DailyQuests from "../../components/LearningPath/DailyQuests";
import NextUpCard from "../../components/LearningPath/NextUpCard";

const LearningPathPage = () => {
  return (
    <div className="lp-page">
      {/* ========== LEFT COLUMN ========== */}
      <div className="lp-page__main">
        <TopBanner />
        <SCurvePath />
      </div>

      {/* ========== RIGHT COLUMN ========== */}
      <aside className="lp-page__sidebar">
        <ProgressWidget />
        <DailyQuests />
        <NextUpCard />
      </aside>
    </div>
  );
};

export default LearningPathPage;
