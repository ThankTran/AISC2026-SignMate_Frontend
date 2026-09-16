export const REQUEST_PREVIEW_LIMIT = 6;
export const SCHEDULE_PREVIEW_LIMIT = 4;
export const OTHER_TOPIC = "Khác";

export const friendFilters = [
  { label: "Tất cả", value: "all" },
  { label: "Đang online", value: "online" },
  { label: "Offline", value: "offline" },
];

export const calendarWeekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export const calendarMonthNames = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

export const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
