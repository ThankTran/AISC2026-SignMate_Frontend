import EmptyState from "../../components/ui/EmptyState";
import FriendsWorkspace from "./FriendsWorkspace";
import { X, Check } from "lucide-react";
import MonthCalendar from "../../components/Friends/MonthCalendar";
import { SCHEDULE_PREVIEW_LIMIT } from "./friendsPageConfig";
function Content({isVideoInvitesView,incomingScheduleRequests,visibleScheduleRequests,handleAcceptScheduleRequest,handleDeclineScheduleRequest,showAllScheduleRequests,setShowAllScheduleRequests,hiddenScheduleRequestCount,calendarAppointments,calendarTitle,calendarMonthDays,calendarAppointmentsByDate,goToPreviousMonth,goToNextMonth,goToTodayMonth,openQuickInvite}) { return <>
      {/* ================= LỜI HẸN ĐANG CHỜ ================= */}
      {isVideoInvitesView && (
      <>
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
          <EmptyState title="Không có lời mời đang chờ" description="Các lời mời mới sẽ xuất hiện tại đây." to="/friends/list" actionLabel="Xem bạn bè"/>
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
            <h2 className="text-h2">Lịch hẹn luyện tập</h2>
            <p className="friends-section__hint text-caption">
              Theo dõi buổi hẹn sắp diễn ra và các lời mời còn chờ bạn phản hồi.
            </p>
          </div>

          <span className="friends-section__count text-caption">
            {calendarAppointments.length} lịch hẹn
          </span>
        </div>

        {!calendarAppointments.length&&<EmptyState title="Chưa có lịch hẹn" description="Chọn ngày trong lịch bên dưới để tạo lời mời." to="/friends/list" actionLabel="Chọn bạn để hẹn lịch"/>}
        <MonthCalendar calendarTitle={calendarTitle} calendarMonthDays={calendarMonthDays} calendarAppointmentsByDate={calendarAppointmentsByDate} goToPreviousMonth={goToPreviousMonth} goToNextMonth={goToNextMonth} goToTodayMonth={goToTodayMonth} openQuickInvite={openQuickInvite} handleAcceptScheduleRequest={handleAcceptScheduleRequest} handleDeclineScheduleRequest={handleDeclineScheduleRequest} />
      </section>
      </>
      )}


</>; }
export default function VideoCallInvitesPage() { return <FriendsWorkspace view="invites" Content={Content} />; }
