/* =========================================================
   LỘ TRÌNH HỌC THEO CHƯƠNG - DỮ LIỆU MẪU
   (Tọa độ theo % của container, khớp viewBox 700x1650)
   ========================================================= */

export const CHAPTERS = [
  {
    id: 1,
    tag: "Chương 1",
    title: "Ký hiệu cơ bản",
    desc: "Làm quen với bảng chữ cái, cách chào hỏi và giới thiệu bản thân.",
    status: "completed",
    done: 3,
    total: 3,
    header: { x: 50, y: 6.06 },
    lessons: [
      {
        id: 1,
        title: "Bảng chữ & Số",
        status: "completed",
        icon: "bookOpen",
        x: 20,
        y: 11.52,
      },
      {
        id: 2,
        title: "Chào hỏi cơ bản",
        status: "completed",
        icon: "messageCircle",
        x: 80,
        y: 19.39,
      },
      {
        id: 3,
        title: "Thành viên gia đình",
        status: "completed",
        icon: "users",
        x: 20,
        y: 27.27,
      },
    ],
    quiz: { x: 80, y: 35.15, status: "completed", score: 90 },
  },
  {
    id: 2,
    tag: "Chương 2",
    title: "Giao tiếp hằng ngày",
    desc: "Màu sắc, hình dạng và các hoạt động quen thuộc trong cuộc sống.",
    status: "active",
    done: 1,
    total: 3,
    header: { x: 50, y: 48.48 },
    lessons: [
      {
        id: 4,
        title: "Màu sắc & Hình dạng",
        status: "completed",
        icon: "palette",
        x: 20,
        y: 54.55,
      },
      {
        id: 5,
        title: "Hoạt động hằng ngày",
        status: "active",
        icon: "sun",
        x: 80,
        y: 64.24,
        tooltip: {
          desc: "Ăn, ngủ, đi làm, học tập mỗi ngày",
          duration: "12 phút",
          xp: "+30 XP",
        },
      },
      {
        id: 6,
        title: "Biểu cảm cảm xúc",
        status: "unlocked",
        icon: "smile",
        x: 20,
        y: 73.94,
      },
    ],
    quiz: { x: 80, y: 84.85, status: "locked" },
  },
];

export const SON_CHUONG_LABEL = {
  completed: "Hoàn thành",
  active: "Đang học",
  locked: "Bị khóa",
};

export const getChapterById = (id) =>
  CHAPTERS.find((c) => c.id === Number(id));

/* Bài học cuối cùng của chương - khóa mở bài kiểm tra của chương */
export const getLastLessonStatus = (chapter) => {
  if (!chapter || !Array.isArray(chapter.lessons) || !chapter.lessons.length) {
    return null;
  }
  return chapter.lessons[chapter.lessons.length - 1].status;
};

export const canAccessChapterQuiz = (chapterId) => {
  const chapter = getChapterById(chapterId);
  return Boolean(chapter && getLastLessonStatus(chapter) === "completed");
};