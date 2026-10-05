export default function LoadingScreen() {
  return (
    <div className="loading-screen" role="status">
      <img src="/logo-signmate.png" alt="SignMate" width="80" height="80" />
      <span className="loading-spinner" aria-hidden="true" />
      <p>Đang tải…</p>
    </div>
  );
}
