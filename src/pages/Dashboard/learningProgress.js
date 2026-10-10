export const percent = (done, total) => (total > 0 ? Math.round((done / total) * 100) : 0);

export function getContinueTarget(chapters) {
  for (const chapter of chapters) {
    const lesson = chapter.lessons.find(
      (item) =>
        item.status === "active" ||
        item.status === "unlocked" ||
        (item.theoryUnlocked && !item.theoryCompleted),
    );

    if (lesson) {
      return { chapter, path: `/learning-path/lesson/${lesson.id}`, label: "Tiếp tục →" };
    }

    if (
      chapter.total > 0 &&
      chapter.done === chapter.total &&
      chapter.quiz.status !== "completed"
    ) {
      return { chapter, path: `/learning-path/quiz/${chapter.id}`, label: "Làm bài kiểm tra →" };
    }
  }

  return null;
}
