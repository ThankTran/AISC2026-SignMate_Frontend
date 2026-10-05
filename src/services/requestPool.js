// Coalesce only in-flight reads; completed responses are never cached.
export function createRequestPool() {
  const pending = new Map();

  return {
    clear() {
      pending.clear();
    },
    run(key, load) {
      if (pending.has(key)) {
        return pending.get(key);
      }

      const promise = Promise.resolve().then(load);

      pending.set(key, promise);

      const release = () => {
        if (pending.get(key) === promise) {
          pending.delete(key);
        }
      };

      promise.then(release, release);

      return promise;
    },
  };
}
