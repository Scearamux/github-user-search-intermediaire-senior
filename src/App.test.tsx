import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import type { GithubUser } from "./types/github";

const DEBOUNCE_MS = 400;

const users: GithubUser[] = [
  {
    id: 1,
    login: "torvalds",
    avatar_url: "https://avatars/1",
    html_url: "https://github.com/torvalds",
  },
  {
    id: 2,
    login: "pmt",
    avatar_url: "https://avatars/2",
    html_url: "https://github.com/pmt",
  },
];

function response(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

// Enters a search and bypasses the debounce
async function search(query: string) {
  fireEvent.change(screen.getByPlaceholderText(/Rechercher/i), {
    target: { value: query },
  });
  await act(async () => {
    vi.advanceTimersByTime(DEBOUNCE_MS);
  });
}

const enterEditMode = () =>
  fireEvent.click(screen.getByRole("button", { name: /Mode édition/i }));

const cards = () => screen.queryAllByRole("link", { name: "View profile" });

beforeEach(() => {
  vi.useFakeTimers();
  fetchMock = vi.fn().mockResolvedValue(response({ items: users, total_count: users.length }));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("App", () => {
  it("affiche les résultats sans validation du formulaire", async () => {
    render(<App />);
    await search("torvalds");

    expect(screen.getByText("torvalds")).toBeInTheDocument();
    expect(cards()).toHaveLength(2);
  });

  it("masque les outils d'édition par défaut", async () => {
    render(<App />);
    await search("torvalds");

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByText(/elements selected/)).not.toBeInTheDocument();
  });

  it("révèle checkboxes, select all et actions en mode édition", async () => {
    render(<App />);
    await search("torvalds");
    enterEditMode();

    // 2 cards + the “Select All” checkbox
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
    expect(screen.getByText(/0 elements selected/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Dupliquer la sélection" }),
    ).toBeInTheDocument();
  });

  it("duplique les éléments sélectionnés puis vide la sélection", async () => {
    render(<App />);
    await search("torvalds");
    enterEditMode();

    fireEvent.click(screen.getByRole("checkbox", { name: /torvalds/ }));
    expect(screen.getByText(/1 elements selected/)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Dupliquer la sélection" }),
    );

    expect(cards()).toHaveLength(3);
    expect(screen.getAllByText("torvalds")).toHaveLength(2);
    expect(screen.getByText(/0 elements selected/)).toBeInTheDocument();
  });

  it("supprime les éléments sélectionnés", async () => {
    render(<App />);
    await search("torvalds");
    enterEditMode();

    fireEvent.click(screen.getByRole("checkbox", { name: /Sélectionner pmt/ }));
    fireEvent.click(
      screen.getByRole("button", { name: "Supprimer la sélection" }),
    );

    expect(cards()).toHaveLength(1);
    expect(screen.queryByText("pmt")).not.toBeInTheDocument();
  });

  // Requirement in the problem statement: The selection is reset to zero whenever the search changes
  // otherwise, an action would target IDs that no longer exist
  it("réinitialise la sélection quand la recherche change", async () => {
    render(<App />);
    await search("torvalds");
    enterEditMode();

    fireEvent.click(screen.getByRole("checkbox", { name: /torvalds/ }));
    expect(screen.getByText(/1 elements selected/)).toBeInTheDocument();

    await search("torvaldsx");

    expect(screen.getByText(/0 elements selected/)).toBeInTheDocument();
  });

  // Regression: the empty-state message is driven by the API count, not by
  // `users.length`. Deleting every card is not the same as finding nothing.
  it("n'annonce pas l'absence de résultat après suppression de toutes les cartes", async () => {
    render(<App />);
    await search("torvalds");
    enterEditMode();

    // The "select all" checkbox is named by its wrapping label ("0 elements selected").
    fireEvent.click(screen.getByRole("checkbox", { name: /elements selected/i }));
    fireEvent.click(
      screen.getByRole("button", { name: "Supprimer la sélection" }),
    );

    expect(cards()).toHaveLength(0);
    expect(screen.queryByText(/Aucun résultat trouvé/i)).not.toBeInTheDocument();
  });

  it("annonce l'absence de résultat", async () => {
    fetchMock.mockResolvedValue(response({ items: [], total_count: 0 }));

    render(<App />);
    await search("zzzzzzzz");

    expect(screen.getByText(/Aucun résultat trouvé/i)).toBeInTheDocument();
  });

  it("annonce le rate limit via un rôle alert", async () => {
    fetchMock.mockResolvedValue(response({}, 403));

    render(<App />);
    await search("torvalds");

    expect(screen.getByRole("alert")).toHaveTextContent(/limite de requêtes/i);
  });
});
