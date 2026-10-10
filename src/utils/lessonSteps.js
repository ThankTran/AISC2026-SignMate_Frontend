// Number each stop in chapter order; theory availability is independent of assessment media.
export function lessonSteps(chapter, isDone = () => false) {
  return chapter.lessons.flatMap((lesson, index) => {
    const passed = lesson.status === "completed";
    const available =
      lesson.theoryUnlocked ?? ["active", "unlocked", "completed"].includes(lesson.status);
    const learned = (lesson.theoryCompleted ?? passed) || isDone(lesson.id);
    return ["theory", "practice"].map((kind, step) => ({
      ...lesson,
      lessonId: lesson.id,
      id: `${lesson.id}-${kind}`,
      kind,
      number: String(index * 2 + step + 1).padStart(2, "0"),
      status: !available
        ? "locked"
        : kind === "theory"
          ? learned
            ? "completed"
            : "active"
          : lesson.published === false
            ? "locked"
            : passed
              ? "completed"
              : learned
                ? "active"
                : "locked",
    }));
  });
}
