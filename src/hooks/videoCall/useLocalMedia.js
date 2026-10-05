import { useEffect, useRef, useState } from "react";

export function useLocalMedia(onError, options = {}) {
  const [mic, setMic] = useState(false);
  const [camera, setCamera] = useState(false);
  const [mediaRevision, setMediaRevision] = useState(0);
  const [stream, setStream] = useState(null);
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
    if (pendingRef.current.has(kind)) {
      return;
    }

    const setEnabled = kind === "video" ? setCamera : setMic;
    const activeTracks =
      streamRef.current?.getTracks().filter((track) => track.kind === kind) ?? [];

    if (activeTracks.length) {
      activeTracks.forEach((track) => {
        track.stop();
        streamRef.current.removeTrack(track);
      });
      setEnabled(false);
      setMediaRevision((value) => value + 1);

      return;
    }

    pendingRef.current.add(kind);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video:
          kind === "video"
            ? options.deviceId
              ? { deviceId: { exact: options.deviceId } }
              : true
            : false,
        audio: kind === "audio",
      });

      // Permission may resolve after the call screen has unmounted.
      if (!previewRef.current) {
        stream.getTracks().forEach((track) => track.stop());

        return;
      }

      if (!streamRef.current) {
        streamRef.current = new MediaStream();
      }

      stream.getTracks().forEach((track) => {
        streamRef.current.addTrack(track);
        track.onended = () => {
          streamRef.current?.removeTrack(track);
          setEnabled(false);
          setMediaRevision((value) => value + 1);
        };
      });
      previewRef.current.srcObject = streamRef.current;
      setStream(streamRef.current);
      setEnabled(true);
      setMediaRevision((value) => value + 1);
    } catch {
      if (previewRef.current) {
        onError(
          "Không thể truy cập thiết bị. Hãy kiểm tra quyền camera / micro trong trình duyệt.",
        );
      }
    } finally {
      pendingRef.current.delete(kind);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void toggleMedia("video");

      if (options.mic) {
        void toggleMedia("audio");
      }
    }, 0);

    return () => clearTimeout(timer);
    // Device settings apply once when entering a room.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { mic, camera, previewRef, toggleMedia, stream, mediaRevision };
}
