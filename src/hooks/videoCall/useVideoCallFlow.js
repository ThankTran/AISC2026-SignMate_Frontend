import { useCallback, useEffect, useState } from "react";
import { demoPartners } from "../../mockdata/videoCall/partners";
import { defaultPrompt, defaultTopics } from "../../mockdata/videoCall/topics";
import {
  findAvailablePartner,
  toggleSelection,
} from "../../utils/videoCall/selection";
import {
  saveCallReport,
  saveCallReview,
} from "../../services/videoCall/demoSessionStorage";

const MATCHING_DELAY_MS = 5200;

export function useVideoCallFlow() {
  const [stage, setStage] = useState("topics");
  const [selected, setSelected] = useState(defaultTopics);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [partnerIndex, setPartnerIndex] = useState(0);
  const [blockedIds, setBlockedIds] = useState([]);
  const [notice, setNotice] = useState("");
  const [safetyAction, setSafetyAction] = useState(null);
  const partner = demoPartners[partnerIndex];
  const closeSafetyDialog = useCallback(() => setSafetyAction(null), []);
  const dismissNotice = useCallback(() => setNotice(""), []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [stage]);

  useEffect(() => {
    if (stage !== "search" && stage !== "call") return;
    const increment = stage === "search" ? setElapsed : setDuration;
    const timer = setInterval(() => increment((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "search") return;
    const timer = setTimeout(() => setStage("match"), MATCHING_DELAY_MS);
    return () => clearTimeout(timer);
  }, [stage]);

  function search(findAnother = false) {
    const index = findAvailablePartner(
      demoPartners,
      partnerIndex,
      blockedIds,
      findAnother,
    );
    if (index < 0) {
      setNotice(
        "Bạn đã chặn tất cả hồ sơ demo. Tải lại trang để bắt đầu phiên demo mới.",
      );
      return;
    }
    setPartnerIndex(index);
    setElapsed(0);
    setStage("search");
  }

  function startCall() {
    setDuration(0);
    setStage("call");
  }

  function addTopic(topic) {
    const value = topic.trim();
    if (value)
      setSelected((current) =>
        current.includes(value) ? current : [...current, value],
      );
  }

  function submitReview(review) {
    const saved = saveCallReview({
      partner: partner.name,
      ...review,
      duration,
    });
    if (!saved) {
      setNotice(
        "Không thể lưu đánh giá. Vui lòng kiểm tra quyền lưu trữ của trình duyệt và thử lại.",
      );
      return;
    }
    setStage("thanks");
  }

  function confirmSafetyAction(reason) {
    if (safetyAction === "block") {
      setBlockedIds((current) => [...new Set([...current, partner.id])]);
      if (stage === "call") setStage("review");
      setNotice("Đã chặn hồ sơ trong phiên demo.");
    } else {
      if (!reason.trim()) return;
      if (!saveCallReport({ partner: partner.name, reason: reason.trim() })) {
        setNotice(
          "Không thể lưu báo cáo. Vui lòng kiểm tra quyền lưu trữ của trình duyệt và thử lại.",
        );
        return;
      }
      setNotice("Đã lưu báo cáo demo trên trình duyệt.");
    }
    closeSafetyDialog();
  }

  return {
    stage,
    selected,
    prompt,
    elapsed,
    duration,
    partner,
    notice,
    safetyAction,
    isPartnerBlocked: blockedIds.includes(partner.id),
    setPrompt,
    showNotice: setNotice,
    dismissNotice,
    openSafetyDialog: setSafetyAction,
    closeSafetyDialog,
    confirmSafetyAction,
    toggleTopic: (topic) =>
      setSelected((current) => toggleSelection(current, topic)),
    addTopic,
    search,
    startCall,
    endCall: () => setStage("review"),
    showTopics: () => setStage("topics"),
    submitReview,
  };
}
