import { useEffect, useState } from "react";
import type { GithubUser, GithubSearchResponse } from "../types/github";

export function useGithubUsers(query: string) {
  const [users, setUsers] = useState<GithubUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
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

  return { users, setUsers, isLoading, error };
}
