import { useEffect, useRef, useState } from "react";

export function useLocalMedia(onError) {
  const [mic, setMic] = useState(false);
  const [camera, setCamera] = useState(false);
  const streamRef = useRef(null);
  const previewRef = useRef(null);
  const pendingRef = useRef(new Set());

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  async function toggleMedia(kind) {
    // Prevent double-clicks from opening multiple streams for the same device.
    if (pendingRef.current.has(kind)) return;
    const setEnabled = kind === "video" ? setCamera : setMic;
    const activeTracks =
      streamRef.current?.getTracks().filter((track) => track.kind === kind) ??
      [];
    if (activeTracks.length) {
      activeTracks.forEach((track) => {
        track.stop();
        streamRef.current.removeTrack(track);
      });
      setEnabled(false);
      return;
    }

    pendingRef.current.add(kind);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: kind === "video",
        audio: kind === "audio",
      });
      // Permission may resolve after the call screen has unmounted.
      if (!previewRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      if (!streamRef.current) streamRef.current = new MediaStream();
      stream.getTracks().forEach((track) => {
        streamRef.current.addTrack(track);
        track.onended = () => {
          streamRef.current?.removeTrack(track);
          setEnabled(false);
        };
      });
      previewRef.current.srcObject = streamRef.current;
      setEnabled(true);
    } catch {
      if (previewRef.current)
        onError(
          "Không thể truy cập thiết bị. Hãy kiểm tra quyền camera / micro trong trình duyệt.",
        );
    } finally {
      pendingRef.current.delete(kind);
    }
  }
  return { mic, camera, previewRef, toggleMedia };
}
