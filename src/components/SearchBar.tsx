import "./SearchBar.css";

interface SearchBarProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// Controlled search field, no form or button live input is handled by the debounce in the hook
function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="search-bar">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Rechercher un utilisateur Github..."
      />
    </div>
  );
}

export default SearchBar;
