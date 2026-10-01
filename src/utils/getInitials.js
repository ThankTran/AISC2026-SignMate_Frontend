export function getInitials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.length > 1 ? words.slice(-2).map(word => [...word][0]).join('').toUpperCase() : [...(words[0] || '?')].slice(0,2).join('').toUpperCase();
}
