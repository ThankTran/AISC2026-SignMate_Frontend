import { useState, useId } from "react";
import { Search, X, Clock, UserPlus, Sparkles } from "lucide-react";
import EmptyState from "../../components/ui/EmptyState";
import Avatar from "../../components/ui/Avatar";
import Modal from "../../components/ui/Modal";
import RecentCallCard from "../../components/Friends/RecentCallCard";
import FriendListItem from "../../components/Friends/FriendListItem";
import FriendSearchResults from "../../components/Friends/FriendSearchResults";
import FriendsWorkspace from "./FriendsWorkspace";

function Content({
  searchValue,
  setSearchValue,
  callHistoryTriggerRef,
  setShowCallHistory,
  recentConversationCalls = [],
  handleAddFriend,
  requestingCallId,
  requestedCallIds = [],
  showCallHistory,
  friends = [],
  filteredFriends = [],
  selectedFriendFilterLabel,
  friendFilter = "all",
  setFriendFilter,
  visibleFriendCount = 8,
  setVisibleFriendCount,
  handleSchedule,
  handleCall,
  handleRemoveFriend,
}) {
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [discoveryQuery, setDiscoveryQuery] = useState("");
  const searchInputId = useId();
  const discoveryInputId = useId();

  const onlineCount = friends.filter((f) => f.isOnline).length;
  const offlineCount = friends.filter((f) => !f.isOnline).length;

  return (
    <div className="friends-view-container">
      {/* ================= THANH TÌM KIẾM & BỘ LỌC BẠN BÈ ================= */}
      <section className="friends-controls-panel" aria-label="Tìm kiếm và lọc bạn bè">
        <div className="friends-controls-row">
          {/* Ô tìm kiếm trong danh sách bạn bè */}
          <div className="friends-search-box" role="search">
            <Search size={18} strokeWidth={2} className="friends-search-box__icon" aria-hidden="true" />
            <label htmlFor={searchInputId} className="sr-only">
              Tìm bạn bè theo tên hoặc ID
            </label>
            <input
              id={searchInputId}
              type="text"
              className="friends-search-box__input"
              placeholder="Tìm kiếm bạn bè theo tên..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              aria-label="Tìm kiếm bạn bè theo tên"
            />
            {searchValue && (
              <button
                type="button"
                className="friends-search-box__clear"
                aria-label="Xóa từ khóa tìm kiếm"
                onClick={() => setSearchValue("")}
              >
                <X size={15} strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Nút bật/tắt Khám phá bạn mới */}
          <button
            type="button"
            className={`friends-discovery-toggle ${showDiscovery ? "friends-discovery-toggle--active" : ""}`}
            onClick={() => setShowDiscovery((prev) => !prev)}
            aria-expanded={showDiscovery}
          >
            <UserPlus size={16} strokeWidth={2} />
            <span>{showDiscovery ? "Đóng tìm bạn mới" : "Tìm bạn mới"}</span>
          </button>
        </div>

        {/* Filter chips lọc trạng thái Online / Offline */}
        <div className="friends-filter-chips" role="radiogroup" aria-label="Lọc theo trạng thái hoạt động">
          <button
            type="button"
            role="radio"
            aria-checked={friendFilter === "all"}
            className={`friends-filter-chip ${friendFilter === "all" ? "friends-filter-chip--active" : ""}`}
            onClick={() => setFriendFilter("all")}
          >
            <span>Tất cả</span>
            <span className="friends-filter-chip__badge">{friends.length}</span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={friendFilter === "online"}
            className={`friends-filter-chip ${friendFilter === "online" ? "friends-filter-chip--active" : ""}`}
            onClick={() => setFriendFilter("online")}
          >
            <span className="chip-dot chip-dot--online" aria-hidden="true" />
            <span>Đang online</span>
            <span className="friends-filter-chip__badge friends-filter-chip__badge--online">{onlineCount}</span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={friendFilter === "offline"}
            className={`friends-filter-chip ${friendFilter === "offline" ? "friends-filter-chip--active" : ""}`}
            onClick={() => setFriendFilter("offline")}
          >
            <span className="chip-dot chip-dot--offline" aria-hidden="true" />
            <span>Ngoại tuyến</span>
            <span className="friends-filter-chip__badge">{offlineCount}</span>
          </button>
        </div>
      </section>

      {/* ================= KHUNG KHÁM PHÁ NGƯỜI HỌC MỚI ================= */}
      {showDiscovery && (
        <section className="friends-discovery-panel" aria-labelledby="discovery-heading">
          <div className="friends-discovery-panel__header">
            <div className="friends-discovery-panel__icon">
              <Sparkles size={20} strokeWidth={2} />
            </div>
            <div>
              <h2 id="discovery-heading" className="friends-discovery-panel__title text-h2">
                Tìm người học trên SignMate
              </h2>
              <p className="friends-discovery-panel__desc">
                Nhập tên hoặc ID tài khoản để gửi lời mời kết bạn và cùng nhau luyện tập ngôn ngữ ký hiệu.
              </p>
            </div>
            <button
              type="button"
              className="friends-discovery-panel__close"
              aria-label="Đóng bảng tìm kiếm"
              onClick={() => setShowDiscovery(false)}
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          <div className="friends-discovery-search" role="search">
            <Search size={18} strokeWidth={2} className="friends-discovery-search__icon" aria-hidden="true" />
            <label htmlFor={discoveryInputId} className="sr-only">
              Nhập tên hoặc ID người học
            </label>
            <input
              id={discoveryInputId}
              type="text"
              className="friends-discovery-search__input"
              placeholder="Nhập tên người học hoặc ID tài khoản..."
              value={discoveryQuery}
              onChange={(e) => setDiscoveryQuery(e.target.value)}
              autoFocus
            />
            {discoveryQuery && (
              <button
                type="button"
                className="friends-discovery-search__clear"
                aria-label="Xóa từ khóa"
                onClick={() => setDiscoveryQuery("")}
              >
                <X size={15} strokeWidth={2} />
              </button>
            )}
          </div>

          <FriendSearchResults
            query={discoveryQuery}
            onAdd={handleAddFriend}
            sentRequests={requestedCallIds}
            pendingId={requestingCallId}
          />
        </section>
      )}

      {/* ================= DANH SÁCH BẠN BÈ ================= */}
      <section className="friends-content-section" aria-labelledby="friends-list-heading">
        <div className="friends-content-section__header">
          <div>
            <h2 id="friends-list-heading" className="friends-content-section__title text-h2">
              Danh sách bạn bè
            </h2>
            <p className="friends-content-section__subtitle">
              {filteredFriends.length} bạn bè · {selectedFriendFilterLabel}
            </p>
          </div>
        </div>

        {filteredFriends.length === 0 ? (
          <div className="friends-empty-wrapper">
            {searchValue ? (
              <EmptyState
                title="Không tìm thấy bạn bè phù hợp"
                description={`Không có kết quả nào khớp với từ khóa "${searchValue}".`}
                onAction={() => setSearchValue("")}
                actionLabel="Xóa từ khóa tìm kiếm"
              />
            ) : friendFilter === "online" ? (
              <EmptyState
                title="Hiện chưa có bạn bè online"
                description="Tất cả bạn bè hiện đang ngoại tuyến. Bạn có thể hẹn trước một buổi luyện tập!"
                onAction={() => setFriendFilter("all")}
                actionLabel="Xem tất cả bạn bè"
              />
            ) : (
              <EmptyState
                title="Chưa có bạn bè trong danh sách"
                description="Kết nối với người học khác để cùng nhau luyện tập ngôn ngữ ký hiệu mỗi ngày."
                onAction={() => setShowDiscovery(true)}
                actionLabel="Tìm bạn học mới"
              />
            )}
          </div>
        ) : (
          <>
            <div className="friends-cards-grid">
              {filteredFriends.slice(0, visibleFriendCount).map((friend) => (
                <FriendListItem
                  key={friend.id}
                  friend={friend}
                  onSchedule={handleSchedule}
                  onCall={handleCall}
                  onRemove={handleRemoveFriend}
                />
              ))}
            </div>

            {visibleFriendCount < filteredFriends.length && (
              <div className="friends-load-more-wrap">
                <button
                  type="button"
                  className="friends-load-more-btn"
                  onClick={() => setVisibleFriendCount((count) => count + 8)}
                >
                  Xem thêm bạn bè ({filteredFriends.length - visibleFriendCount} người còn lại)
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ================= CUỘC GỌI GẦN ĐÂY ================= */}
      {recentConversationCalls.length > 0 && (
        <section className="friends-content-section friends-recent-section" aria-labelledby="recent-calls-heading">
          <div className="friends-content-section__header">
            <div>
              <h2 id="recent-calls-heading" className="friends-content-section__title text-h2">
                Cuộc gọi luyện tập gần đây
              </h2>
              <p className="friends-content-section__subtitle">
                Những người bạn đã hoàn thành cuộc gọi luyện tập gần nhất.
              </p>
            </div>

            <button
              type="button"
              className="friends-recent-section__view-all"
              ref={callHistoryTriggerRef}
              aria-haspopup="dialog"
              onClick={() => setShowCallHistory(true)}
            >
              <span>Xem tất cả ({recentConversationCalls.length})</span>
            </button>
          </div>

          <div className="friends-recent-calls-grid">
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

          {/* Modal Lịch sử cuộc gọi */}
          {showCallHistory && (
            <Modal
              className="call-history-modal__panel"
              labelledBy="call-history-title"
              onClose={() => setShowCallHistory(false)}
            >
              <div className="call-history-modal__header">
                <div className="call-history-modal__heading">
                  <span className="call-history-modal__icon">
                    <Clock size={18} strokeWidth={2} />
                  </span>
                  <div>
                    <h3 id="call-history-title" className="text-h3">
                      Lịch sử cuộc gọi luyện tập
                    </h3>
                    <p>Những người bạn đã từng trò chuyện và có thể muốn kết nối lại.</p>
                  </div>
                </div>

                <div className="call-history-modal__controls">
                  <span className="call-history-modal__count">{recentConversationCalls.length} người</span>
                  <button
                    type="button"
                    className="call-history-modal__close"
                    aria-label="Đóng lịch sử cuộc gọi"
                    autoFocus
                    onClick={() => setShowCallHistory(false)}
                  >
                    <X size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>

              <div className="call-history-list">
                {recentConversationCalls.map((call) => {
                  const isRequested = requestedCallIds.includes(call.id);
                  const isRequesting = requestingCallId === call.id;

                  return (
                    <article className="call-history-item" key={`history-${call.id}`}>
                      <Avatar user={call} size={46} className="call-history-item__avatar" />

                      <div className="call-history-item__content">
                        <p className="call-history-item__name">{call.name}</p>
                        <p className="call-history-item__meta">
                          {call.day} · {call.date} lúc {call.time}
                        </p>
                      </div>

                      <div className="call-history-item__detail">
                        <span>Thời lượng</span>
                        <strong>{call.duration}</strong>
                      </div>

                      <button
                        type="button"
                        className={`call-history-item__action ${
                          isRequested ? "call-history-item__action--sent" : ""
                        }`}
                        disabled={call.isFriend || isRequested || isRequesting}
                        onClick={() => handleAddFriend(call.id)}
                      >
                        <UserPlus size={15} strokeWidth={2} />
                        <span>
                          {call.isFriend
                            ? "Đã là bạn bè"
                            : isRequesting
                              ? "Đang gửi..."
                              : isRequested
                                ? "Đã gửi lời mời"
                                : "Kết bạn"}
                        </span>
                      </button>
                    </article>
                  );
                })}
              </div>
            </Modal>
          )}
        </section>
      )}
    </div>
  );
}

export default function FriendListPage() {
  return <FriendsWorkspace view="list" Content={Content} />;
}
