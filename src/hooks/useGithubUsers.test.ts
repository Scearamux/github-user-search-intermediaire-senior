import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGithubUsers } from "./useGithubUsers";
import type { GithubUser } from "../types/github";

const DEBOUNCE_MS = 400;

const torvalds: GithubUser = {
  id: 1024025,
  login: "torvalds",
  avatar_url: "https://avatars.githubusercontent.com/u/1024025",
  html_url: "https://github.com/torvalds",
};

// Minimum fetch response: only “ok,” “status,” and “json” are processed by the hook
function response(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

// bypasses the debounce and then lets the fetch promise chain resolve. The `await act(async ...)` clears the microtask queue, which avoids having to wait for a real delay
async function runDebounce() {
  await act(async () => {
    vi.advanceTimersByTime(DEBOUNCE_MS);
  });
}

function renderHookWithQuery(query: string) {
  return renderHook(({ query }) => useGithubUsers(query), {
    initialProps: { query },
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  fetchMock = vi.fn().mockResolvedValue(response({ items: [torvalds], total_count: 1 }));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("useGithubUsers", () => {
  it("ne lance aucune requête tant que la recherche est vide", async () => {
    const { result } = renderHookWithQuery("   ");
    await runDebounce();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBe("");
  });

  it("attend la fin du debounce avant d'appeler l'API", async () => {
    renderHookWithQuery("torvalds");

    act(() => {
      vi.advanceTimersByTime(DEBOUNCE_MS - 1);
    });
    expect(fetchMock).not.toHaveBeenCalled();

    await runDebounce();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("expose les utilisateurs renvoyés par l'API", async () => {
    const { result } = renderHookWithQuery("torvalds");
    await runDebounce();

    expect(result.current.users).toEqual([torvalds]);
    expect(result.current.error).toBe("");
    expect(result.current.isLoading).toBe(false);
  });

  it("encode la recherche dans l'URL", async () => {
    renderHookWithQuery("foo bar&baz");
    await runDebounce();

    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api.github.com/search/users?q=foo%20bar%26baz",
    );
  });

  // Boundary case required by the problem statement: no result
  it("renvoie une liste vide quand l'API ne trouve personne", async () => {
    fetchMock.mockResolvedValue(response({ items: [], total_count: 0 }));

    const { result } = renderHookWithQuery("zzzzzzzzzz");
    await runDebounce();

    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBe("");
  });

  // Boundary case required by the problem statement: GitHub API rate limit
  it("signale le rate limit sur une réponse 403", async () => {
    fetchMock.mockResolvedValue(response({}, 403));

    const { result } = renderHookWithQuery("torvalds");
    await runDebounce();

    expect(result.current.error).toMatch(/limite de requêtes/i);
    expect(result.current.users).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("signale une erreur générique sur les autres statuts d'échec", async () => {
    fetchMock.mockResolvedValue(response({}, 500));

    const { result } = renderHookWithQuery("torvalds");
    await runDebounce();

    expect(result.current.error).toMatch(/une erreur est survenue/i);
    expect(result.current.users).toEqual([]);
  });

  // Boundary case required by the problem statement: rapid keystrokes,
  // back-and-forth searching. The debounce must override any intermediate keystrokes...
  it("ne lance qu'une requête pour une frappe rapide", async () => {
    const { rerender } = renderHookWithQuery("t");

    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ query: "to" });

    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ query: "tor" });

    await runDebounce();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain("q=tor");
  });

  // ...and a query that has already been sent must be canceled
  // so that an outdated response does not overwrite a more recent result
  it("annule la requête en vol quand la recherche change", async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");
    fetchMock.mockReturnValue(new Promise(() => {})); // never gets resolved

    const { rerender } = renderHookWithQuery("tor");
    await runDebounce();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(abortSpy).not.toHaveBeenCalled();

    rerender({ query: "torv" });

    expect(abortSpy).toHaveBeenCalledTimes(1);
  });

  it("vide les résultats quand la recherche est effacée", async () => {
    const { result, rerender } = renderHookWithQuery("torvalds");
    await runDebounce();
    expect(result.current.users).toEqual([torvalds]);

    rerender({ query: "" });

    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBe("");
  });
});
