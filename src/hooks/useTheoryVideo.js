import { useEffect, useState } from "react";
import { theoryVideoApi } from "../services/theoryVideoApi";

export function useTheoryVideo(term) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState(null);
  useEffect(() => {
    if (!term) return;
    const controller = new AbortController();
    // Debounce rapid keypad navigation. Stale results never replace the current sign.
    const timer = setTimeout(() => {
      theoryVideoApi.load(term, { signal: controller.signal }).then(
        (segment) => {
          if (!controller.signal.aborted) setState({ term, attempt, segment });
        },
        (error) => {
          if (!controller.signal.aborted) setState({ term, attempt, error });
        },
      );
    }, 120);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term, attempt]);
  const current = state?.term === term && state?.attempt === attempt ? state : null;
  return {
    segment: current?.segment,
    error: current?.error,
    loading: Boolean(term && !current),
    retry: () => setAttempt((value) => value + 1),
  };
}
