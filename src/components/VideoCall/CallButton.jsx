export default function CallButton({ children, onClick, secondary = false, className = "", ...props }) {
  return (
    <button
      className={`vc-button ${secondary ? "vc-secondary" : ""} ${className}`.trim()}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
