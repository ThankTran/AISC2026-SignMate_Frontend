export function adaptAppointments(rows) {
  const incomingScheduleRequests = [],
    scheduledSessions = [];
  for (const row of rows) {
    const starts = new Date(row.startsAt);
    if (!Number.isFinite(starts.getTime()) || row.status === "declined") continue;
    const date = `${starts.getFullYear()}-${String(starts.getMonth() + 1).padStart(2, "0")}-${String(starts.getDate()).padStart(2, "0")}`;
    const time = `${String(starts.getHours()).padStart(2, "0")}:${String(starts.getMinutes()).padStart(2, "0")}`;
    const item = {
      ...row,
      date,
      time,
      name: row.partnerName,
      friendName: row.partnerName,
      avatar: "/logo-signmate.png",
      friendAvatar: "/logo-signmate.png",
      status: row.status === "accepted" ? "Sắp diễn ra" : "Đợi xác nhận",
    };
    if (row.incoming && row.status === "pending") incomingScheduleRequests.push(item);
    else scheduledSessions.push(item);
  }
  return { incomingScheduleRequests, scheduledSessions };
}
