import "./EditModeToggle.css";

interface EditModeToggleProps {
  isEditMode: boolean;
  onToggle: () => void;
}

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
