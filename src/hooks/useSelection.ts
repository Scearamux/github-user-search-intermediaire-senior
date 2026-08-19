import { useEffect, useState } from "react";
import type { GithubUser } from "../types/github";

// Handling multiple selections.
// Use `Set` instead of an array for O(1) operations
//during rendering and to ensure that IDs are unique

export function useSelection(users: GithubUser[], query: string) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // reset when the query changes to prevent actions on obsolete elements during the search debounce
  useEffect(() => {
    setSelectedIds(new Set());
  }, [query]);

  // Copy of the set required to force React to re-render
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

  // Prevents validating selectAll if the list is empty
  const areAllSelected = users.length > 0 && selectedIds.size === users.length;

  const toggleSelectAll = () => {
    if (areAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((user) => user.id)));
    }
  };

  return {
    selectedIds,
    setSelectedIds,
    toggleSelect,
    toggleSelectAll,
    areAllSelected,
  };
}
