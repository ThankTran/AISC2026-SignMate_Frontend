import DataState from "../../components/ui/DataState";
import { useFriends } from "../../hooks/useFriends";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../hooks/useToast";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Calendar,
  Check,
  Clock,
  Plus,
} from "lucide-react";

import {
  recentCallsData,
} from "../../mockdata";
import {
  REQUEST_PREVIEW_LIMIT,
  SCHEDULE_PREVIEW_LIMIT,
  OTHER_TOPIC,
  friendFilters,
  calendarMonthNames,
  formatDateKey,
} from "./friendsPageConfig";

import "./FriendsPage.css";

const FriendsWorkspace = ({ view = "list", Content }) => {
  const toast = useToast();
  const { status,error,retry,friends,setFriends,incomingRequests,setIncomingRequests,incomingScheduleRequests,setIncomingScheduleRequests,scheduledSessions,setScheduledSessions,sentRequests:requestedCallIds,addFriend } = useFriends();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [requestingCallId, setRequestingCallId] = useState(null);
  const [scheduleTarget, setScheduleTarget] = useState(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleTopic, setScheduleTopic] = useState("Luyện giao tiếp cơ bản");
  const [customScheduleTopic, setCustomScheduleTopic] = useState("");
  const [scheduleStep, setScheduleStep] = useState("details");
  const [showAllRequests, setShowAllRequests] = useState(false);
  const [showAllScheduleRequests, setShowAllScheduleRequests] = useState(false);
  const [friendFilter, setFriendFilter] = useState("all");
  const [isFriendFilterOpen, setIsFriendFilterOpen] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [calendarMonthDate, setCalendarMonthDate] = useState(
    new Date()
  );
  const [quickInviteDate, setQuickInviteDate] = useState("");
  const [quickInviteFriendId, setQuickInviteFriendId] = useState(
    friends[0]?.id || ""
  );
  const [quickInviteTime, setQuickInviteTime] = useState("19:30");
  const [quickInviteTopic, setQuickInviteTopic] = useState(
    "Luyện giao tiếp cơ bản"
  );
  const callHistoryTriggerRef = useRef(null);

  const filterRef = useRef(null);
  const [visibleFriendCount, setVisibleFriendCount] = useState(8);
  useEffect(() => {
    if (!isFriendFilterOpen) return;
    const close = event => { if (event.key === 'Escape') { setIsFriendFilterOpen(false); filterRef.current?.querySelector('button')?.focus(); } else if (event.type === 'pointerdown' && !filterRef.current?.contains(event.target)) setIsFriendFilterOpen(false); };
    document.addEventListener('pointerdown', close); document.addEventListener('keydown', close);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', close); };
  }, [isFriendFilterOpen]);
  function validateSchedule(date, time) {
    if (!date || !time || new Date(`${date}T${time}`).getTime() <= new Date().getTime()) { toast({type:'error',message:'Vui lòng chọn thời gian trong tương lai.'}); return false; }
    if (scheduledSessions.some(item => item.date === date && Math.abs(new Date(`${item.date}T${item.time}`).getTime() - new Date(`${date}T${time}`).getTime()) < 30 * 60 * 1000)) { toast({type:'error',message:'Lịch hẹn trùng với buổi khác. Hãy chọn cách nhau ít nhất 30 phút.'}); return false; }
    return true;
  }
  const today = formatDateKey(new Date());
  const minTime = `${String(new Date().getHours()).padStart(2,'0')}:${String(new Date().getMinutes()).padStart(2,'0')}`;

  const isFriendRequestsView = view === "requests";
  const isVideoInvitesView = view === "invites";
  const isFriendsHome =
    view === "list";
  const pageTitle = isFriendRequestsView
    ? "Lời mời kết bạn"
    : isVideoInvitesView
    ? "Lời mời hẹn video call"
    : "Danh sách bạn bè";
  const pageSubtitle = isFriendRequestsView
    ? "Duyệt các kết nối mới đang chờ phản hồi"
    : isVideoInvitesView
    ? "Quản lý lời hẹn luyện tập từ bạn bè"
    : "Tìm bạn, xem hoạt động gần đây và bắt đầu một buổi luyện tập";

  // ===== Lọc danh sách bạn bè theo tên =====
  const filteredFriends = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    const byStatus = friends.filter((friend) => {
      if (friendFilter === "online") return friend.isOnline;
      if (friendFilter === "offline") return !friend.isOnline;
      return true;
    });

    if (!keyword) return byStatus;

    return byStatus.filter((friend) =>
      friend.name.toLowerCase().includes(keyword)
    );
  }, [friendFilter, friends, searchValue]);

  const visibleRequests = showAllRequests
    ? incomingRequests
    : incomingRequests.slice(0, REQUEST_PREVIEW_LIMIT);

  const hiddenRequestCount = Math.max(
    incomingRequests.length - visibleRequests.length,
    0
  );

  const visibleScheduleRequests = showAllScheduleRequests
    ? incomingScheduleRequests
    : incomingScheduleRequests.slice(0, SCHEDULE_PREVIEW_LIMIT);

  const hiddenScheduleRequestCount = Math.max(
    incomingScheduleRequests.length - visibleScheduleRequests.length,
    0
  );

  const selectedFriendFilterLabel =
    friendFilters.find((filter) => filter.value === friendFilter)?.label ||
    "Tất cả";

  const recentConversationCalls = useMemo(
    () =>
      recentCallsData.filter(
        (call) =>
          !call.isFriend &&
          call.wasConnected &&
          !friends.some((friend) => friend.name === call.name)
      ),
    [friends]
  );

  const calendarAppointments = useMemo(() => {
    const upcomingSessions = scheduledSessions.map((session) => ({
      id: session.id,
      name: session.friendName,
      avatar: session.friendAvatar,
      date: session.date,
      time: session.time,
      topic: session.topic,
      status: session.status,
      type: "upcoming",
    }));

    const pendingRequests = incomingScheduleRequests.map((request) => ({
      id: request.id,
      name: request.name,
      avatar: request.avatar,
      date: request.date,
      time: request.time,
      topic: request.topic,
      status: "Đang chờ",
      type: "pending",
    }));

    return [...upcomingSessions, ...pendingRequests].sort((a, b) =>
      `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
    );
  }, [incomingScheduleRequests, scheduledSessions]);

  const calendarAppointmentsByDate = useMemo(
    () =>
      calendarAppointments.reduce((groupedAppointments, appointment) => {
        return {
          ...groupedAppointments,
          [appointment.date]: [
            ...(groupedAppointments[appointment.date] || []),
            appointment,
          ],
        };
      }, {}),
    [calendarAppointments]
  );

  const calendarTitle = `${calendarMonthNames[calendarMonthDate.getMonth()]} ${calendarMonthDate.getFullYear()}`;

  const calendarMonthDays = useMemo(() => {
    const firstDayOfMonth = new Date(
      calendarMonthDate.getFullYear(),
      calendarMonthDate.getMonth(),
      1
    );
    const firstCalendarDay = new Date(firstDayOfMonth);
    firstCalendarDay.setDate(
      firstDayOfMonth.getDate() - (firstDayOfMonth.getDay() + 6) % 7
    );

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(firstCalendarDay);
      date.setDate(firstCalendarDay.getDate() + index);

      return {
        dateKey: formatDateKey(date),
        dayNumber: date.getDate(),
        isCurrentMonth:
          date.getMonth() === calendarMonthDate.getMonth() &&
          date.getFullYear() === calendarMonthDate.getFullYear(),
        isToday: formatDateKey(date) === formatDateKey(new Date()),
      };
    });
  }, [calendarMonthDate]);

  const goToPreviousMonth = () => {
    setCalendarMonthDate(
      (currentDate) =>
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCalendarMonthDate(
      (currentDate) =>
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToTodayMonth = () => {
    setCalendarMonthDate(new Date());
  };

  const openQuickInvite = (dateKey) => {
    setQuickInviteDate(dateKey);
    setQuickInviteFriendId(friends[0]?.id || "");
    setQuickInviteTime("19:30");
    setQuickInviteTopic("Luyện giao tiếp cơ bản");
  };

  const closeQuickInvite = () => {
    setQuickInviteDate("");
  };

  const handleQuickInviteSubmit = (event) => {
    event.preventDefault();

    const selectedFriend = friends.find(
      (friend) => friend.id === quickInviteFriendId
    );

    if (!selectedFriend || !validateSchedule(quickInviteDate, quickInviteTime)) return;

    setScheduledSessions((prev) => [
      {
        id: `quick-session-${new Date().getTime()}`,
        friendName: selectedFriend.name,
        friendAvatar: selectedFriend.avatar,
        date: quickInviteDate,
        time: quickInviteTime,
        topic: quickInviteTopic.trim() || "Luyện giao tiếp cơ bản",
        status: "Đợi xác nhận",
      },
      ...prev,
    ]);
    toast({ type: 'success', message: 'Đã gửi lời mời lịch hẹn.' });
    closeQuickInvite();
  };

  const handleAcceptRequest = (request) => {
    toast({ type: 'success', message: `Đã chấp nhận kết bạn với ${request.name}.`, undo: () => {
      setFriends(prev => prev.filter(item => item.id !== `friend-${request.id}`));
      setIncomingRequests(prev => prev.some(item => item.id === request.id) ? prev : [request, ...prev]);
    } });
    setFriends((prev) => [
      {
        id: `friend-${request.id}`,
        name: request.name,
        avatar: request.avatar,
        isOnline: request.isOnline,
        statusText: request.statusText,
      },
      ...prev,
    ]);
    setIncomingRequests((prev) =>
      prev.filter((item) => item.id !== request.id)
    );
  };

  const handleDeclineRequest = (requestId) => {
    const request = incomingRequests.find(item => item.id === requestId);
    toast({ type: 'info', message: 'Đã từ chối lời mời kết bạn.', undo: () => { if (request) setIncomingRequests(prev => prev.some(item => item.id === requestId) ? prev : [request, ...prev]); } });
    setIncomingRequests((prev) =>
      prev.filter((item) => item.id !== requestId)
    );
  };

  const handleAcceptScheduleRequest = (request) => {
    if (!validateSchedule(request.date, request.time)) return;
    toast({ type: 'success', message: 'Đã chấp nhận lịch hẹn.' });
    setScheduledSessions((prev) => [
      {
        id: `accepted-${request.id}`,
        friendName: request.name,
        friendAvatar: request.avatar,
        date: request.date,
        time: request.time,
        topic: request.topic,
        status: "Sắp diễn ra",
      },
      ...prev,
    ]);
    setIncomingScheduleRequests((prev) =>
      prev.filter((item) => item.id !== request.id)
    );
  };

  const handleDeclineScheduleRequest = (requestId) => {
    const request = incomingScheduleRequests.find(item => item.id === requestId);
    toast({ type: 'info', message: 'Đã từ chối lịch hẹn.', undo: () => { if (request) setIncomingScheduleRequests(prev => prev.some(item => item.id === requestId) ? prev : [request,...prev]); } });
    setIncomingScheduleRequests((prev) =>
      prev.filter((item) => item.id !== requestId)
    );
  };

  // ===== Gửi lời mời kết bạn từ card cuộc gọi gần đây =====
  const handleAddFriend = (callId) => {
    if (requestingCallId || requestedCallIds.includes(callId)) return;

    setRequestingCallId(callId);

    // TODO: gọi API gửi lời mời kết bạn thật tại đây
    setTimeout(() => {
      toast({ type: 'success', message: 'Đã gửi lời mời kết bạn.' });
      addFriend(callId);
      setRequestingCallId(null);
    }, 500);
  };

  const handleSchedule = (friend) => {
    setScheduleTarget(friend);
    setScheduleDate("");
    setScheduleTime("");
    setScheduleTopic("Luyện giao tiếp cơ bản");
    setCustomScheduleTopic("");
    setScheduleStep("details");
  };

  const closeScheduleFlow = () => {
    setScheduleTarget(null);
  };

  const handleScheduleSubmit = (event) => {
    event.preventDefault();
    if (!validateSchedule(scheduleDate, scheduleTime)) return;
    const finalTopic =
      scheduleTopic === OTHER_TOPIC
        ? customScheduleTopic.trim()
        : scheduleTopic;

    const newSession = {
      id: `session-${new Date().getTime()}`,
      friendName: scheduleTarget.name,
      friendAvatar: scheduleTarget.avatar,
      date: scheduleDate,
      time: scheduleTime,
      topic: finalTopic,
      status: "Đợi xác nhận",
    };

    setScheduledSessions((prev) => [newSession, ...prev]);
    setScheduleStep("success");
    toast({ type: 'success', message: 'Đã gửi lời mời lịch hẹn.' });
  };

  const handleCall = (friend) => {
    if (friend.isOnline) navigate(`/video?friend=${encodeURIComponent(friend.id)}`);
  };

  return (
    <div className="friends-page">
      <div className="friends-page__header">
        <h1 id="friends-page-title" className="friends-page__title text-h1">
          {pageTitle}
        </h1>
        <p className="friends-page__subtitle text-caption">
          {pageSubtitle}
        </p>
      </div>

      <DataState status={status} error={error} retry={retry}><Content {...{searchValue,setSearchValue,isFriendsHome,callHistoryTriggerRef,setShowCallHistory,recentConversationCalls,handleAddFriend,requestingCallId,requestedCallIds,showCallHistory,filteredFriends,selectedFriendFilterLabel,friendFilter,filterRef,isFriendFilterOpen,setIsFriendFilterOpen,setFriendFilter,visibleFriendCount,setVisibleFriendCount,handleSchedule,handleCall,isFriendRequestsView,incomingRequests,visibleRequests,handleAcceptRequest,handleDeclineRequest,showAllRequests,setShowAllRequests,hiddenRequestCount,isVideoInvitesView,incomingScheduleRequests,visibleScheduleRequests,handleAcceptScheduleRequest,handleDeclineScheduleRequest,showAllScheduleRequests,setShowAllScheduleRequests,hiddenScheduleRequestCount,calendarAppointments,calendarTitle,calendarMonthDays,calendarAppointmentsByDate,goToPreviousMonth,goToNextMonth,goToTodayMonth,openQuickInvite}} /></DataState>
      {quickInviteDate && (
        <Modal className="schedule-modal__panel" labelledBy="quick-invite-title" onClose={closeQuickInvite}>
            <button
              type="button"
              className="schedule-modal__close"
              onClick={closeQuickInvite}
              aria-label="Đóng mời call"
            >
              <X size={17} strokeWidth={1.8} />
            </button>

            <div className="schedule-modal__header">
              <div className="schedule-modal__calendar-icon">
                <Plus size={20} strokeWidth={2} />
              </div>
              <div>
                <p className="schedule-modal__eyebrow">Mời hẹn video call</p>
                <h2 id="quick-invite-title" className="schedule-modal__title text-h2">
                  Ngày {quickInviteDate}
                </h2>
              </div>
            </div>

            <form className="schedule-form" onSubmit={handleQuickInviteSubmit}>
              <label className="schedule-form__field schedule-form__field--full">
                <span>Chọn bạn bè</span>
                <select
                  value={quickInviteFriendId}
                  onChange={(event) =>
                    setQuickInviteFriendId(event.target.value)
                  }
                  required
                >
                  {friends.map((friend) => (
                    <option key={friend.id} value={friend.id}>
                      {friend.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="schedule-form__field">
                <span>Giờ bắt đầu</span>
                <input
                  type="time"
                  min={quickInviteDate === today ? minTime : undefined}
                  value={quickInviteTime}
                  onChange={(event) => setQuickInviteTime(event.target.value)}
                  required
                />
              </label>

              <label className="schedule-form__field">
                <span>Chủ đề</span>
                <input
                  type="text"
                  value={quickInviteTopic}
                  onChange={(event) => setQuickInviteTopic(event.target.value)}
                  placeholder="Ví dụ: Luyện phản xạ video call"
                  required
                />
              </label>

              <div className="schedule-form__summary">
                <Calendar size={16} strokeWidth={1.8} />
                <span>
                  Lời mời sẽ được thêm vào lịch của bạn với trạng thái đợi xác nhận.
                </span>
              </div>

              <div className="schedule-form__actions">
                <button
                  type="button"
                  className="schedule-modal__secondary"
                  onClick={closeQuickInvite}
                >
                  Hủy
                </button>
                <button type="submit" className="schedule-modal__primary">
                  <Plus size={15} strokeWidth={2} />
                  <span>Mời call</span>
                </button>
              </div>
            </form>
</Modal>
      )}

      {scheduleTarget && (
        <Modal className="schedule-modal__panel" labelledBy="schedule-modal-title" onClose={closeScheduleFlow}>
            <button
              type="button"
              className="schedule-modal__close"
              onClick={closeScheduleFlow}
              aria-label="Đóng hẹn lịch"
            >
              <X size={17} strokeWidth={1.8} />
            </button>

            {scheduleStep === "success" ? (
              <div className="schedule-success">
                <div className="schedule-success__icon">
                  <Check size={24} strokeWidth={2} />
                </div>

                <h2 id="schedule-modal-title" className="schedule-modal__title text-h2">
                  Đã tạo lịch hẹn
                </h2>
                <p className="schedule-modal__text">
                  Buổi luyện với {scheduleTarget.name} đã được thêm vào lịch hẹn luyện tập.
                </p>

                <button
                  type="button"
                  className="schedule-modal__primary"
                  onClick={closeScheduleFlow}
                >
                  Hoàn tất
                </button>
              </div>
            ) : (
              <>
                <div className="schedule-modal__header">
                  <img
                    src={scheduleTarget.avatar}
                    alt={scheduleTarget.name}
                    className="schedule-modal__avatar"
                  />
                  <div>
                    <p className="schedule-modal__eyebrow">Hẹn lịch luyện tập</p>
                    <h2 id="schedule-modal-title" className="schedule-modal__title text-h2">
                      Với {scheduleTarget.name}
                    </h2>
                  </div>
                </div>

                <form
                  className="schedule-form"
                  onSubmit={handleScheduleSubmit}
                >
                  <label className="schedule-form__field">
                    <span>Ngày luyện</span>
                    <input
                      type="date" min={today}
                      value={scheduleDate}
                      onChange={(event) => setScheduleDate(event.target.value)}
                      required
                    />
                  </label>

                  <label className="schedule-form__field">
                    <span>Giờ bắt đầu</span>
                    <input
                      type="time"
                      min={scheduleDate === today ? minTime : undefined}
                      value={scheduleTime}
                      onChange={(event) => setScheduleTime(event.target.value)}
                      required
                    />
                  </label>

                  <label className="schedule-form__field schedule-form__field--full">
                    <span>Chủ đề</span>
                    <select
                      value={scheduleTopic}
                      onChange={(event) => {
                        setScheduleTopic(event.target.value);
                        if (event.target.value !== OTHER_TOPIC) {
                          setCustomScheduleTopic("");
                        }
                      }}
                    >
                      <option>Luyện giao tiếp cơ bản</option>
                      <option>Ôn bảng chữ cái ký hiệu</option>
                      <option>Chuẩn bị cuộc gọi video</option>
                      <option>Luyện phản xạ với AI</option>
                      <option>{OTHER_TOPIC}</option>
                    </select>
                  </label>

                  {scheduleTopic === OTHER_TOPIC && (
                    <label className="schedule-form__field schedule-form__field--full">
                      <span>Nhập chủ đề khác</span>
                      <input
                        type="text"
                        value={customScheduleTopic}
                        onChange={(event) =>
                          setCustomScheduleTopic(event.target.value)
                        }
                        placeholder="Ví dụ: Luyện ký hiệu trong bệnh viện"
                        required
                      />
                    </label>
                  )}

                  <div className="schedule-form__summary">
                    <Clock size={16} strokeWidth={1.8} />
                    <span>
                      Sau khi tạo lịch, buổi hẹn sẽ xuất hiện trong trang lời mời hẹn video call.
                    </span>
                  </div>

                  <div className="schedule-form__actions">
                    <button
                      type="button"
                      className="schedule-modal__secondary"
                      onClick={closeScheduleFlow}
                    >
                      Hủy
                    </button>
                    <button type="submit" className="schedule-modal__primary">
                      <Calendar size={15} strokeWidth={1.8} />
                      <span>Tạo lịch hẹn</span>
                    </button>
                  </div>
                </form>
              </>
            )}
</Modal>
      )}
    </div>
  );
};

export default FriendsWorkspace;
