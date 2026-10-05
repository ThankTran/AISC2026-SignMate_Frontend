import { useState } from "react";
import { Calendar, Check, X, Plus } from "lucide-react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { calendarWeekdays } from "../../pages/Friends/friendsPageConfig";
export default function MonthCalendar({
  calendarTitle,
  calendarMonthDays,
  calendarAppointmentsByDate,
  goToPreviousMonth,
  goToNextMonth,
  goToTodayMonth,
  openQuickInvite,
  handleAcceptScheduleRequest,
  handleDeclineScheduleRequest,
}) {
  const mobile = useMediaQuery("(max-width: 768px)");
  const [expandedDate, setExpandedDate] = useState(null);

  return (
    <div className="month-calendar">
      <div className="month-calendar__toolbar">
        <h3 className="month-calendar__title text-h3">{calendarTitle}</h3>

        <div className="month-calendar__controls" aria-label="Điều khiển lịch">
          <button
            type="button"
            className="month-calendar__nav"
            aria-label="Tháng trước"
            onClick={goToPreviousMonth}
          >
            ‹
          </button>
          <button type="button" className="month-calendar__today" onClick={goToTodayMonth}>
            Hôm nay
          </button>
          <button
            type="button"
            className="month-calendar__nav"
            aria-label="Tháng sau"
            onClick={goToNextMonth}
          >
            ›
          </button>
        </div>
      </div>

      <div className="month-calendar__weekdays" aria-hidden="true">
        {calendarWeekdays.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className="month-calendar__grid" aria-label={`Lịch tháng ${calendarTitle}`}>
        {calendarMonthDays
          .filter(
            (day) =>
              !mobile ||
              (day.isCurrentMonth &&
                (day.isToday || calendarAppointmentsByDate[day.dateKey]?.length)),
          )
          .map((day) => {
            const appointments = calendarAppointmentsByDate[day.dateKey] || [];

            return (
              <div
                className={`month-calendar__day ${
                  !day.isCurrentMonth ? "month-calendar__day--outside" : ""
                } ${day.isToday ? "month-calendar__day--today" : ""}`}
                key={day.dateKey}
                onClick={(event) => {
                  if (!event.target.closest("button")) {
                    openQuickInvite(day.dateKey);
                  }
                }}
              >
                <div className="month-calendar__day-top">
                  <span className="month-calendar__date">
                    {day.dateKey.endsWith("-01")
                      ? `${day.dayNumber}/${Number(day.dateKey.slice(5, 7))}`
                      : day.dayNumber}
                  </span>

                  {day.isCurrentMonth && (
                    <button
                      type="button"
                      className="month-calendar__add-day"
                      aria-label={`Mời call ngày ${day.dateKey}`}
                      title="Mời call"
                      onClick={() => openQuickInvite(day.dateKey)}
                    >
                      <Plus size={14} strokeWidth={2} />
                    </button>
                  )}
                </div>

                {!mobile && appointments.length > 2 && (
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedDate(expandedDate === day.dateKey ? null : day.dateKey)
                    }
                  >
                    {expandedDate === day.dateKey
                      ? "Thu gọn"
                      : `+${appointments.length - 2} lịch nữa`}
                  </button>
                )}
                <div className="month-calendar__events">
                  {mobile && !appointments.length && <p>Chưa có lịch hẹn. Bấm + để mời bạn.</p>}
                  {(mobile || expandedDate === day.dateKey
                    ? appointments
                    : appointments.slice(0, 2)
                  ).map((appointment) => (
                    <article
                      className={`month-calendar-event month-calendar-event--${appointment.type}`}
                      key={`${appointment.type}-${appointment.id}`}
                    >
                      <div className="month-calendar-event__title">
                        <Calendar size={14} strokeWidth={1.8} />
                        <span>{appointment.name}</span>
                      </div>
                      <p className="month-calendar-event__topic">
                        {appointment.time} · {appointment.topic}
                      </p>
                      <div className="month-calendar-event__footer">
                        <span className="month-calendar-event__status">{appointment.status}</span>

                        {appointment.type === "pending" && (
                          <div className="month-calendar-event__actions">
                            <button
                              type="button"
                              className="month-calendar-event__action month-calendar-event__action--accept"
                              onClick={() => handleAcceptScheduleRequest(appointment)}
                              aria-label={`Xác nhận lời hẹn của ${appointment.name}`}
                              title="Xác nhận"
                            >
                              <Check size={13} strokeWidth={2.2} />
                            </button>
                            <button
                              type="button"
                              className="month-calendar-event__action month-calendar-event__action--decline"
                              onClick={() => handleDeclineScheduleRequest(appointment.id)}
                              aria-label={`Hủy lời hẹn của ${appointment.name}`}
                              title="Hủy"
                            >
                              <X size={13} strokeWidth={2.2} />
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
