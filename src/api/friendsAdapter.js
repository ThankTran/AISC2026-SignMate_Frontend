export function adaptFriend(row) {
  return {
    ...row,
    photoURL: row.photoURL || (/^https?:|^\//.test(row.avatar || "") ? row.avatar : ""),
    statusText: row.isOnline
      ? "Đang online"
      : row.lastSeenAt
        ? `Hoạt động lần cuối ${new Date(row.lastSeenAt).toLocaleString("vi-VN")}`
        : "Chưa có hoạt động gần đây",
    requestedAt: row.createdAt ? new Date(row.createdAt).toLocaleDateString("vi-VN") : "",
    mutualFriends: Number(row.mutualFriends) || 0,
  };
}
