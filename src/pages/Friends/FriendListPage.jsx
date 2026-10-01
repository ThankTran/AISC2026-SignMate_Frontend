import EmptyState from "../../components/ui/EmptyState";
import FriendsWorkspace from "./FriendsWorkspace";
import { Search, X, ListFilter, Clock, UserPlus } from "lucide-react";
import Modal from "../../components/ui/Modal";
import RecentCallCard from "../../components/Friends/RecentCallCard";
import FriendListItem from "../../components/Friends/FriendListItem";
import { friendFilters } from "./friendsPageConfig";
import FriendSearchResults from '../../components/Friends/FriendSearchResults';
function Content({searchValue,setSearchValue,isFriendsHome,callHistoryTriggerRef,setShowCallHistory,recentConversationCalls,handleAddFriend,requestingCallId,requestedCallIds,showCallHistory,filteredFriends,selectedFriendFilterLabel,friendFilter,filterRef,isFriendFilterOpen,setIsFriendFilterOpen,setFriendFilter,visibleFriendCount,setVisibleFriendCount,handleSchedule,handleCall}) { return <>
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
            placeholder="Tìm theo tên"
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

      {isFriendsHome&&<FriendSearchResults query={searchValue} onAdd={handleAddFriend} sentRequests={requestedCallIds} pendingId={requestingCallId}/>}
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
          <Modal className="call-history-modal__panel" labelledBy="call-history-title" onClose={() => setShowCallHistory(false)}>
              <div className="call-history-modal__header">
                <div className="call-history-modal__heading">
                  <span className="call-history-modal__icon">
                    <Clock size={18} strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 id="call-history-title" className="text-h3">Người đã trò chuyện gần đây</h3>
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
</Modal>
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

            <div className="friends-filter" ref={filterRef}>
              <button
                type="button"
                className={`friends-section__filter-btn ${
                  friendFilter !== "all" ? "friends-section__filter-btn--active" : ""
                }`}
                aria-label="Lọc danh sách bạn bè"
                title="Lọc danh sách bạn bè"
                aria-expanded={isFriendFilterOpen} aria-haspopup="menu"
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
                      key={filter.value} role="menuitemradio" aria-checked={friendFilter === filter.value}
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
            <EmptyState title="Không tìm thấy kết nối phù hợp" description="Thử tên khác hoặc thay đổi bộ lọc trạng thái." onAction={()=>{setSearchValue('');setFriendFilter('all');}} actionLabel="Xóa bộ lọc"/>
          ) : (
            filteredFriends.slice(0, visibleFriendCount).map((friend) => (
              <FriendListItem
                key={friend.id}
                friend={friend}
                onSchedule={handleSchedule}
                onCall={handleCall}
              />
            ))
          )}
        </div>
        {visibleFriendCount < filteredFriends.length && <button type="button" className="friends-list__load-more" onClick={() => setVisibleFriendCount(count => count + 8)}>Xem thêm bạn bè</button>}
      </section>
      )}


</>; }
export default function FriendListPage() { return <FriendsWorkspace view="list" Content={Content} />; }
