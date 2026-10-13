// The list represents people, so use partner IDs for deduplication and friend requests.
export function adaptRecentCalls(rows = [], friends = []) {
  const friendIds = new Set(friends.map((friend) => friend.id));
  const people = new Map();
  const completed = rows.filter(
    (row) => row.status === "ended" && row.wasConnected && row.partner?.id,
  );
  completed.sort((a, b) => new Date(b.endedAt || b.startedAt) - new Date(a.endedAt || a.startedAt));
  for (const row of completed) {
    const id = row.partner.id;
    if (people.has(id)) continue;
    const timestamp = new Date(row.endedAt || row.startedAt);
    const validTime = Number.isFinite(timestamp.getTime());
    people.set(id, {
      id,
      callId: row.id,
      name: row.partner.name || row.name,
      avatar: row.partner.avatar || row.avatar,
      photoURL: row.partner.photoURL || "",
      isFriend: friendIds.has(id) || row.isFriend === true,
      wasConnected: true,
      date: validTime ? timestamp.toLocaleDateString("vi-VN") : "",
      day: validTime ? timestamp.toLocaleDateString("vi-VN", { weekday: "long" }) : "",
      time: validTime
        ? timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        : "",
      duration:
        row.duration || `${Math.floor(Math.max(0, Number(row.durationSeconds) || 0) / 60)} phút`,
    });
  }
  return [...people.values()];
}
