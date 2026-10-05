export default function ParticipantAvatar({ person, className = "" }) {
  return (
    <span className={`vc-avatar ${className}`}>
      <span>{person.initials}</span>
      {person.avatar && (
        <img
          src={person.avatar}
          alt={person.name}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
    </span>
  );
}
