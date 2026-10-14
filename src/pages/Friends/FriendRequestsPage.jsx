import { useState } from "react";
import { Check, X, Clock, UserCheck, Send, MessageSquareQuote, Users } from "lucide-react";
import EmptyState from "../../components/ui/EmptyState";
import Avatar from "../../components/ui/Avatar";
import FriendsWorkspace from "./FriendsWorkspace";

function Content({
  incomingRequests = [],
  outgoingRequests = [],
  visibleRequests = [],
  handleAcceptRequest,
  handleDeclineRequest,
  handleCancelSentRequest,
  showAllRequests,
  setShowAllRequests,
  hiddenRequestCount,
  pendingRequestId,
}) {
  const [activeTab, setActiveTab] = useState("incoming");

  return (
    <div className="friend-requests-view">
      {/* ================= SUB-TABS: ĐÃ NHẬN / ĐÃ GỬI ================= */}
      <div className="friend-requests-tabs-bar" role="tablist" aria-label="Loại lời mời kết bạn">
        <button
          type="button"
          role="tab"
          id="tab-incoming"
          aria-selected={activeTab === "incoming"}
          aria-controls="panel-incoming"
          className={`friend-requests-tab-btn ${
            activeTab === "incoming" ? "friend-requests-tab-btn--active" : ""
          }`}
          onClick={() => setActiveTab("incoming")}
        >
          <UserCheck size={16} strokeWidth={2} />
          <span>Lời mời đã nhận</span>
          {incomingRequests.length > 0 && (
            <span className="friend-requests-tab-btn__badge friend-requests-tab-btn__badge--alert">
              {incomingRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          id="tab-outgoing"
          aria-selected={activeTab === "outgoing"}
          aria-controls="panel-outgoing"
          className={`friend-requests-tab-btn ${
            activeTab === "outgoing" ? "friend-requests-tab-btn--active" : ""
          }`}
          onClick={() => setActiveTab("outgoing")}
        >
          <Send size={15} strokeWidth={2} />
          <span>Lời mời đã gửi</span>
          {outgoingRequests.length > 0 && (
            <span className="friend-requests-tab-btn__badge">{outgoingRequests.length}</span>
          )}
        </button>
      </div>

      {/* ================= PANEL: LỜI MỜI ĐÃ NHẬN ================= */}
      {activeTab === "incoming" && (
        <section
          id="panel-incoming"
          role="tabpanel"
          aria-labelledby="tab-incoming"
          className="friend-requests-panel"
        >
          <div className="friend-requests-panel__header">
            <div>
              <h2 className="text-h2">Lời mời đang chờ phản hồi</h2>
              <p className="friend-requests-panel__hint">
                Chấp nhận để thêm vào danh sách bạn bè và bắt đầu cùng nhau luyện tập ngôn ngữ ký hiệu.
              </p>
            </div>
            <span className="friend-requests-panel__count">
              {incomingRequests.length} lời mời
            </span>
          </div>

          {incomingRequests.length > 0 ? (
            <div className="friend-requests-list">
              {(showAllRequests ? incomingRequests : visibleRequests).map((request) => {
                const isPending = pendingRequestId === request.id;

                return (
                  <article className="friend-request-item-card" key={request.id}>
                    <div className="friend-request-item-card__avatar-wrap">
                      <Avatar user={request} size={52} className="friend-request-item-card__avatar" />
                      {request.isOnline && (
                        <span className="friend-request-item-card__status-dot" aria-hidden="true" />
                      )}
                    </div>

                    <div className="friend-request-item-card__content">
                      <div className="friend-request-item-card__header-row">
                        <h3 className="friend-request-item-card__name text-h3">{request.name}</h3>
                        <span className="friend-request-item-card__time">{request.requestedAt}</span>
                      </div>

                      <div className="friend-request-item-card__meta">
                        {request.mutualFriends > 0 ? (
                          <span className="friend-request-item-card__mutual">
                            <Users size={13} strokeWidth={1.8} />
                            <span>{request.mutualFriends} bạn chung</span>
                          </span>
                        ) : (
                          <span className="friend-request-item-card__mutual">Người học mới</span>
                        )}
                        {request.statusText && (
                          <span className="friend-request-item-card__status-tag">
                            · {request.statusText}
                          </span>
                        )}
                      </div>

                      {request.note && (
                        <div className="friend-request-item-card__note">
                          <MessageSquareQuote size={14} className="note-quote-icon" aria-hidden="true" />
                          <span>&ldquo;{request.note}&rdquo;</span>
                        </div>
                      )}
                    </div>

                    <div className="friend-request-item-card__actions">
                      <button
                        type="button"
                        className="friend-request-item-card__btn-accept"
                        disabled={isPending}
                        onClick={() => handleAcceptRequest(request)}
                      >
                        <Check size={16} strokeWidth={2} />
                        <span>{isPending ? "Đang xử lý…" : "Chấp nhận"}</span>
                      </button>

                      <button
                        type="button"
                        className="friend-request-item-card__btn-decline"
                        disabled={isPending}
                        onClick={() => handleDeclineRequest(request.id)}
                        aria-label={`Từ chối lời mời của ${request.name}`}
                      >
                        <X size={16} strokeWidth={2} />
                        <span>Từ chối</span>
                      </button>
                    </div>
                  </article>
                );
              })}

              {incomingRequests.length > visibleRequests.length && (
                <div className="friend-requests-more-wrap">
                  <button
                    type="button"
                    className="friend-requests-more-btn"
                    onClick={() => setShowAllRequests((prev) => !prev)}
                  >
                    {showAllRequests ? "Thu gọn lời mời" : `Xem thêm ${hiddenRequestCount} lời mời`}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="friends-empty-wrapper">
              <EmptyState
                title="Không có lời mời nào đang chờ"
                description="Bạn đã xử lý hết các lời mời kết bạn. Các lời mời mới sẽ xuất hiện tại đây."
                to="/friends/list"
                actionLabel="Xem danh sách bạn bè"
              />
            </div>
          )}
        </section>
      )}

      {/* ================= PANEL: LỜI MỜI ĐÃ GỬI ================= */}
      {activeTab === "outgoing" && (
        <section
          id="panel-outgoing"
          role="tabpanel"
          aria-labelledby="tab-outgoing"
          className="friend-requests-panel"
        >
          <div className="friend-requests-panel__header">
            <div>
              <h2 className="text-h2">Lời mời kết bạn đã gửi</h2>
              <p className="friend-requests-panel__hint">
                Những người học bạn đã gửi lời mời và đang chờ đối phương phản hồi.
              </p>
            </div>
            <span className="friend-requests-panel__count">
              {outgoingRequests.length} đã gửi
            </span>
          </div>

          {outgoingRequests.length > 0 ? (
            <div className="friend-requests-list">
              {outgoingRequests.map((request) => (
                <article className="friend-request-item-card friend-request-item-card--outgoing" key={request.id}>
                  <div className="friend-request-item-card__avatar-wrap">
                    <Avatar user={request} size={52} className="friend-request-item-card__avatar" />
                    {request.isOnline && (
                      <span className="friend-request-item-card__status-dot" aria-hidden="true" />
                    )}
                  </div>

                  <div className="friend-request-item-card__content">
                    <div className="friend-request-item-card__header-row">
                      <h3 className="friend-request-item-card__name text-h3">{request.name}</h3>
                      <span className="friend-request-item-card__time">{request.requestedAt}</span>
                    </div>

                    <div className="friend-request-item-card__meta">
                      <span className="friend-request-item-card__waiting-badge">
                        <Clock size={13} strokeWidth={2} />
                        <span>Đang chờ chấp nhận</span>
                      </span>
                      {request.mutualFriends > 0 && (
                        <span className="friend-request-item-card__status-tag">
                          · {request.mutualFriends} bạn chung
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="friend-request-item-card__actions">
                    <button
                      type="button"
                      className="friend-request-item-card__btn-cancel"
                      onClick={() => handleCancelSentRequest?.(request.id)}
                      aria-label={`Hủy lời mời đã gửi tới ${request.name}`}
                    >
                      <X size={15} strokeWidth={2} />
                      <span>Hủy lời mời</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="friends-empty-wrapper">
              <EmptyState
                title="Chưa có lời mời nào được gửi"
                description="Bạn chưa gửi lời mời kết bạn nào đang chờ phản hồi."
                to="/friends/list"
                actionLabel="Tìm bạn học mới"
              />
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default function FriendRequestsPage() {
  return <FriendsWorkspace view="requests" Content={Content} />;
}
