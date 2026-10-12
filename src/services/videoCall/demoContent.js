export const demoParticipant = {
  id: "demo-linh",
  name: "Linh Nguyễn",
  initials: "LN",
  role: "Bạn luyện tập",
};
export const demoConversation = [
  {
    id: 1,
    author: "demo-linh",
    text: "Chào bạn, hôm nay mình cùng luyện cách chào hỏi nhé?",
    time: 0,
  },
  { id: 2, author: "self", text: "Được nhé. Mình sẽ thực hành chậm trước.", time: 0 },
];
export const demoDelays = { joining: 900, waiting: 1400, reconnecting: 1600 };
export const demoScenarios = [
  ["pre-call", "Trước cuộc gọi"],
  ["joining", "Đang vào phòng"],
  ["waiting", "Chờ người tham gia"],
  ["connected", "Đã kết nối"],
  ["camera-off", "Tắt camera"],
  ["muted", "Tắt micro"],
  ["chat", "Chat có tin nhắn"],
  ["interrupted", "Mất kết nối"],
  ["reconnecting", "Đang kết nối lại"],
  ["ended", "Đã kết thúc"],
];
export const demoStatusLabels = {
  "pre-call": "Sẵn sàng khi bạn sẵn sàng",
  joining: "Đang vào phòng…",
  waiting: "Đang chờ Linh Nguyễn…",
  connected: "Đang luyện tập",
  interrupted: "Kết nối tạm gián đoạn",
  reconnecting: "Đang kết nối lại…",
  ended: "Buổi luyện tập đã kết thúc",
};
