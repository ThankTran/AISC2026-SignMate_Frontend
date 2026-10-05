import { useProgress } from "./useProgress";
export { useLeaderboard, useChapters } from "./useProgress";
export function useDashboard() {
  const progress = useProgress();

  return {
    data: progress.status === "ready" ? { ...progress, user: progress.user } : null,
    error: progress.error,
    retry: progress.retry,
  };
}
