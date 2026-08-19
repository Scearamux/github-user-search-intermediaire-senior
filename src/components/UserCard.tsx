import type { GithubUser } from "../types/github";
import "./UserCard.css";

interface UserCardProps {
  user: GithubUser;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
}

function UserCard({ user, isSelected, onToggleSelect }: UserCardProps) {
  return (
    <div className="user-card">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelect(user.id)}
        aria-label={`Sélectionner ${user.login}`}
        className="user-card__checkbox"
      />
      <img
        src={user.avatar_url}
        alt={`Avatar de ${user.login}`}
        className="user-card__avatar"
      />
      <p className="user-card__id">{user.id}</p>
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
