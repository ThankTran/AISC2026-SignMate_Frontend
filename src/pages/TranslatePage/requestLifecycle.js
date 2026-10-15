// Only the newest request may update the visible result or loading state.
export function createRequestLifecycle() {
  let current;
  return {
    start() {
      current?.abort();
      current = new AbortController();
      return current.signal;
    },
    cancel() {
      current?.abort();
      current = undefined;
    },
  };
}
