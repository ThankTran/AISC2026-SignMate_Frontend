const relative = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });

export function relativeNotificationTime(createdAt, now = Date.now()) {
  const seconds = (new Date(createdAt).getTime() - Number(now)) / 1000;

  if (!createdAt || !Number.isFinite(seconds)) {
    return "";
  }

  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  const [unit, size] = units.find(([, size]) => Math.abs(seconds) >= size) || units.at(-1);

  return relative.format(Math.round(seconds / size), unit);
}

export function notificationPath(type = "") {
  const key = type.toLowerCase().replaceAll("_", "-");
  if (key.startsWith("schedule-")) return "/friends/video-call-invites?tab=schedule";

  if (key === "friend-accepted") {
    return "/friends/list";
  }

  if (key.startsWith("friend")) {
    return "/friends/friend-requests";
  }

  if (key.startsWith("call") || key === "video") {
    return "/friends/video-call-invites";
  }

  if (key.startsWith("ai") || key.startsWith("practice")) {
    return "/practice-ai";
  }

  return "/learning-path";
}

export function adaptNotifications(rows = [], now = Date.now()) {
  return rows.map((row) => ({
    ...row,
    title: row.title || row.message || "Thông báo",
    time: row.createdAt ? relativeNotificationTime(row.createdAt, now) : row.time || "",
    path: notificationPath(row.type),
  }));
}
