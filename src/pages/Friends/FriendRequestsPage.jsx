import EmptyState from "../../components/ui/EmptyState";
import FriendsWorkspace from "./FriendsWorkspace";
import { X, Check } from "lucide-react";
import { REQUEST_PREVIEW_LIMIT } from "./friendsPageConfig";
import Avatar from '../../components/ui/Avatar';
function Content({isFriendRequestsView,incomingRequests,visibleRequests,handleAcceptRequest,handleDeclineRequest,showAllRequests,setShowAllRequests,hiddenRequestCount,pendingRequestId}) { return <>
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
                  <Avatar user={request} size={48}/>
                  <span className="friend-request-card__indicator" />
                </div>

                <div className="friend-request-card__content">
                  <div>
                    <h3 className="friend-request-card__name text-h3">
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
                    disabled={!!pendingRequestId}
                    onClick={() => handleAcceptRequest(request)}
                  >
                    <Check size={15} strokeWidth={1.8} />
                    <span>Chấp nhận</span>
                  </button>

                  <button
                    type="button"
                    className="friend-request-card__decline"
                    disabled={!!pendingRequestId}
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
          <EmptyState title="Không có lời mời đang chờ" description="Các lời mời mới sẽ xuất hiện tại đây." to="/friends/list" actionLabel="Xem bạn bè"/>
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


</>; }
export default function FriendRequestsPage() { return <FriendsWorkspace view="requests" Content={Content} />; }
