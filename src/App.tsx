import { Box } from "@mui/material";
import { useRef } from "react";
import Tile from "./components/Tile";

function shuffleArray(array: number[][]) {
  for (let row = array.length - 1; row > 0; row--) {
    for (let col = array[0].length - 1; col > 0; col--) {
      // find indices i and j to shuffle current row and col with
      const i = Math.floor(Math.random() * (row + 1));
      const j = Math.floor(Math.random() * (col + 1));
      // swap
      [array[row][col], array[i][j]] = [array[i][j], array[row][col]];
    }
  }
}

function countNeighbors(array: number[][], row: number, col: number) {
  if (array[row][col] === -1) {
    // then we are a bomb, so don't change anything
    return;
  }
  for (let i = row - 1; i <= row + 1; i++) {
    for (let j = col - 1; j <= col + 1; j++) {
      if (i < 0 || j < 0 || i >= array.length || j >= array[0].length) {
        continue;
      }
      if (array[i][j] === -1) {
        // if there is a neighbor bomb
        array[row][col]++; // increment this tile spot's value then
      }
    }
  }
}

function App() {
  const keyObj = useRef(0);

  // initialize variables
  const [gridRowCount, gridColCount] = [12, 30];
  const grid: number[][] = Array.from(
    {
      length: gridRowCount,
      // inside map function generate array of size n
      // and fill it with `0`
    },
    () => new Array(gridColCount).fill(0)
  );
  const numBombs = 30;
  let [row, col] = [0, 0];
  const tileSize = 50;

  // mark bomb spots initially. bomb spots are -1
  for (let i = 0; i < numBombs; i++) {
    grid[row][col] = -1;
    col++;
    if (col === gridColCount) {
      col = 0;
      row++;
    }
  }

  // shuffle bombs spots
  shuffleArray(grid);

  // update non bomb spots to show correct number of bomb neighbors
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      countNeighbors(grid, row, col);
    }
  }

  // create list of tiles from value grid
  const tiles: JSX.Element[] = grid
    .map((row) =>
      row.map((value) => (
        <Tile
          value={Math.max(value, 0)}
          size={tileSize}
          isBomb={value === -1}
          key={keyObj.current++}
        />
      ))
    )
    .flat();

  return (
    <div className="App">
      <Box
        display="flex"
        width="max-content"
        maxWidth="100%"
        flexWrap="wrap"
        m={2}
      >
        {tiles}
      </Box>
    </div>
  );
}

export default App;
