import type { GithubUser } from "../types/github";
import "./UserCard.css";

interface UserCardProps {
  user: GithubUser;
  isSelected: boolean;
  isEditMode: boolean;
  onToggleSelect: (id: number) => void;
}

// User Card
function UserCard({
  user,
  isSelected,
  isEditMode,
  onToggleSelect,
}: UserCardProps) {
  return (
    <div className="user-card">
      {/* `aria-label` provides the label that is essential for screen readers*/}
      {isEditMode && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(user.id)}
          aria-label={`Sélectionner ${user.login}`}
          className="user-card__checkbox"
        />
      )}
      <img
        src={user.avatar_url}
        alt={`Avatar de ${user.login}`}
        className="user-card__avatar"
      />
      {/* Math.floor: ensures that an integer is displayed if the ID was generated on the front end */}
      <p className="user-card__id">{Math.floor(user.id)}</p>
      <p className="user-card__login">{user.login}</p>
      <a
        href={user.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="user-card__link"
      >
        View profile
      </a>
    </div>
  );
}

export default UserCard;
