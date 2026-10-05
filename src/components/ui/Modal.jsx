import { lockDocumentScroll } from "../../utils/scrollLock";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useDialogFocus } from "../../hooks/useDialogFocus";
import "./ui.css";

let locks = 0,
  previousInert;

export default function Modal({
  open = true,
  onClose,
  closeOnOutside = true,
  closeOnEscape = true,
  labelledBy,
  describedBy,
  className = "",
  children,
}) {
  const ref = useDialogFocus(onClose, { open, closeOnEscape });

  useEffect(() => {
    if (!open) {
      return;
    }

    const root = document.getElementById("root");
    const unlock = lockDocumentScroll();

    if (locks++ === 0) {
      previousInert = root?.inert;
    }

    if (root) {
      root.inert = true;
    }

    return () => {
      unlock();

      if (--locks === 0 && root) {
        root.inert = previousInert;
      }
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className="ui-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && closeOnOutside) {
          onClose?.();
        }
      }}
    >
      <section
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        className={`ui-modal ${className}`}
      >
        {children}
      </section>
    </div>,
    document.body,
  );
}
