import "./EditModeToggle.css";

interface EditModeToggleProps {
  isEditMode: boolean;
  onToggle: () => void;
}

// Edit mode toggle button `aria-pressed` serves both accessibility purposes and as a CSS state selector
function EditModeToggle({ isEditMode, onToggle }: EditModeToggleProps) {
  return (
    <button
      type="button"
      className="edit-mode-toggle"
      onClick={onToggle}
      aria-pressed={isEditMode}
    >
      <span className="material-symbols-outlined">edit</span>
      Mode édition
    </button>
  );
}

export default EditModeToggle;
