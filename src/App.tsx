import { useState } from "react";
import { useGithubUsers } from "./hooks/useGithubUsers";
import { useSelection } from "./hooks/useSelection";
import SearchBar from "./components/SearchBar";
import EditModeToggle from "./components/EditModeToggle";
import SelectionBar from "./components/SelectionBar";
import UserGrid from "./components/UserGrid";
import "./App.css";

// The main orchestrator synchronizes the selection and the list (duplication/deletion) without linking the hooks to each other
function App() {
  const [query, setQuery] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const { users, setUsers, isLoading, error, totalCount } =
    useGithubUsers(query);
  const {
    selectedIds,
    setSelectedIds,
    toggleSelect,
    toggleSelectAll,
    areAllSelected,
  } = useSelection(users, query);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  // Resets the selection on toggle to prevent hidden states
  const toggleEditMode = () => {
    setIsEditMode((prevIsEditMode) => !prevIsEditMode);
    setSelectedIds(new Set());
  };

  const duplicateSelected = () => {
    setUsers((prevUsers) => {
      const usersToDuplicate = prevUsers.filter((user) =>
        selectedIds.has(user.id),
      );

      // Generating a unique ID (timestamp + random number) to prevent duplicate React keys
      const duplicatedUsers = usersToDuplicate.map((user) => ({
        ...user,
        id: Date.now() + Math.random(),
      }));

      return [...prevUsers, ...duplicatedUsers];
    });

    setSelectedIds(new Set());
  };

  const deleteSelected = () => {
    setUsers((prevUsers) =>
      prevUsers.filter((user) => !selectedIds.has(user.id)),
    );

    setSelectedIds(new Set());
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Github Search</h1>
      </header>

      <main className="app-main">
        <div className="app-toolbar">
          <SearchBar value={query} onChange={handleChange} />
          <EditModeToggle isEditMode={isEditMode} onToggle={toggleEditMode} />
        </div>

        {/* Load, Error, and Empty Result States*/}
        {isLoading && <p>Chargement...</p>}
        {error && <p role="alert">{error}</p>}
        {/* Driven by the API count, not by `users.length`: emptying the grid
            with the delete action must not be reported as "no results" */}
        {!isLoading && !error && totalCount === 0 && (
          <p>Aucun résultat trouvé.</p>
        )}

        {/* Bonus: Complete removal of the bar outside of edit mode for the accessibility tree */}
        {isEditMode && (
          <SelectionBar
            selectedCount={selectedIds.size}
            areAllSelected={areAllSelected}
            onToggleSelectAll={toggleSelectAll}
            onDuplicate={duplicateSelected}
            onDelete={deleteSelected}
          />
        )}

        <UserGrid
          users={users}
          selectedIds={selectedIds}
          isEditMode={isEditMode}
          onToggleSelect={toggleSelect}
        />
      </main>
    </div>
  );
}

export default App;
