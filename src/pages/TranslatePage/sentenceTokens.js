// Match the backend's NFC normalization and punctuation-separated word boundaries.
export function replaceSentenceToken(text, tokens, tokenIndex, replacement) {
  const source = text.normalize("NFC");
  const words = [...source.matchAll(/[\p{L}\p{N}_]+/gu)];
  const first = tokens
    .slice(0, tokenIndex)
    .reduce((count, token) => count + token.text.trim().split(/\s+/u).length, 0);
  const length = tokens[tokenIndex]?.text.trim().split(/\s+/u).length;
  const start = words[first];
  const end = words[first + length - 1];
  if (!start || !end) return text;
  return source.slice(0, start.index) + replacement + source.slice(end.index + end[0].length);
}
