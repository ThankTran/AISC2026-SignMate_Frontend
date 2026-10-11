import vocabulary from "../data/theoryVocabularyMap.json" with { type: "json" };

const aliases = {
  "Bảng chữ & Số": ["Bảng chữ cái", "Số"],
  "Màu sắc & Hình dạng": ["Màu sắc & hình dạng"],
  "Biểu cảm cảm xúc": ["Biểu cảm & cảm xúc"],
};

export function groupsFor(lesson) {
  const numbered = lesson.title.match(/^(.*) · Bài ([1-3])$/);
  const title = numbered ? numbered[1] : lesson.title;
  const levelIndex = numbered ? Number(numbered[2]) - 1 : null;
  return (aliases[title] || [title]).flatMap((topic) =>
    Object.entries(vocabulary.topics[topic] || {})
      .filter((_, index) => levelIndex === null || index === levelIndex)
      .map(([level, terms]) => ({
        id: `${topic}-${level}`,
        topic,
        label:
          topic === "Bảng chữ cái"
            ? "Chữ cái (A – Y)"
            : topic === "Số"
              ? "Số & số đếm"
              : level === "Cơ bản"
                ? "Từ vựng"
                : level,
        terms: terms.map((item) => ({
          ...item,
          id: `${topic}-${level}-${item.sourceOrder}-${item.videoLabel}`,
          topic,
        })),
      })),
  );
}
