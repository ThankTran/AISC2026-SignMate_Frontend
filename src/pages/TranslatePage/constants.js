import { BookOpen, Video, Layers } from "lucide-react";

export const MODES = [
  {
    id: "word-to-sign",
    title: "Từ → Ký hiệu",
    shortTitle: "Từ → Ký hiệu",
    description: "Tra cứu video cử chỉ chuẩn từ từ vựng tiếng Việt",
    icon: BookOpen,
  },
  {
    id: "video-to-word",
    title: "Video → Từ",
    shortTitle: "Video → Từ",
    description: "Tải video cử chỉ VSL để nhận diện bằng mô hình AI",
    icon: Video,
  },
  {
    id: "sentence-to-sequence",
    title: "Câu → Chuỗi ký hiệu",
    shortTitle: "Câu → Chuỗi",
    description: "Chuyển câu tiếng Việt thành danh sách video ký hiệu liên tiếp",
    icon: Layers,
  },
];

export const QUICK_EXAMPLES = [
  "chào",
  "xin lỗi",
  "tạm biệt",
  "ban ngày",
  "ban đêm",
  "bàn tay",
  "địa chỉ",
  "tỉnh",
  "nhân viên",
  "tiếp tân",
];

export const VERIFIED_SENTENCES = [
  "Tôi đi học bằng ô tô",
  "Tôi đi học bằng xe máy",
  "Tôi muốn giúp đỡ bạn",
  "Tôi cảm ơn thầy cô",
  "Xin chào bạn",
  "Chào bạn tạm biệt",
];
