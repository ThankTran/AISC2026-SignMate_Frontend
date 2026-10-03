import { socialApi } from '../../services/api';
import { useSearchParams } from "react-router-dom";
import { useFriends } from "../useFriends";
import { VIDEO_DEMO } from "../../services/videoCall/config";
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

export function useDemoVideoCallFlow() {
  const [params, setParams] = useSearchParams();
  const {friends} = useFriends();
  const stages = ['topics','search','match','devices','call','review','thanks'];
  const requested = params.get('step');
  const directFriend = friends.find(friend => String(friend.id) === params.get('friend'));
  const stage = stages.includes(requested) ? requested : directFriend ? 'devices' : 'topics';
  const setStage = useCallback(next => setParams(previous => { const updated = new URLSearchParams(previous); updated.set('step',next); return updated; }),[setParams]);
  const [mediaOptions,setMediaOptions] = useState({});
  const [selected, setSelected] = useState(defaultTopics);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [partnerIndex, setPartnerIndex] = useState(0);
  const [blockedIds, setBlockedIds] = useState([]);
  const [notice, setNotice] = useState("");
  const [safetyAction, setSafetyAction] = useState(null);
  const partner = directFriend || demoPartners[partnerIndex];
  const closeSafetyDialog = useCallback(() => setSafetyAction(null), [setSafetyAction]);
  const dismissNotice = useCallback(() => setNotice(""), [setNotice]);

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
  }, [stage, setStage]);

  function search(findAnother = false) {
    const index = findAvailablePartner(
      demoPartners,
      partnerIndex,
      blockedIds,
      findAnother,
    );
    if (index < 0) {
      setNotice(
        VIDEO_DEMO ? "Bạn đã chặn tất cả hồ sơ demo. Tải lại trang để bắt đầu phiên demo mới." : "Hiện chưa có đối tác khả dụng.",
      );
      return;
    }
    setPartnerIndex(index);
    setElapsed(0);
    setStage("search");
  }

  function startCall(options) {
    setMediaOptions(options);
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

  async function confirmSafetyAction(reason) {
    if (safetyAction === "block") {
      if(import.meta.env.VITE_USE_MOCK!=='true')await socialApi.block(partner.id);
      setBlockedIds((current) => [...new Set([...current, partner.id])]);
      if (stage === "call") setStage("review");
      setNotice(import.meta.env.VITE_USE_MOCK==='true' ? "Đã chặn hồ sơ trong phiên demo." : "Đã chặn người dùng.");
    } else {
      if (!reason.trim()) return;
      if (!saveCallReport({ partner: partner.name, reason: reason.trim() })) {
        setNotice(
          "Không thể lưu báo cáo. Vui lòng kiểm tra quyền lưu trữ của trình duyệt và thử lại.",
        );
        return;
      }
      setNotice(VIDEO_DEMO ? "Đã lưu báo cáo demo trên trình duyệt." : "Đã lưu báo cáo trên trình duyệt.");
    }
    closeSafetyDialog();
  }

  return {
    stage,
    mediaOptions,
    checkDevices: () => setStage("devices"),
    showMatch: () => setStage("match"),
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
