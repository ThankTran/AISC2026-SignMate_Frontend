import { useEffect, useRef } from "react";

export function useDialogFocus(onClose) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    const focusable = () => [
      ...dialog.querySelectorAll("button:not(:disabled), textarea"),
    ];
    focusable()[0]?.focus();
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0];
      const last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previous?.isConnected) previous.focus();
    };
  }, [onClose]);
  return dialogRef;
}
