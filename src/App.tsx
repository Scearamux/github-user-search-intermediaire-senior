import { useState } from "react";
import "./App.css";

function App() {
  const [query, setQuery] = useState<string>("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  return (
    <div>
      <h1>Github User Search</h1>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Rechercher un utilisateur Github..."
      />
    </div>
  );
}

export default App;
