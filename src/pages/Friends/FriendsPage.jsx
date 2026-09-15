import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Search,
  X,
  ListFilter,
  Calendar,
  Check,
  Clock,
  UserPlus,
} from "lucide-react";

import RecentCallCard from "../../components/Friends/RecentCallCard";
import FriendListItem from "../../components/Friends/FriendListItem";
import {
  incomingScheduleRequestsData,
  incomingFriendRequestsData,
  recentCallsData,
  friendsListData,
} from "../../components/Friends/friendsData";

import "./FriendsPage.css";

const REQUEST_PREVIEW_LIMIT = 6;
const SCHEDULE_PREVIEW_LIMIT = 4;
const OTHER_TOPIC = "Khác";
const friendFilters = [
  { label: "Tất cả", value: "all" },
  { label: "Đang online", value: "online" },
  { label: "Offline", value: "offline" },
];

const FriendsPage = () => {
  const location = useLocation();
  const [searchValue, setSearchValue] = useState("");
  const [friends, setFriends] = useState(friendsListData);
  const [incomingRequests, setIncomingRequests] = useState(
    incomingFriendRequestsData
  );
  const [incomingScheduleRequests, setIncomingScheduleRequests] = useState(
    incomingScheduleRequestsData
  );
  const [requestedCallIds, setRequestedCallIds] = useState([]);
  const [requestingCallId, setRequestingCallId] = useState(null);
  const [scheduleTarget, setScheduleTarget] = useState(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleTopic, setScheduleTopic] = useState("Luyện giao tiếp cơ bản");
  const [customScheduleTopic, setCustomScheduleTopic] = useState("");
  const [scheduledSessions, setScheduledSessions] = useState([]);
  const [scheduleStep, setScheduleStep] = useState("details");
  const [showAllRequests, setShowAllRequests] = useState(false);
  const [showAllScheduleRequests, setShowAllScheduleRequests] = useState(false);
  const [friendFilter, setFriendFilter] = useState("all");
  const [isFriendFilterOpen, setIsFriendFilterOpen] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const callHistoryTriggerRef = useRef(null);

  useEffect(() => {
    if (!showCallHistory) return undefined;

    const previousOverflow = document.body.style.overflow;
    const triggerElement = callHistoryTriggerRef.current;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setShowCallHistory(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      triggerElement?.focus();
    };
  }, [showCallHistory]);

  const isFriendRequestsView = location.pathname === "/friends/friend-requests";
  const isVideoInvitesView = location.pathname === "/friends/video-call-invites";
  const isFriendsHome =
    location.pathname === "/friends" || location.pathname === "/friends/list";
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

  const handleAcceptRequest = (request) => {
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
    setIncomingRequests((prev) =>
      prev.filter((item) => item.id !== requestId)
    );
  };

  const handleAcceptScheduleRequest = (request) => {
    setScheduledSessions((prev) => [
      {
        id: `accepted-${request.id}`,
        friendName: request.name,
        friendAvatar: request.avatar,
        date: request.date,
        time: request.time,
        topic: request.topic,
        status: "Đã nhận",
      },
      ...prev,
    ]);
    setIncomingScheduleRequests((prev) =>
      prev.filter((item) => item.id !== request.id)
    );
  };

  const handleDeclineScheduleRequest = (requestId) => {
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
      setRequestedCallIds((prev) => [...prev, callId]);
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
    const finalTopic =
      scheduleTopic === OTHER_TOPIC
        ? customScheduleTopic.trim()
        : scheduleTopic;

    const newSession = {
      id: `session-${Date.now()}`,
      friendName: scheduleTarget.name,
      friendAvatar: scheduleTarget.avatar,
      date: scheduleDate,
      time: scheduleTime,
      topic: finalTopic,
      status: "Đã tạo",
    };

    setScheduledSessions((prev) => [newSession, ...prev]);
    setScheduleStep("success");
  };

  const handleCall = (friend) => {
    // TODO: điều hướng tới trang gọi video thật
    console.info(`Gọi video cho ${friend.name}`);
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

      {isFriendsHome && (
        <div className="friends-search" role="search">
          <Search
            size={17}
            strokeWidth={1.8}
            className="friends-search__icon"
          />

          <input
            type="text"
            className="friends-search__input"
            placeholder="Tìm kiếm bạn bè, số điện thoại..."
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
            aria-label="Tìm kiếm bạn bè"
          />

          {searchValue && (
            <button
              type="button"
              className="friends-search__clear"
              aria-label="Xóa tìm kiếm"
              onClick={() => setSearchValue("")}
            >
              <X size={16} strokeWidth={1.8} />
            </button>
          )}
        </div>
      )}

      {/* ================= LỜI MỜI KẾT BẠN ================= */}
      {isFriendRequestsView && (
      <section className="friends-section friends-section--requests">
        <div className="friends-section__header">
          <div>
            <h2 className="text-h2">Lời mời kết bạn</h2>
            <p className="friends-section__hint text-caption">
              Chấp nhận để thêm vào danh sách và bắt đầu luyện cùng nhau.
            </p>
          </div>

          <span className="friends-section__count text-caption">
            {incomingRequests.length} lời mời
          </span>
        </div>

        {incomingRequests.length > 0 ? (
          <div className="friend-requests">
            {visibleRequests.map((request) => (
              <article className="friend-request-card" key={request.id}>
                <div className="friend-request-card__avatar-wrap">
                  <img
                    src={request.avatar}
                    alt={request.name}
                    className="friend-request-card__avatar"
                  />
                  <span className="friend-request-card__indicator" />
                </div>

                <div className="friend-request-card__content">
                  <div>
                    <h3 className="friend-request-card__name">
                      {request.name}
                    </h3>
                    <p className="friend-request-card__meta">
                      {request.mutualFriends} bạn chung · {request.requestedAt}
                    </p>
                  </div>

                  <p className="friend-request-card__note">{request.note}</p>
                </div>

                <div className="friend-request-card__actions">
                  <button
                    type="button"
                    className="friend-request-card__accept"
                    onClick={() => handleAcceptRequest(request)}
                  >
                    <Check size={15} strokeWidth={1.8} />
                    <span>Chấp nhận</span>
                  </button>

                  <button
                    type="button"
                    className="friend-request-card__decline"
                    onClick={() => handleDeclineRequest(request.id)}
                    aria-label={`Từ chối lời mời của ${request.name}`}
                    title={`Từ chối lời mời của ${request.name}`}
                  >
                    <X size={15} strokeWidth={1.8} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="friend-requests-empty">
            <UserPlus size={18} strokeWidth={1.8} />
            <span>Hiện chưa có lời mời mới.</span>
          </div>
        )}

        {incomingRequests.length > REQUEST_PREVIEW_LIMIT && (
          <button
            type="button"
            className="friends-section__more-btn"
            onClick={() => setShowAllRequests((prev) => !prev)}
          >
            {showAllRequests
              ? "Thu gọn lời mời"
              : `Xem thêm ${hiddenRequestCount} lời mời`}
          </button>
        )}
      </section>
      )}

      {/* ================= LỜI HẸN ĐANG CHỜ ================= */}
      {isVideoInvitesView && (
      <section className="friends-section friends-section--schedule-requests">
        <div className="friends-section__header">
          <div>
            <h2 className="text-h2">Lời hẹn đang chờ</h2>
            <p className="friends-section__hint text-caption">
              Đây là nơi hiện các buổi luyện tập người khác hẹn với bạn.
            </p>
          </div>

          <span className="friends-section__count text-caption">
            {incomingScheduleRequests.length} lời hẹn
          </span>
        </div>

        {incomingScheduleRequests.length > 0 ? (
          <div className="schedule-request-list">
            {visibleScheduleRequests.map((request) => (
              <article className="schedule-request-card" key={request.id}>
                <img
                  src={request.avatar}
                  alt={request.name}
                  className="schedule-request-card__avatar"
                />

                <div className="schedule-request-card__content">
                  <p className="schedule-request-card__title">
                    {request.name} muốn hẹn lịch
                  </p>
                  <p className="schedule-request-card__meta">
                    {request.date} lúc {request.time} · {request.topic}
                  </p>
                </div>

                <div className="schedule-request-card__actions">
                  <button
                    type="button"
                    className="schedule-request-card__accept"
                    onClick={() => handleAcceptScheduleRequest(request)}
                  >
                    <Check size={15} strokeWidth={1.8} />
                    <span>Nhận lịch</span>
                  </button>

                  <button
                    type="button"
                    className="schedule-request-card__decline"
                    onClick={() => handleDeclineScheduleRequest(request.id)}
                    aria-label={`Từ chối lời hẹn của ${request.name}`}
                    title={`Từ chối lời hẹn của ${request.name}`}
                  >
                    <X size={15} strokeWidth={1.8} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="friend-requests-empty">
            <Calendar size={18} strokeWidth={1.8} />
            <span>Chưa có lời hẹn nào cần phản hồi.</span>
          </div>
        )}

        {incomingScheduleRequests.length > SCHEDULE_PREVIEW_LIMIT && (
          <button
            type="button"
            className="friends-section__more-btn"
            onClick={() => setShowAllScheduleRequests((prev) => !prev)}
          >
            {showAllScheduleRequests
              ? "Thu gọn lời hẹn"
              : `Xem thêm ${hiddenScheduleRequestCount} lời hẹn`}
          </button>
        )}
      </section>
      )}

      {(isFriendsHome || isVideoInvitesView) && scheduledSessions.length > 0 && (
        <section className="friends-section friends-section--scheduled">
          <div className="friends-section__header">
            <div>
              <h2 className="text-h2">Lịch đã hẹn</h2>
              <p className="friends-section__hint text-caption">
                Các buổi luyện tập đang chờ xác nhận trong prototype.
              </p>
            </div>
          </div>

          <div className="scheduled-sessions">
            {scheduledSessions.map((session) => (
              <article className="scheduled-session" key={session.id}>
                <img
                  src={session.friendAvatar}
                  alt={session.friendName}
                  className="scheduled-session__avatar"
                />

                <div className="scheduled-session__content">
                  <p className="scheduled-session__title">
                    {session.friendName}
                  </p>
                  <p className="scheduled-session__meta">
                    {session.date} lúc {session.time} · {session.topic}
                  </p>
                </div>

                <span className="scheduled-session__badge">
                  {session.status}
                </span>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ================= CUỘC GỌI GẦN ĐÂY ================= */}
      {isFriendsHome && (
      <section className="friends-section friends-section--recent">
        <div className="friends-section__header">
          <div>
            <h2 className="text-h2">Cuộc gọi gần đây</h2>
            <p className="friends-section__hint text-caption">
              Những người bạn đã trò chuyện nhưng chưa kết bạn.
            </p>
          </div>

          <div className="friends-section__actions">
            <button
              type="button"
              className="friends-section__link"
              ref={callHistoryTriggerRef}
              aria-haspopup="dialog"
              onClick={() => setShowCallHistory(true)}
            >
              Xem tất cả
            </button>
          </div>
        </div>

        <div className="friends-recent-calls">
          {recentConversationCalls.slice(0, 4).map((call) => (
            <RecentCallCard
              key={call.id}
              call={call}
              onAddFriend={handleAddFriend}
              isRequesting={requestingCallId === call.id}
              isRequested={requestedCallIds.includes(call.id)}
            />
          ))}
        </div>

        {showCallHistory && (
          <div
            className="call-history-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="call-history-title"
          >
            <button
              type="button"
              className="call-history-modal__backdrop"
              aria-label="Đóng lịch sử cuộc gọi"
              onClick={() => setShowCallHistory(false)}
            />

            <div className="call-history-modal__panel">
              <div className="call-history-modal__header">
                <div className="call-history-modal__heading">
                  <span className="call-history-modal__icon">
                    <Clock size={18} strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 id="call-history-title">Người đã trò chuyện gần đây</h3>
                    <p>Những người bạn đã trò chuyện và có thể muốn kết nối lại.</p>
                  </div>
                </div>

                <div className="call-history-modal__controls">
                  <span>{recentConversationCalls.length} người</span>
                  <button
                    type="button"
                    className="call-history-modal__close"
                    aria-label="Đóng lịch sử cuộc gọi"
                    title="Đóng"
                    autoFocus
                    onClick={() => setShowCallHistory(false)}
                  >
                    <X size={18} strokeWidth={1.8} />
                  </button>
                </div>
              </div>

              <div className="call-history-list">
                {recentConversationCalls.map((call) => {
                  const isRequested = requestedCallIds.includes(call.id);
                  const isRequesting = requestingCallId === call.id;

                  return (
                  <article className="call-history-item" key={`history-${call.id}`}>
                    <img
                      src={call.avatar}
                      alt={call.name}
                      className="call-history-item__avatar"
                    />

                    <div className="call-history-item__content">
                      <p className="call-history-item__name">{call.name}</p>
                      <p className="call-history-item__meta">
                        {call.day} · {call.date} lúc {call.time}
                      </p>
                    </div>

                    <div className="call-history-item__detail">
                      <span>Đã trò chuyện</span>
                      <span>{call.duration}</span>
                    </div>

                    <button
                      type="button"
                      className={`call-history-item__action ${
                        isRequested ? "call-history-item__action--sent" : ""
                      }`}
                      disabled={isRequested || isRequesting}
                      onClick={() => handleAddFriend(call.id)}
                    >
                      <UserPlus size={16} strokeWidth={1.8} />
                      <span>
                        {isRequesting
                          ? "Đang gửi..."
                          : isRequested
                            ? "Đã gửi"
                            : "Kết bạn"}
                      </span>
                    </button>
                  </article>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>
      )}

      {/* ================= DANH SÁCH BẠN BÈ ================= */}
      {isFriendsHome && (
      <section className="friends-section friends-section--list">
        <div className="friends-section__header">
          <h2 className="text-h2">Danh sách bạn bè</h2>

          <div className="friends-section__meta">
            <span className="friends-section__count text-caption">
              {filteredFriends.length} bạn bè · {selectedFriendFilterLabel}
            </span>

            <div className="friends-filter">
              <button
                type="button"
                className={`friends-section__filter-btn ${
                  friendFilter !== "all" ? "friends-section__filter-btn--active" : ""
                }`}
                aria-label="Lọc danh sách bạn bè"
                title="Lọc danh sách bạn bè"
                aria-expanded={isFriendFilterOpen}
                onClick={() => setIsFriendFilterOpen((prev) => !prev)}
              >
                <ListFilter size={16} strokeWidth={1.8} />
              </button>

              {isFriendFilterOpen && (
                <div className="friends-filter__menu" role="menu">
                  {friendFilters.map((filter) => (
                    <button
                      type="button"
                      className={`friends-filter__item ${
                        friendFilter === filter.value
                          ? "friends-filter__item--active"
                          : ""
                      }`}
                      key={filter.value}
                      onClick={() => {
                        setFriendFilter(filter.value);
                        setIsFriendFilterOpen(false);
                      }}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="friends-list">
          {filteredFriends.length === 0 ? (
            <div className="friends-list__empty">
              <div className="friends-list__empty-icon">
                <Search size={22} strokeWidth={1.8} />
              </div>
              <p className="friends-list__empty-title">Không tìm thấy kết nối phù hợp</p>
              <p className="friends-list__empty-text text-caption">
                Thử tìm bằng tên ngắn hơn hoặc kiểm tra lại số điện thoại.
              </p>
              <button
                type="button"
                className="friends-list__empty-action"
                onClick={() => setSearchValue("")}
              >
                Xóa tìm kiếm
              </button>
            </div>
          ) : (
            filteredFriends.map((friend) => (
              <FriendListItem
                key={friend.id}
                friend={friend}
                onSchedule={handleSchedule}
                onCall={handleCall}
              />
            ))
          )}
        </div>
      </section>
      )}

      {scheduleTarget && (
        <div
          className="schedule-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-modal-title"
        >
          <div className="schedule-modal__backdrop" onClick={closeScheduleFlow} />

          <div className="schedule-modal__panel">
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

                <h2 id="schedule-modal-title" className="schedule-modal__title">
                  Đã tạo lịch hẹn
                </h2>
                <p className="schedule-modal__text">
                  Buổi luyện với {scheduleTarget.name} đã được thêm vào mục Lịch đã hẹn.
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
                    <h2 id="schedule-modal-title" className="schedule-modal__title">
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
                      type="date"
                      value={scheduleDate}
                      onChange={(event) => setScheduleDate(event.target.value)}
                      required
                    />
                  </label>

                  <label className="schedule-form__field">
                    <span>Giờ bắt đầu</span>
                    <input
                      type="time"
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
                      Sau khi tạo lịch, buổi hẹn sẽ xuất hiện trong trang Bạn bè.
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
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
