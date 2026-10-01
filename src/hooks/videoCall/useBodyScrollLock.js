import { useEffect } from 'react';
import { lockDocumentScroll } from '../../utils/scrollLock';
export function useBodyScrollLock(active) {
  useEffect(() => { if (active) return lockDocumentScroll(); }, [active]);
}
