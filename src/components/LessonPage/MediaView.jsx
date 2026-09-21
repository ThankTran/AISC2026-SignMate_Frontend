import { Lightbulb } from "lucide-react";

import VideoPlayerFrame from "../VideoPlayerFrame/VideoPlayerFrame";

import "./MediaView.css";

const MediaView = ({ question }) => {
  const { title, videoUrl, thumbLabel, icon: Icon } = question;

  return (
    <section className="lesson-media">
      {/* ---- Sub header ---- */}
      <div className="lesson-media__header">
        <span className="lesson-media__tag">KÝ HIỆU ĐANG HỌC</span>
        <h2 className="lesson-media__title">
          Quan sát ký hiệu: {title}
        </h2>
      </div>

      {/* ---- Video player frame ---- */}
      <VideoPlayerFrame
        key={question.id}
        videoUrl={videoUrl}
        thumbLabel={thumbLabel}
        icon={<Icon size={44} strokeWidth={1.6} />}
        duration={28}
        initialTime={7}
        speeds={[0.5, 1, 1.5]}
        slowMo
        replayLabel="Xem lại"
      />

      {/* ---- Tip box ---- */}
      <div className="lesson-media__tip">
        <div className="lesson-media__tip-icon">
          <Lightbulb size={18} strokeWidth={2} />
        </div>
        <p className="lesson-media__tip-text">
          <strong>Mẹo:</strong> Chú ý đến hướng chuyển động của bàn
          tay và biểu cảm khuôn mặt — cả hai đều là phần quan trọng
          của ký hiệu.
        </p>
      </div>
    </section>
  );
};

export default MediaView;