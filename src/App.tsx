import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import { useReducer, useRef, useEffect, useState } from "react";
import Tile from "./components/Tile";

function shuffleArray(array: State) {
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

function countNeighbors(array: State, row: number, col: number) {
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
  | { type: "flag"; payload: { x: number; y: number } };

type State = TileState[][];

export type TileState = {
  isBomb: boolean;
  value: number;
  revealed: boolean;
  flagged: boolean;
};

/* Counts number of flags adjacent to tile specified by x, y coords */
function countFlagNeigbors(state: State, x: number, y: number): number {
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

function reveal(state: State, x: number, y: number): void {
  state[x][y].revealed = true;
  if (state[x][y].isBomb) {
    throw new Error("Game Over");
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
        state[i][j].revealed
      ) {
        continue;
      }
      reveal(state, i, j);
    }
  }
}

function reducer(state: State, { type, payload }: Action): State {
  const currTile = state[payload.x][payload.y];

  switch (type) {
    case "click": {
      console.log("dispatch");
      if (currTile.flagged) {
        return state; // do nothing if we are flagged
      }
      if (
        currTile.revealed &&
        countFlagNeigbors(state, payload.x, payload.y) === currTile.value
      ) {
        /* if this is the case, then we will have clicked on an already revealed tile
           in order to auto-reveal adjacent tiles */
        for (let i = payload.x - 1; i <= payload.x + 1; i++) {
          for (let j = payload.y - 1; j <= payload.y + 1; j++) {
            if (i < 0 || j < 0 || i >= state.length || j >= state[0].length) {
              continue;
            }
            reveal(state, i, j);
          }
        }
        return state.slice();
      }

      // else we are clicking on this tile for the first time
      state[payload.x][payload.y].revealed = true;
      if (currTile.isBomb) {
        // then end game - we clicked on a bomb
        throw new Error("Game Over");
      }
      if (currTile.value === 0) {
        reveal(state, payload.x, payload.y);
        return state.slice();
      }

      return state;
    }
    case "flag": {
      if (currTile.flagged || currTile.revealed) {
        return state;
      }
      state[payload.x][payload.y].flagged = true;
      return state.slice();
    }
    default:
      throw new Error("Unknown action");
  }
}

function initGrid() {
  // initialize variables
  const defaultTile: TileState = {
    isBomb: false,
    revealed: false,
    flagged: false,
    value: 0,
  };
  const [gridRowCount, gridColCount] = [12, 30];
  const initialState: State = Array.from(
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
  // console.log(initialState);
  const numBombs = 30;
  let [row, col] = [0, 0];

  for (let i = 0; i < numBombs; i++) {
    initialState[row][col].isBomb = true;
    col++;
    if (col === gridColCount) {
      col = 0;
      row++;
    }
  }

  // shuffle bombs spots
  shuffleArray(initialState);
  // console.log("initial state:");
  // console.log(initialState);

  // update non bomb spots to show correct number of bomb neighbors
  for (let row = 0; row < initialState.length; row++) {
    for (let col = 0; col < initialState[0].length; col++) {
      countNeighbors(initialState, row, col);
    }
  }
  return initialState;
}
const initialState = initGrid();
// console.log("initial state:");
// console.log(initialState);

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [buttonState, setButtonState] = useState("hello");
  // let clicks = 0;

  // const callback = (action: Action) => {
  //   dispatch(action);
  //   clicks++;
  // };
  // useEffect(() => {}, [clicks]);

  console.log(state);

  const keyObj = useRef(0);

  const tileSize = 50;

  // create list of tiles from value grid
  const tiles: JSX.Element[] = state
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

  console.log(tiles);

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
