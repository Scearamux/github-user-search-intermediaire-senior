import { useEffect, useState } from "react";
import type { GithubUser } from "../types/github";

export function useSelection(users: GithubUser[], query: string) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setSelectedIds(new Set());
  }, [query]);

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

  return {
    selectedIds,
    setSelectedIds,
    toggleSelect,
    toggleSelectAll,
    areAllSelected,
  };
}
