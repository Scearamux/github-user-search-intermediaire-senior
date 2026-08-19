import "./SelectionBar.css";

interface SelectionBarProps {
  selectedCount: number;
  areAllSelected: boolean;
  onToggleSelectAll: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function SelectionBar({
  selectedCount,
  areAllSelected,
  onToggleSelectAll,
  onDuplicate,
  onDelete,
}: SelectionBarProps) {
  return (
    <div className="selection-bar">
      <label>
        <input
          type="checkbox"
          checked={areAllSelected}
          onChange={onToggleSelectAll}
        />
        {selectedCount} elements selected
      </label>

      <div className="selection-bar__actions">
        <button
          type="button"
          onClick={onDuplicate}
          disabled={selectedCount === 0}
          aria-label="Dupliquer la sélection"
        >
          <span className="material-symbols-outlined">content_copy</span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={selectedCount === 0}
          aria-label="Supprimer la sélection"
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  );
}

export default SelectionBar;
