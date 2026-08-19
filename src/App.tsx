import { useEffect, useState } from "react";
import type { GithubUser, GithubSearchResponse } from "./types/github";
import UserCard from "./components/UserCard";
import "./App.css";

function App() {
  const [query, setQuery] = useState<string>("");
  const [users, setUsers] = useState<GithubUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prevSelectedIds) => {
      const newSelectedIds = new Set(prevSelectedIds);
      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id);
      } else {
        newSelectedIds.add(id);
      }
      return newSelectedIds;
    });
  };

  const areAllSelected = users.length > 0 && selectedIds.size === users.length;

  const toggleSelectAll = () => {
    if (areAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((user) => user.id)));
    }
  };

  useEffect(() => {
    setSelectedIds(new Set());

    if (query.trim() === "") {
      setUsers([]);
      setError("");
      return;
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      setIsLoading(true);
      setError("");

      fetch(
        `https://api.github.com/search/users?q=${encodeURIComponent(query)}`,
        {
          signal: controller.signal,
        },
      )
        .then((response) => {
          if (response.status === 403) {
            throw new Error(
              "Limite de requêtes Github atteinte, réessaie plus tard.",
            );
          }
          if (!response.ok) {
            throw new Error("Une erreur est survenue lors de la recherche.");
          }
          return response.json();
        })
        .then((data: GithubSearchResponse) => {
          setUsers(data.items);
        })
        .catch((err: Error) => {
          if (err.name === "AbortError") return;
          setError(err.message);
          setUsers([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 400);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  return (
    <div>
      <h1>Github User Search</h1>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Rechercher un utilisateur Github..."
      />
      {isLoading && <p>Chargement...</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && query.trim() !== "" && users.length === 0 && (
        <p>Aucun résultat trouvé.</p>
      )}
      <div className="selection-bar">
        <label>
          <input
            type="checkbox"
            checked={areAllSelected}
            onChange={toggleSelectAll}
          />
          {selectedIds.size} elements selected
        </label>
      </div>
      <div className="user-grid">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            isSelected={selectedIds.has(user.id)}
            onToggleSelect={toggleSelect}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
