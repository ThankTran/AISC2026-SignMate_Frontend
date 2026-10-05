export const xpLevel = (xp = 0) => Math.floor(Math.max(0, Number(xp) || 0) / 1000) + 1;
export const curriculumLevel = (user) =>
  user?.curriculumLevel ||
  user?.courseLevel ||
  (typeof user?.level === "string" ? user.level : "Cơ bản");
export function rankEntries(entries) {
  return [...entries]
    .sort(
      (a, b) =>
        (Number(b.weeklyXp) || 0) - (Number(a.weeklyXp) || 0) ||
        (Number(b.totalXp) || 0) - (Number(a.totalXp) || 0) ||
        String(a.id).localeCompare(String(b.id)),
    )
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
      xpLevel: xpLevel(entry.totalXp ?? entry.xp),
    }));
}

export function xpGapToPrevious(entries, id) {
  const index = entries.findIndex((entry) => String(entry.id) === String(id));

  return index > 0
    ? Math.max(0, Number(entries[index - 1].weeklyXp) - Number(entries[index].weeklyXp))
    : null;
}
