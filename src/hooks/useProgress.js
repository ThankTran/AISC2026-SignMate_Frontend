import { createContext, useContext } from "react";
export const ProgressContext = createContext(null);
export function useProgress() {
  const value = useContext(ProgressContext);

  if (!value) {
    throw new Error("ProgressProvider is required");
  }

  return value;
}

export const useChapters = () => useProgress().chapters;
export function useLeaderboard(scope = "all") {
  const progress = useProgress();
  const mine = progress.leaderboard.find((row) => row.isMe);

  return {
    data:
      progress.status === "ready" &&
      (progress.source === "mock" || progress.rankingStatus === "ready")
        ? {
            entries:
              scope === "level"
                ? progress.levelLeaderboard ||
                  progress.leaderboard.filter((row) => row.xpLevel === mine?.xpLevel)
                : progress.leaderboard,
          }
        : null,
    error: progress.error || progress.rankingError,
    retry: progress.retry,
  };
}
