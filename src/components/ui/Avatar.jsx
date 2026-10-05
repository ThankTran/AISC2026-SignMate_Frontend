import { getInitials } from "../../utils/getInitials";
import { useState } from "react";
import "./ui.css";
export default function Avatar({ user, size = 40, className = "" }) {
  const [failed, setFailed] = useState(null);
  const name = user?.displayName || user?.name || user?.email || "";
  const photo =
    user?.photoURL ||
    (user?.avatar?.startsWith("http") || user?.avatar?.startsWith("/") ? user.avatar : "");
  const pixels =
    typeof size === "number" && Number.isFinite(size) && size > 0
      ? size
      : { sm: 32, md: 40, lg: 64, xl: 96 }[size] || 40;

  return (
    <span
      className={`ui-avatar ${className}`}
      style={{ "--avatar-size": `${pixels}px` }}
      role="img"
      aria-label={name ? `Ảnh đại diện của ${name}` : "Ảnh đại diện"}
    >
      {photo && failed !== photo ? (
        <img src={photo} alt="" onError={() => setFailed(photo)} />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
