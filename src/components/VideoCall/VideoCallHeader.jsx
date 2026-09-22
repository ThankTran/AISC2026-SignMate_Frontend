import { ShieldCheck, Video } from "lucide-react";

export default function VideoCallHeader() {
  return (
    <div className="vc-topline">
      <span>
        <Video size={16} /> SIGNCONNECT{" "}
        <span className="vc-demo">BẢN DEMO</span>
      </span>
      <span>
        <ShieldCheck size={15} /> Không gian học tập an toàn
      </span>
    </div>
  );
}
