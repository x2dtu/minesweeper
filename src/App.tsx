import React, { useState } from "react";
import Menu from "./components/Menu";
import Game from "./components/Game";

export type Difficulty = "easy" | "medium" | "hard";

const App = () => {
  const [menuOpen, setMenuOpen] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  return menuOpen ? (
    <Menu
      menuCallback={() => setMenuOpen(false)}
      difficultyCallback={setDifficulty}
    />
  ) : (
    <Game menuCallback={() => setMenuOpen(true)} difficulty={difficulty} />
  );
};

export default App;
