import { useLocation } from "react-router-dom";
import { ConfirmContext } from "../../hooks/useConfirm";
import { useRef, useState, useId, useEffect } from "react";
import Modal from "./Modal";
export function ConfirmDialog({
  open,
  title,
  message,
  confirmationText,
  confirmLabel,
  onConfirm,
  onClose,
}) {
  const id = useId();
  const [typed, setTyped] = useState("");

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={id}
      describedBy={`${id}-description`}
      className="ui-confirm"
    >
      <h2 id={id} className="text-h2">
        {title}
      </h2>
      <p id={`${id}-description`}>{message}</p>
      {confirmationText && (
        <label>
          Nhập “{confirmationText}” để xác nhận
          <input
            autoComplete="off"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
          />
        </label>
      )}
      <div className="ui-dialog-actions">
        <button onClick={onClose}>Hủy</button>
        <button
          className="ui-primary"
          disabled={!!confirmationText && typed !== confirmationText}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function ConfirmProvider({ children }) {
  const { key: routeKey } = useLocation();
  const [options, setOptions] = useState(null);
  const resolver = useRef(null);
  const finish = (value) => {
    resolver.current?.(value);
    resolver.current = null;
    setOptions(null);
  };

  useEffect(
    () => () => {
      resolver.current?.(false);
      resolver.current = null;
    },
    [routeKey],
  );

  const confirm = (options) => {
    if (!options.confirmLabel?.trim()) {
      throw new Error("ConfirmDialog requires a specific confirmLabel.");
    }
    resolver.current?.(false);
    setOptions({ ...options, routeKey });

    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <ConfirmDialog
          open={options.routeKey === routeKey}
          {...options}
          onClose={() => finish(false)}
          onConfirm={() => finish(true)}
        />
      )}
    </ConfirmContext.Provider>
  );
}
