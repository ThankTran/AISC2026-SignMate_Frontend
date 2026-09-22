import { useEffect } from "react";
import { ShieldCheck, X } from "lucide-react";

const NOTICE_DURATION_MS = 4500;

export default function CallNotice({ message, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, NOTICE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <div className="vc-toast" role="status">
      <ShieldCheck size={18} />
      {message}
      <button aria-label="Đóng thông báo" onClick={onDismiss}>
        <X size={16} />
      </button>
    </div>
  );
}
