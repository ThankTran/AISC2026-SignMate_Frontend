import vocabulary from "../data/theoryVocabularyMap.json" with { type: "json" };

const aliases = {
  "Bảng chữ & Số": ["Bảng chữ cái", "Số"],
  "Màu sắc & Hình dạng": ["Màu sắc & hình dạng"],
  "Biểu cảm cảm xúc": ["Biểu cảm & cảm xúc"],
};

export function groupsFor(lesson) {
  return (aliases[lesson.title] || [lesson.title]).flatMap((topic) =>
    Object.entries(vocabulary.topics[topic] || {}).map(([level, terms]) => ({
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
