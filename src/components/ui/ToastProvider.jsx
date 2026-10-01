import { ToastContext } from '../../hooks/useToast';
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./ui.css";
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const timers = useRef(new Map());
  const dismiss = useCallback(id => { clearTimeout(timers.current.get(id)); timers.current.delete(id); setItems(prev => prev.filter(item => item.id !== id)); }, []);
  useEffect(() => { const map = timers.current; return () => { map.forEach(clearTimeout); map.clear(); }; }, []);
  const toast = useCallback(({ type = 'info', message, undo, duration = undo ? 10000 : 5000 }) => {
    const id = crypto.randomUUID();
    setItems(prev => [...prev, { id, type, message, undo }]);
    if (duration) timers.current.set(id, setTimeout(() => dismiss(id), duration));
    return id;
  }, [dismiss]);
  return <ToastContext.Provider value={toast}>{children}{createPortal(<div className="ui-toasts" aria-live="polite" aria-relevant="additions text">{items.map(item => <div className={`ui-toast ui-toast--${item.type}`} key={item.id} role={item.type === 'error' ? 'alert' : 'status'} onMouseEnter={() => clearTimeout(timers.current.get(item.id))} onFocus={() => clearTimeout(timers.current.get(item.id))}>
    <span>{item.message}</span>{item.undo && <button onClick={async () => { dismiss(item.id); try { await item.undo(); } catch { toast({ type: 'error', message: 'Không thể hoàn tác. Vui lòng thử lại.' }); } }}>Hoàn tác</button>}
    <button aria-label="Đóng thông báo" onClick={() => dismiss(item.id)}>×</button>
  </div>)}</div>, document.body)}</ToastContext.Provider>;
}
