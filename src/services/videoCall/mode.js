export function isVideoDemo(env = {}) {
  if (env.VITE_VIDEO_CALL_MODE === "real") return false;
  if (env.VITE_VIDEO_CALL_MODE === "demo") return true;
  return env.VITE_USE_MOCK === "true" || env.VITE_DEMO === "true";
}
