import { useEffect, useState } from "react";

export function InlineLoader({ label = "Đang xử lý" }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  return visible ? (
    <span className="ui-inline-loader" role="status" aria-label={label}>
      …
    </span>
  ) : null;
}

export default function Skeleton({ label = "Đang tải dữ liệu", variant = "content" }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const inline = setTimeout(() => setPhase(1), 100);
    const skeleton = setTimeout(() => setPhase(2), 1000);
    return () => {
      clearTimeout(inline);
      clearTimeout(skeleton);
    };
  }, []);
  if (phase === 0) return null;
  if (phase === 1)
    return (
      <p className="ui-loading-status" role="status">
        {label}…
      </p>
    );
  return (
    <div
      className={"ui-skeleton ui-skeleton--" + variant}
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      {Array.from(
        { length: variant === "leaderboard" ? 7 : variant === "learning-path" ? 6 : 4 },
        (_, index) => (
          <span key={index} aria-hidden="true" />
        ),
      )}
    </div>
  );
}
