import { VIDEO_DEMO } from "../../services/videoCall/config";
import { ShieldCheck, Video } from "lucide-react";

export default function VideoCallHeader() {
  return (
    <header className="vc-topline" aria-label="Đầu trang SignConnect">
      <div className="vc-brand-badge">
        <span className="vc-brand-icon">
          <Video size={16} />
        </span>
        <span className="vc-brand-text">SIGNCONNECT</span>
        {VIDEO_DEMO && <span className="vc-demo-pill">BẢN DEMO</span>}
      </div>
      <div className="vc-trust-badge">
        <ShieldCheck size={15} />
        <span>Không gian thực hành an toàn & tôn trọng</span>
      </div>
    </header>
  );
}
