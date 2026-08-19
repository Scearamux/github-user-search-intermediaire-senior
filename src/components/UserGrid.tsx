import type { GithubUser } from "../types/github";
import UserCard from "./UserCard";
import "./UserGrid.css";

interface UserGridProps {
  users: GithubUser[];
  selectedIds: Set<number>;
  isEditMode: boolean;
  onToggleSelect: (id: number) => void;
}

function UserGrid({
  users,
  selectedIds,
  isEditMode,
  onToggleSelect,
}: UserGridProps) {
  return (
    <div className="user-grid-container">
      <div className="user-grid">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            isSelected={selectedIds.has(user.id)}
            isEditMode={isEditMode}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </div>
    </div>
  );
}

export default UserGrid;
