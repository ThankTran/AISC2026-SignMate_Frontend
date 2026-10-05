import { adaptProgress, adaptLeaderboard } from "../api/progressAdapter.js";
export const canLoadAccount = (uid, auth) => !!uid && (!auth || !!auth.user);
export const needsRankings = (pathname) =>
  ["/dashboard", "/ranking"].includes(pathname.replace(/\/+$/, ""));
export async function loadProgress(accountApi) {
  // Dashboard already includes stats, chapters and quests.
  return adaptProgress({ dashboard: await accountApi.dashboard() });
}

export async function loadRankings(accountApi) {
  const [all, level] = await Promise.all([
    accountApi.leaderboard("all"),
    accountApi.leaderboard("level"),
  ]);

  return { leaderboard: adaptLeaderboard(all), levelLeaderboard: adaptLeaderboard(level) };
}
