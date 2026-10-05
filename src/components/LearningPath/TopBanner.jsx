import { Hand } from "lucide-react";

import "./TopBanner.css";

const TopBanner = ({ totalLessons = 0 }) => {
  return (
    <div className="lp-banner">
      <div className="lp-banner__content">
        <div className="lp-banner__left">
          <span className="lp-banner__tag">ĐANG HỌC</span>
          <h1 className="lp-banner__title text-h1">Nền tảng Ngôn ngữ Ký hiệu Việt Nam</h1>
          <p className="lp-banner__subtitle">Bắt đầu hành trình giao tiếp bằng ngôn ngữ ký hiệu</p>
        </div>

        <div className="lp-banner__right">
          <div className="lp-banner__icon-circle">
            <Hand size={32} strokeWidth={1.8} />
          </div>
          <span className="lp-banner__badge">{totalLessons} bài học</span>
        </div>
      </div>
    </div>
  );
};

export default TopBanner;
