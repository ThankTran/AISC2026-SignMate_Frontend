export function readTheoryItems(raw, items, completed) {
  const validIds = new Set(items.map((item) => item.id));
  if (completed) return [...validIds];
  let stored;
  try {
    stored = JSON.parse(raw);
  } catch {
    stored = [];
  }
  return Array.isArray(stored) ? [...new Set(stored.filter((id) => validIds.has(id)))] : [];
}

export function markTheoryItem(raw, items, completed, id) {
  const ids = readTheoryItems(raw, items, completed);
  if (items.some((item) => item.id === id) && !ids.includes(id)) ids.push(id);
  return JSON.stringify(ids);
}
