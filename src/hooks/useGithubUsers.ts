import { useEffect, useState } from "react";
import type { GithubUser, GithubSearchResponse } from "../types/github";

const GITHUB_SEARCH_URL = "https://api.github.com/search/users";
const DEBOUNCE_MS = 400;

// Search for GitHub users with support for debounce, cancellation, and API rate limiting.
// `setUsers` is exposed to allow local modification of the list (front end)
export function useGithubUsers(query: string) {
  const [users, setUsers] = useState<GithubUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Empty input: reset to preserve the API quota.
    if (query.trim() === "") {
      setUsers([]);
      setError("");
      return;
    }

    const controller = new AbortController();

    // Debounce to prevent multiple requests from being sent with every keystroke
    const timeoutId = setTimeout(() => {
      setIsLoading(true);
      setError("");

      fetch(`${GITHUB_SEARCH_URL}?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then((response) => {
          // GitHub returns an HTTP 403 error if the quota is exceeded
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
          // Ignore the error if the request was intentionally canceled
          if (err.name === "AbortError") return;
          setError(err.message);
          setUsers([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, DEBOUNCE_MS);

    // Cleanup: cancels the current timer or query if `query` changes (race condition)
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  return { users, setUsers, isLoading, error };
}
