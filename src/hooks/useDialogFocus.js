import { useEffect, useRef } from "react";

const stack = [];

export function useDialogFocus(onClose, { open = true, closeOnEscape = true } = {}) {
  const ref = useRef(null);
  const close = useRef(onClose);

  useEffect(() => {
    close.current = onClose;
  }, [onClose]);
  useEffect(() => {
    if (!open || !ref.current) {
      return;
    }

    const dialog = ref.current;
    const previous = document.activeElement;

    stack.push(dialog);

    const items = () =>
      [
        ...dialog.querySelectorAll(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((el) => !el.hidden && el.tabIndex >= 0 && el.getClientRects().length);

    (items()[0] || dialog).focus();

    const keydown = (event) => {
      if (stack.at(-1) !== dialog) {
        return;
      }

      if (event.key === "Escape" && closeOnEscape) {
        event.preventDefault();
        event.stopPropagation();
        close.current?.();
      }

      if (event.key !== "Tab") {
        return;
      }

      const list = items(),
        first = list[0],
        last = list.at(-1);

      if (!first) {
        event.preventDefault();
        dialog.focus();
      } else if (
        event.shiftKey &&
        (document.activeElement === first || !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    const focus = (event) => {
      if (stack.at(-1) === dialog && !dialog.contains(event.target)) {
        (items()[0] || dialog).focus();
      }
    };

    document.addEventListener("keydown", keydown, true);
    document.addEventListener("focusin", focus);

    return () => {
      stack.splice(stack.indexOf(dialog), 1);
      document.removeEventListener("keydown", keydown, true);
      document.removeEventListener("focusin", focus);
      queueMicrotask(() => {
        if (previous?.isConnected) {
          previous.focus();
        }
      });
    };
  }, [open, closeOnEscape]);

  return ref;
}
