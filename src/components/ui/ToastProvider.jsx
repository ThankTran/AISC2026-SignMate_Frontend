import {uuid} from '../../utils/uuid';
import { ToastContext } from '../../hooks/useToast';
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./ui.css";
import {errorMessage} from '../../services/errorMessages';
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const timers = useRef(new Map());
  const dismiss = useCallback(id => { clearTimeout(timers.current.get(id)); timers.current.delete(id); setItems(prev => prev.filter(item => item.id !== id)); }, []);
  useEffect(() => { const map = timers.current; return () => { map.forEach(clearTimeout); map.clear(); }; }, []);
  const toast = useCallback(({ type = 'info', message, error, undo, duration = undo ? 10000 : 5000 }) => {
    const id = uuid();
    setItems(prev => [...prev, { id, type, message:error?errorMessage(error):message, undo }]);
    if (duration) timers.current.set(id, setTimeout(() => dismiss(id), duration));
    return id;
  }, [dismiss]);
  return <ToastContext.Provider value={toast}>{children}{createPortal(<div className="ui-toasts" aria-live="polite" aria-relevant="additions text">{items.map(item => <div className={`ui-toast ui-toast--${item.type}`} key={item.id} role={item.type === 'error' ? 'alert' : 'status'} onMouseEnter={() => clearTimeout(timers.current.get(item.id))} onFocus={() => clearTimeout(timers.current.get(item.id))}>
    <span>{item.message}</span>{item.undo && <button onClick={async () => { dismiss(item.id); try { await item.undo(); } catch(error) { toast({ type: 'error', error }); } }}>Hoàn tác</button>}
    <button aria-label="Đóng thông báo" onClick={() => dismiss(item.id)}>×</button>
  </div>)}</div>, document.body)}</ToastContext.Provider>;
}
