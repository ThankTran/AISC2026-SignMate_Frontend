import { Inbox, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import Skeleton from "./Skeleton";
import { errorMessage } from "../../services/errorMessages";
export function EmptyState({
  title = "Chưa có dữ liệu",
  description = "Hãy bắt đầu để xem tiến độ của bạn.",
  to = "/learning-path",
  actionLabel = "Xem lộ trình",
  onAction,
  icon: Icon = Inbox,
}) {
  return (
    <div className="ui-data-state" role="status">
      <Icon aria-hidden="true" size={28} />
      <h2 className="text-h2">{title}</h2>
      <p>{description}</p>
      {onAction ? (
        <button onClick={onAction}>{actionLabel}</button>
      ) : (
        to && <Link to={to}>{actionLabel}</Link>
      )}
    </div>
  );
}

export function ErrorState({ error, onRetry = () => window.location.reload() }) {
  return (
    <div className="ui-data-state" role="alert">
      <TriangleAlert aria-hidden="true" />
      <h2 className="text-h2">Chưa tải được dữ liệu</h2>
      <p>{errorMessage(error)}</p>
      <button onClick={onRetry}>Thử lại</button>
    </div>
  );
}

export default function DataState({ status, error, retry, empty = false, children, ...props }) {
  if (error || status === "error") {
    return <ErrorState error={error} onRetry={retry} />;
  }

  if (status === "loading") {
    return <Skeleton />;
  }

  if (empty) {
    return <EmptyState {...props} />;
  }

  return children;
}
