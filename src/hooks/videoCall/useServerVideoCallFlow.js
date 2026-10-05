import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { callApi, socialApi } from "../../services/api";
import { defaultPrompt, defaultTopics } from "../../mockdata/videoCall/topics";

function partnerCard(value) {
  return {
    ...value,
    initials: value.avatar || value.name?.slice(0, 1) || "?",
    avatar: value.photoURL || "",
    bio: value.bio || "",
    sessions: null,
    rating: null,
    friends: null,
  };
}

export function useServerVideoCallFlow() {
  const [params, setParams] = useSearchParams();
  const [call, setCall] = useState(null),
    [selected, setSelected] = useState(defaultTopics);
  const [prompt, setPrompt] = useState(defaultPrompt),
    [mediaOptions, setMediaOptions] = useState({});
  const [elapsed, setElapsed] = useState(0),
    [duration, setDuration] = useState(0);
  const [notice, setNotice] = useState(""),
    [error, setError] = useState(null),
    [busy, setBusy] = useState(false);
  const [safetyAction, setSafetyAction] = useState(null),
    [blocked, setBlocked] = useState(false);
  const [searching, setSearching] = useState(false);
  const generation = useRef(0),
    currentCall = useRef(null),
    entering = useRef(false);
  const cleanupTimer = useRef(null);
  const requested = params.get("step") || "topics";
  const stage =
    requested === "search" && searching
      ? "search"
      : ["match", "devices", "call"].includes(requested) && call?.status === "active"
        ? requested
        : ["review", "thanks"].includes(requested) && call?.status === "ended"
          ? requested
          : "topics";
  const setStage = useCallback(
    (step, replace = false) =>
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);

          next.set("step", step);

          return next;
        },
        { replace },
      ),
    [setParams],
  );
  const adopt = useCallback((value) => {
    currentCall.current = value;
    setCall(value);
  }, []);
  const dismissNotice = useCallback(() => setNotice(""), []);
  const closeSafetyDialog = useCallback(() => setSafetyAction(null), []);
  const endCall = useCallback(async () => {
    const active = currentCall.current;

    if (!active) {
      return;
    }

    try {
      const ended = await callApi.end(active.id);

      adopt(ended);
      setDuration(ended.durationSeconds);
      setStage(ended.wasConnected ? "review" : "topics");
    } catch (failure) {
      setError(failure.message);
    }
  }, [adopt, setStage]);
  const showTopics = useCallback(async () => {
    generation.current++;
    setSearching(false);
    setBusy(true);

    try {
      if (currentCall.current && ["active", "invited"].includes(currentCall.current.status)) {
        await callApi.end(currentCall.current.id);
      }

      await callApi.cancelMatch();
      adopt(null);
      setError(null);
      setStage("topics");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }, [adopt, setStage]);

  async function search() {
    if (busy) {
      return;
    }

    if (!selected.length || selected.length > 5) {
      setNotice("Hãy chọn từ 1 đến 5 chủ đề.");

      return;
    }

    setBusy(true);
    setError(null);

    try {
      if (currentCall.current && ["active", "invited"].includes(currentCall.current.status)) {
        await callApi.end(currentCall.current.id);
      }

      await callApi.cancelMatch();
      adopt(null);
      setElapsed(0);
      setSearching(true);
      setStage("search");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!searching || requested !== "search") {
      return;
    }

    const epoch = ++generation.current;
    let timer,
      disposed = false;

    async function poll() {
      try {
        const result = await callApi.match(selected);

        if (disposed || generation.current !== epoch) {
          if (result.call) {
            void callApi.end(result.call.id).catch(() => {});
          }

          return;
        }

        if (result.status === "matched") {
          adopt(result.call);
          setSearching(false);
          setStage("match");

          return;
        }

        setError(null);
      } catch (failure) {
        if (!disposed) {
          setError(failure.message);
          setSearching(false);
          setStage("topics");
        }

        return;
      }

      timer = setTimeout(poll, 3000);
    }

    const start = setTimeout(poll, 0);

    return () => {
      disposed = true;
      clearTimeout(start);
      clearTimeout(timer);
    };
  }, [searching, requested, selected, adopt, setStage]);

  // Incoming links identify a persisted invitation. Friend links load a full profile first.
  const friendId = params.get("friend"),
    invitationId = params.get("call");

  useEffect(() => {
    if ((!friendId && !invitationId) || currentCall.current || entering.current) {
      return;
    }

    let disposed = false;
    const timer = setTimeout(async () => {
      entering.current = true;
      setBusy(true);
      setError(null);

      try {
        let result;

        if (invitationId) {
          result = await callApi.get(invitationId);
        } else {
          const profile = await socialApi.profile(friendId);

          if (disposed) {
            return;
          }

          result = await callApi.invite(profile.id, defaultTopics[0]);
        }

        if (disposed) {
          if (!invitationId && result?.id) {
            void callApi.end(result.id).catch(() => {});
          }

          return;
        }

        adopt(result);
        setStage(result.status === "active" ? "devices" : "topics", true);
      } catch (failure) {
        if (!disposed) {
          setError(failure.message);
        }
      } finally {
        entering.current = false;

        if (!disposed) {
          setBusy(false);
        }
      }
    }, 0);

    return () => {
      disposed = true;
      clearTimeout(timer);
    };
  }, [friendId, invitationId, adopt, setStage]);
  useEffect(() => {
    if (!call || !["active", "invited"].includes(call.status)) {
      return;
    }

    let disposed = false,
      timer,
      lastPing = 0;

    async function poll() {
      try {
        if (call.status === "active" && Date.now() - lastPing > 20000) {
          await callApi.ping(call.id);
          lastPing = Date.now();
        }

        const value = await callApi.get(call.id);

        if (disposed) {
          return;
        }

        if (value.status !== call.status) {
          adopt(value);

          if (value.status === "active") {
            setStage("devices");
          } else {
            setDuration(value.durationSeconds);
            setStage(value.wasConnected ? "review" : "topics");
            setNotice(
              value.status === "rejected" ? "Lời mời đã bị từ chối." : "Cuộc gọi đã kết thúc.",
            );
          }
        }
      } catch (failure) {
        if (!disposed) {
          setError(failure.message);
        }
      }

      if (!disposed) {
        timer = setTimeout(poll, 3000);
      }
    }

    void poll();

    return () => {
      disposed = true;
      clearTimeout(timer);
    };
  }, [call, adopt, setStage]);
  useEffect(() => {
    if (stage !== "search" && stage !== "call") {
      return;
    }

    const timer = setInterval(
      () =>
        stage === "search" ? setElapsed((value) => value + 1) : setDuration((value) => value + 1),
      1000,
    );

    return () => clearInterval(timer);
  }, [stage]);
  useEffect(() => {
    clearTimeout(cleanupTimer.current);

    return () => {
      cleanupTimer.current = setTimeout(() => {
        const active = currentCall.current;

        if (active && ["active", "invited"].includes(active.status)) {
          void callApi.end(active.id).catch(() => {});
        } else {
          void callApi.cancelMatch().catch(() => {});
        }
      }, 0);
    };
  }, []);
  async function decideInvitation(action) {
    setBusy(true);

    try {
      const value = await callApi.decide(call.id, action);

      adopt(value);
      setStage(value.status === "active" ? "devices" : "topics");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitReview(review) {
    if (busy) {
      return;
    }

    setBusy(true);

    try {
      await callApi.review(call.id, {
        rating: review.rating,
        comment: [...review.tags, review.note].filter(Boolean).join(" · ").slice(0, 1000),
      });
      setStage("thanks");
    } catch (failure) {
      setNotice(failure.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmSafetyAction(reason) {
    if (safetyAction === "block") {
      await socialApi.block(call.partner.id);
      setBlocked(true);
      await endCall();
      setNotice("Đã chặn người dùng.");
    } else {
      await callApi.report(call.id, reason.trim());
      setNotice("Đã gửi báo cáo.");
    }

    closeSafetyDialog();
  }

  return {
    stage,
    call,
    busy,
    error,
    selected: call?.commonTopics?.length ? call.commonTopics : selected,
    prompt,
    mediaOptions,
    elapsed,
    duration,
    partner: call ? partnerCard(call.partner) : null,
    notice,
    dismissNotice,
    showNotice: setNotice,
    safetyAction,
    openSafetyDialog: setSafetyAction,
    closeSafetyDialog,
    confirmSafetyAction,
    isPartnerBlocked: blocked,
    setPrompt,
    search,
    showTopics,
    endCall,
    submitReview,
    decideInvitation,
    checkDevices: () => setStage("devices"),
    showMatch: () => setStage("match"),
    startCall: (options) => {
      setMediaOptions(options);
      setDuration(0);
      setStage("call");
    },
    toggleTopic: (topic) =>
      setSelected((current) =>
        current.includes(topic)
          ? current.filter((value) => value !== topic)
          : current.length < 5
            ? [...current, topic]
            : current,
      ),
    addTopic: (topic) => {
      const value = topic.trim();

      if (value && [...value].length <= 60) {
        setSelected((current) =>
          current.includes(value) || current.length >= 5 ? current : [...current, value],
        );
      }
    },
  };
}
