export default function CallButton({ children, onClick, secondary = false, ...props }) {
  return (
    <button className={`vc-button ${secondary ? "vc-secondary" : ""}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
}
