import { Box } from "@mui/material";
import { Stack } from "@mui/system";
import { useReducer, useRef } from "react";
import Tile from "./components/Tile";

function shuffleArray(array: TileState[][]) {
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

function countNeighbors(array: TileState[][], row: number, col: number) {
  if (array[row][col].isBomb) {
    // then we are a bomb, so don't change anything
    return;
  }
  for (let i = row - 1; i <= row + 1; i++) {
    for (let j = col - 1; j <= col + 1; j++) {
      if (i < 0 || j < 0 || i >= array.length || j >= array[0].length) {
        continue;
      }
      if (array[i][j].isBomb) {
        // if there is a neighbor bomb
        array[row][col].value++; // increment this tile spot's value then
      }
    }
  }
}

export type Action =
  | { type: "click"; payload: { x: number; y: number } }
  | {
      type: "flag";
      payload: { x: number; y: number; locallyFlagged: boolean };
    };

type State = { grid: TileState[][]; bombsLeft: number };

export type TileState = {
  isBomb: boolean;
  value: number;
  revealed: boolean;
  flagged: boolean;
};

/* Counts number of flags adjacent to tile specified by x, y coords */
function countFlagNeigbors(state: TileState[][], x: number, y: number): number {
  let count = 0;
  for (let i = x - 1; i <= x + 1; i++) {
    for (let j = y - 1; j <= y + 1; j++) {
      if (i < 0 || j < 0 || i >= state.length || j >= state[0].length) {
        continue;
      }
      if (state[i][j].flagged) {
        count++;
      }
    }
  }
  return count;
}

function reveal(state: TileState[][], x: number, y: number): void {
  if (state[x][y].flagged) {
    return;
  }
  state[x][y].revealed = true;
  if (state[x][y].isBomb) {
    // throw new Error("Game Over");
    console.error("game over");
    return;
  }
  if (state[x][y].value > 0) {
    return; // base case
  }
  // else, we hit an 'empty' tile, so reveal everything around it
  for (let i = x - 1; i <= x + 1; i++) {
    for (let j = y - 1; j <= y + 1; j++) {
      if (
        i < 0 ||
        j < 0 ||
        i >= state.length ||
        j >= state[0].length ||
        state[i][j].revealed ||
        state[i][j].flagged
      ) {
        continue;
      }
      reveal(state, i, j);
    }
  }
}

function reducer(state: State, { type, payload }: Action): State {
  const { grid, bombsLeft } = state;
  const currTile = grid[payload.x][payload.y];

  switch (type) {
    case "click": {
      if (currTile.flagged) {
        return state; // do nothing if we are flagged
      }
      if (
        currTile.revealed &&
        currTile.value &&
        countFlagNeigbors(grid, payload.x, payload.y) === currTile.value
      ) {
        /* if this is the case, then we will have clicked on an already revealed tile
           in order to auto-reveal adjacent tiles */
        for (let i = payload.x - 1; i <= payload.x + 1; i++) {
          for (let j = payload.y - 1; j <= payload.y + 1; j++) {
            if (i < 0 || j < 0 || i >= grid.length || j >= grid[0].length) {
              continue;
            }
            reveal(grid, i, j);
          }
        }
        return { ...state };
      }

      // else we are clicking on this tile for the first time
      grid[payload.x][payload.y].revealed = true;
      if (currTile.isBomb) {
        // then end game - we clicked on a bomb
        // throw new Error("Game Over");
        console.error("game over");
        return state;
      }
      if (currTile.value === 0) {
        reveal(grid, payload.x, payload.y);
        return { ...state };
      }
      // reveal any adjacent squares if they are empty
      for (let i = payload.x - 1; i <= payload.x + 1; i++) {
        for (let j = payload.y - 1; j <= payload.y + 1; j++) {
          if (
            i < 0 ||
            j < 0 ||
            i >= grid.length ||
            j >= grid[0].length ||
            grid[i][j].isBomb ||
            grid[i][j].revealed ||
            grid[i][j].value
          ) {
            continue;
          }
          reveal(grid, i, j);
        }
      }

      return { ...state };
    }
    case "flag": {
      debugger;
      if (currTile.revealed || currTile.flagged === payload.locallyFlagged) {
        return state;
      }
      grid[payload.x][payload.y].flagged = payload.locallyFlagged;
      if (payload.locallyFlagged) {
        state.bombsLeft--;
      } else {
        state.bombsLeft++; // we retracted a flag
      }
      return { ...state };
    }
    default:
      throw new Error("Unknown action");
  }
}
const numBombs = 30;

function initGrid(): TileState[][] {
  // initialize variables
  const defaultTile: TileState = {
    isBomb: false,
    revealed: false,
    flagged: false,
    value: 0,
  };
  const [gridRowCount, gridColCount] = [12, 30];
  const initialGrid: TileState[][] = Array.from(
    {
      length: gridRowCount,
      // inside map function generate array of size n
      // and fill it with `0`
    },
    () => {
      const a = new Array(gridColCount);
      for (let i = 0; i < a.length; i++) {
        a[i] = { ...defaultTile };
      }
      return a;
    }
  );
  let [row, col] = [0, 0];

  for (let i = 0; i < numBombs; i++) {
    initialGrid[row][col].isBomb = true;
    col++;
    if (col === gridColCount) {
      col = 0;
      row++;
    }
  }

  // shuffle bombs spots
  shuffleArray(initialGrid);

  // update non bomb spots to show correct number of bomb neighbors
  for (let row = 0; row < initialGrid.length; row++) {
    for (let col = 0; col < initialGrid[0].length; col++) {
      countNeighbors(initialGrid, row, col);
    }
  }
  return initialGrid;
}
const initialState: State = { grid: initGrid(), bombsLeft: numBombs };

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const keyObj = useRef(0);

  const tileSize = 50;

  // create list of tiles from value grid
  const tiles: JSX.Element[] = state.grid
    .map((row, rowIndex) =>
      row.map((tileState, colIndex) => (
        <Tile
          state={tileState}
          size={tileSize}
          dispatch={dispatch}
          key={keyObj.current++}
          x={rowIndex}
          y={colIndex}
        />
      ))
    )
    .flat();

  return (
    <div className="App">
      <Stack display="flex" m={2} spacing={2}>
        <Box pr={1} marginLeft="auto">{`Bombs Left: ${state.bombsLeft}`}</Box>
        <Box display="flex" width="max-content" maxWidth="100%" flexWrap="wrap">
          {tiles}
        </Box>
      </Stack>
    </div>
  );
}

export default App;
