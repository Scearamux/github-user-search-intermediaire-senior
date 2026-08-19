import type { GithubUser } from "../types/github";
import "./UserCard.css";

interface UserCardProps {
  user: GithubUser;
}

function UserCard({ user }: UserCardProps) {
  return (
    <div className="user-card">
      <img
        src={user.avatar_url}
        alt="{`Avatar de ${user.login}`}"
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
