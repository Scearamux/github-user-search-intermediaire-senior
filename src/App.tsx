import { useEffect, useState } from "react";
import type { GithubUser, GithubSearchResponse } from "./types/github";
import "./App.css";

function App() {
  const [query, setQuery] = useState<string>("");
  const [users, setUsers] = useState<GithubUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  useEffect(() => {
    if (query.trim() === "") {
      setUsers([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsLoading(true);

      fetch(
        `https://api.github.com/search/users?q=${encodeURIComponent(query)}`,
      )
        .then((response) => response.json())
        .then((data: GithubSearchResponse) => {
          setUsers(data.items);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 300);

    return () => clearTimeout(timeoutId);
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
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.login}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
