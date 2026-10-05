import EmptyState from "../../components/ui/EmptyState";
import { useState } from "react";
import CallInvitations from "../../components/VideoCall/CallInvitations";
import FriendsWorkspace from "./FriendsWorkspace";
import { X, Check, Video, CalendarDays } from "lucide-react";
import MonthCalendar from "../../components/Friends/MonthCalendar";
import { SCHEDULE_PREVIEW_LIMIT } from "./friendsPageConfig";
function Content({
  isVideoInvitesView,
  incomingScheduleRequests,
  visibleScheduleRequests,
  handleAcceptScheduleRequest,
  handleDeclineScheduleRequest,
  showAllScheduleRequests,
  setShowAllScheduleRequests,
  hiddenScheduleRequestCount,
  calendarAppointments,
  calendarTitle,
  calendarMonthDays,
  calendarAppointmentsByDate,
  goToPreviousMonth,
  goToNextMonth,
  goToTodayMonth,
  openQuickInvite,
}) {
  const [tab, setTab] = useState("instant");
  const tabs = [
    { id: "instant", label: "Gọi ngay", Icon: Video },
    { id: "schedule", label: "Hẹn lịch", Icon: CalendarDays },
  ];

  return (
    <div className="video-invites">
      <div className="video-invites__tabs" role="tablist" aria-label="Loại lời mời">
        {tabs.map(({ id, label, Icon }, index) => (
          <button
            key={id}
            id={`invites-tab-${id}`}
            role="tab"
            aria-selected={tab === id}
            aria-controls={`invites-panel-${id}`}
            tabIndex={tab === id ? 0 : -1}
            onClick={() => setTab(id)}
            onKeyDown={(event) => {
              let target;

              if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
                target = tabs[1 - index].id;
              } else if (event.key === "Home") {
                target = tabs[0].id;
              } else if (event.key === "End") {
                target = tabs[1].id;
              }

              if (target) {
                event.preventDefault();
                setTab(target);
                document.getElementById(`invites-tab-${target}`)?.focus();
              }
            }}
          >
            <Icon size={18} />
            {label}
            {id === "schedule" && incomingScheduleRequests.length > 0 && (
              <span>{incomingScheduleRequests.length}</span>
            )}
          </button>
        ))}
      </div>
      <div
        id="invites-panel-instant"
        role="tabpanel"
        aria-labelledby="invites-tab-instant"
        hidden={tab !== "instant"}
      >
        <CallInvitations />
      </div>
      <div
        id="invites-panel-schedule"
        role="tabpanel"
        aria-labelledby="invites-tab-schedule"
        hidden={tab !== "schedule"}
        className="video-invites__schedule"
      >
        {/* ================= LỜI HẸN ĐANG CHỜ ================= */}
        {isVideoInvitesView && (
          <>
            <section className="friends-section friends-section--schedule-requests">
              <div className="friends-section__header">
                <div>
                  <h2 className="text-h2">Cần phản hồi</h2>
                  <p className="friends-section__hint text-caption">
                    Kiểm tra ngày, giờ rồi nhận hoặc từ chối buổi hẹn.
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
                        <p className="schedule-request-card__title">{request.name} muốn hẹn lịch</p>
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
                <p className="video-invites__empty">
                  Bạn đã xử lý hết lời hẹn. Lời hẹn mới sẽ xuất hiện tại đây.
                </p>
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

            <section className="friends-section friends-section--calendar">
              <div className="friends-section__header">
                <div>
                  <h2 className="text-h2">Lịch của bạn</h2>
                  <p className="friends-section__hint text-caption">
                    Theo dõi buổi hẹn sắp diễn ra và các lời mời còn chờ bạn phản hồi.
                  </p>
                </div>

                <span className="friends-section__count text-caption">
                  {calendarAppointments.length} lịch hẹn
                </span>
              </div>

              {!calendarAppointments.length && (
                <EmptyState
                  title="Chưa có lịch hẹn"
                  description="Chọn ngày trong lịch bên dưới để tạo lời mời."
                  to="/friends/list"
                  actionLabel="Chọn bạn để hẹn lịch"
                />
              )}
              <MonthCalendar
                calendarTitle={calendarTitle}
                calendarMonthDays={calendarMonthDays}
                calendarAppointmentsByDate={calendarAppointmentsByDate}
                goToPreviousMonth={goToPreviousMonth}
                goToNextMonth={goToNextMonth}
                goToTodayMonth={goToTodayMonth}
                openQuickInvite={openQuickInvite}
                handleAcceptScheduleRequest={handleAcceptScheduleRequest}
                handleDeclineScheduleRequest={handleDeclineScheduleRequest}
              />
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default function VideoCallInvitesPage() {
  return <FriendsWorkspace view="invites" Content={Content} />;
}
