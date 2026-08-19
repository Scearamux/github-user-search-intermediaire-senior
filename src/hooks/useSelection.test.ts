import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSelection } from "./useSelection";
import type { GithubUser } from "../types/github";

const users: GithubUser[] = [
  { id: 1, login: "a", avatar_url: "", html_url: "" },
  { id: 2, login: "b", avatar_url: "", html_url: "" },
  { id: 3, login: "c", avatar_url: "", html_url: "" },
];

function renderSelection(query = "torvalds", list: GithubUser[] = users) {
  return renderHook(({ users, query }) => useSelection(users, query), {
    initialProps: { users: list, query },
  });
}

describe("useSelection", () => {
  it("démarre sans rien de sélectionné", () => {
    const { result } = renderSelection();

    expect(result.current.selectedIds.size).toBe(0);
    expect(result.current.areAllSelected).toBe(false);
  });

  it("bascule la sélection d'un utilisateur", () => {
    const { result } = renderSelection();

    act(() => {
      result.current.toggleSelect(2);
    });
    expect(result.current.selectedIds.has(2)).toBe(true);

    act(() => {
      result.current.toggleSelect(2);
    });
    expect(result.current.selectedIds.has(2)).toBe(false);
  });

  it("sélectionne tout puis désélectionne tout", () => {
    const { result } = renderSelection();

    act(() => {
      result.current.toggleSelectAll();
    });
    expect(result.current.selectedIds.size).toBe(3);
    expect(result.current.areAllSelected).toBe(true);

    act(() => {
      result.current.toggleSelectAll();
    });
    expect(result.current.selectedIds.size).toBe(0);
    expect(result.current.areAllSelected).toBe(false);
  });

  // Safety net: Without the condition `users.length > 0`, an empty list would result in
  // areAllSelected === true (0 === 0) and would check the “Select All” box even when empty
  it("ne considère pas une liste vide comme entièrement sélectionnée", () => {
    const { result } = renderSelection("torvalds", []);

    expect(result.current.areAllSelected).toBe(false);
  });

  // Requirement in the problem statement: “these actions [...] will be reset when the search changes.”
  it("vide la sélection quand la recherche change", () => {
    const { result, rerender } = renderSelection("tor");

    act(() => {
      result.current.toggleSelectAll();
    });
    expect(result.current.selectedIds.size).toBe(3);

    rerender({ users, query: "torv" });

    expect(result.current.selectedIds.size).toBe(0);
  });

  it("conserve la sélection tant que la recherche ne change pas", () => {
    const { result, rerender } = renderSelection("tor");

    act(() => {
      result.current.toggleSelect(1);
    });

    // New list (e.g., after duplication) but same search
    rerender({ users: [...users], query: "tor" });

    expect(result.current.selectedIds.has(1)).toBe(true);
  });
});
