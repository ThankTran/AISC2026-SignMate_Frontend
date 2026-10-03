import {useEffect} from 'react';
export function useBeforeUnload(enabled) {
  useEffect(() => {
    if (!enabled) return;
    const warn = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [enabled]);
}
