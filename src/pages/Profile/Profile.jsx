import { useState } from "react";
import { Camera, Pencil, Check, Globe, Users, Lock } from "lucide-react";
import "./Profile.css";

// DATA MẪU
const initialProfile = {
  name: "Cassie",
  bio: "Học ngôn ngữ ký hiệu mỗi ngày 🤟",
  userType: "hearing", // "deaf" | "hearing"
  privacy: {
    profile: "public",
    friendList: "friends",
    stats: "public",
  },
};

const userTypes = [
  {
    id: "deaf",
    emoji: "🤟",
    title: "Người khiếm thính",
    desc: "Học ngôn ngữ ký hiệu để giao tiếp",
  },
  {
    id: "hearing",
    emoji: "👂",
    title: "Người bình thường",
    desc: "Học để giao tiếp với người khiếm thính",
  },
];

const privacyOptions = [
  { id: "public", label: "Công khai", Icon: Globe },
  { id: "friends", label: "Bạn bè", Icon: Users },
  { id: "private", label: "Riêng tư", Icon: Lock },
];

const privacyRows = [
  {
    id: "profile",
    title: "Hồ sơ cá nhân",
    desc: "Ai có thể xem thông tin hồ sơ của bạn",
  },
  {
    id: "friendList",
    title: "Danh sách bạn bè",
    desc: "Ai có thể xem danh sách bạn bè của bạn",
  },
  {
    id: "stats",
    title: "Thống kê học tập",
    desc: "Ai có thể xem streak và điểm số của bạn",
  },
];

const getInitials = (name) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    return words
      .slice(-2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }
  return (words[0] || "").slice(0, 2).toUpperCase();
};

function EditableField({ id, label, value, onSave, required = false }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const start = () => {
    setDraft(value);
    setEditing(true);
  };

  const save = () => {
    const next = draft.trim();
    if (required && !next) return;
    onSave(next);
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") setEditing(false);
  };

  return (
    <div className="pf-field">
      <div className="pf-field__main">
        <label className="pf-field__label" htmlFor={id}>
          {label}
        </label>
        {editing ? (
          <input
            id={id}
            className="pf-field__input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <p id={id} className="pf-field__value">
            {value || <span className="pf-field__empty">Chưa có thông tin</span>}
          </p>
        )}
      </div>

      <button
        type="button"
        className="pf-icon-btn"
        onClick={editing ? save : start}
        aria-label={editing ? `Lưu ${label.toLowerCase()}` : `Sửa ${label.toLowerCase()}`}
      >
        {editing ? <Check size={20} /> : <Pencil size={20} />}
      </button>
    </div>
  );
}

function ProfilePage() {
  const [profile, setProfile] = useState(initialProfile);

  const update = (patch) => setProfile((p) => ({ ...p, ...patch }));

  const setPrivacy = (rowId, value) =>
    setProfile((p) => ({ ...p, privacy: { ...p.privacy, [rowId]: value } }));

  return (
    <div className="pf">
      <header className="pf-header">
        <h1>Hồ sơ</h1>
        <p>Quản lý thông tin cá nhân và cài đặt của bạn</p>
      </header>

      <div className="pf-content">
        {/* ===== Thông tin cá nhân ===== */}
        <section className="pf-card pf-info">
          <div className="pf-avatar">
            <span className="pf-avatar__text">{getInitials(profile.name)}</span>
            <button
              type="button"
              className="pf-avatar__cam"
              aria-label="Đổi ảnh đại diện"
            >
              <Camera size={14} />
            </button>
          </div>

          <div className="pf-info__fields">
            <EditableField
              id="pf-name"
              label="TÊN NGƯỜI DÙNG"
              value={profile.name}
              required
              onSave={(name) => update({ name })}
            />
            <EditableField
              id="pf-bio"
              label="GIỚI THIỆU BẢN THÂN"
              value={profile.bio}
              onSave={(bio) => update({ bio })}
            />
          </div>
        </section>

        {/* ===== Loại người dùng ===== */}
        <section className="pf-card pf-section">
          <h2 className="pf-section__title">Loại người dùng</h2>

          <div className="pf-types" role="radiogroup" aria-label="Loại người dùng">
            {userTypes.map((t) => {
              const selected = profile.userType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`pf-type pf-type--${t.id}${selected ? " is-selected" : ""}`}
                  onClick={() => update({ userType: t.id })}
                >
                  {selected && (
                    <span className="pf-type__check">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  )}
                  <span className="pf-type__emoji" aria-hidden="true">
                    {t.emoji}
                  </span>
                  <span className="pf-type__title">{t.title}</span>
                  <span className="pf-type__desc">{t.desc}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ===== Quyền riêng tư ===== */}
        <section className="pf-card pf-section">
          <h2 className="pf-section__title">Quyền riêng tư</h2>

          <div className="pf-privacy">
            {privacyRows.map((row) => (
              <div key={row.id} className="pf-privacy__row">
                <div className="pf-privacy__text">
                  <p className="pf-privacy__name">{row.title}</p>
                  <p className="pf-privacy__desc">{row.desc}</p>
                </div>

                <div
                  className="pf-pills"
                  role="radiogroup"
                  aria-label={row.title}
                >
                  {privacyOptions.map(({ id, label, Icon }) => {
                    const selected = profile.privacy[row.id] === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={`pf-pill${selected ? " is-selected" : ""}`}
                        onClick={() => setPrivacy(row.id, id)}
                      >
                        <Icon size={15} />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;