import { useState } from "react";
import { useGithubUsers } from "./hooks/useGithubUsers";
import { useSelection } from "./hooks/useSelection";
import SearchBar from "./components/SearchBar";
import SelectionBar from "./components/SelectionBar";
import UserGrid from "./components/UserGrid";
import "./App.css";

function App() {
  const [query, setQuery] = useState<string>("");

  const { users, setUsers, isLoading, error } = useGithubUsers(query);
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

  const duplicateSelected = () => {
    setUsers((prevUsers) => {
      const usersToDuplicate = prevUsers.filter((user) =>
        selectedIds.has(user.id),
      );

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
        <SearchBar value={query} onChange={handleChange} />

        {isLoading && <p>Chargement...</p>}
        {error && <p role="alert">{error}</p>}
        {!isLoading && !error && query.trim() !== "" && users.length === 0 && (
          <p>Aucun résultat trouvé.</p>
        )}

        <SelectionBar
          selectedCount={selectedIds.size}
          areAllSelected={areAllSelected}
          onToggleSelectAll={toggleSelectAll}
          onDuplicate={duplicateSelected}
          onDelete={deleteSelected}
        />

        <UserGrid
          users={users}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
        />
      </main>
    </div>
  );
}

export default App;
