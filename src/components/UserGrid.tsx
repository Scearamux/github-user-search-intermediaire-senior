import type { GithubUser } from "../types/github";
import UserCard from "./UserCard";
import "./UserGrid.css";

interface UserGridProps {
  users: GithubUser[];
  selectedIds: Set<number>;
  isEditMode: boolean;
  onToggleSelect: (id: number) => void;
}

// User card grid. The `selectedIds.has(user.id)` selection test runs in O(1) during the map operation
function UserGrid({
  users,
  selectedIds,
  isEditMode,
  onToggleSelect,
}: UserGridProps) {
  return (
    // Main container managing the application's scrolling
    <div className="user-grid-container">
      <div className="user-grid">
        {/* `key={user.id}` is required to prevent DOM reuse errors after deleting */}
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
