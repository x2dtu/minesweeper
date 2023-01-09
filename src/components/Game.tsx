import { Box, Paper, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Stack } from "@mui/system";
import { useEffect, useReducer, useRef, useState } from "react";
import { Difficulty } from "../App";
import Tile from "./Tile";
import { styled } from "@mui/material/styles";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import Flag from "@mui/icons-material/Flag";

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
  | {
      type: "click";
      payload: { x: number; y: number };
    }
  | {
      type: "flag";
      payload: { x: number; y: number; locallyFlagged: boolean };
    }
  | {
      type: "play-again";
      payload: null;
    };

type GameResult = "win" | "loss";

type State = {
  grid: TileState[][];
  bombsLeft: number; // original bomb count - # flags placed
  trueBombsLeft: number; // how many bombs are actually left
  dialogOpen: boolean;
  gameResult: GameResult;
};

export type TileState = {
  isBomb: boolean;
  value: number;
  revealed: boolean;
  flagged: boolean;
};

/* Counts number of flags adjacent to tile specified by x, y coords */
function countFlagNeigbors(grid: TileState[][], x: number, y: number): number {
  let count = 0;
  for (let i = x - 1; i <= x + 1; i++) {
    for (let j = y - 1; j <= y + 1; j++) {
      if (i < 0 || j < 0 || i >= grid.length || j >= grid[0].length) {
        continue;
      }
      if (grid[i][j].flagged) {
        count++;
      }
    }
  }
  return count;
}

function reveal(grid: TileState[][], x: number, y: number): void {
  if (grid[x][y].flagged) {
    return;
  }
  grid[x][y].revealed = true;
  if (grid[x][y].isBomb) {
    throw new Error("Game Over");
  }
  if (grid[x][y].value > 0) {
    return; // base case
  }
  // else, we hit an 'empty' tile, so reveal everything around it
  for (let i = x - 1; i <= x + 1; i++) {
    for (let j = y - 1; j <= y + 1; j++) {
      if (
        i < 0 ||
        j < 0 ||
        i >= grid.length ||
        j >= grid[0].length ||
        grid[i][j].revealed ||
        grid[i][j].flagged
      ) {
        continue;
      }
      reveal(grid, i, j);
    }
  }
}

function revealUnflaggedBombs(grid: TileState[][]) {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j].isBomb && !grid[i][j].flagged) {
        grid[i][j].revealed = true;
      }
    }
  }
}

const InfoBox = styled(Paper)({
  backgroundColor: "#e0e0e0",
  padding: "0.5em 2.5em",
  display: "flex",
  width: "7em",
  // borderRadius: "50%",
  elevaton: 10,
  justifyContent: "space-evenly",
  margin: "0 3em",
}) as typeof Paper;

type Props = { menuCallback: () => void; difficulty: Difficulty };

function App({ menuCallback, difficulty }: Props) {
  function reducer(state: State, { type, payload }: Action): State {
    const { grid } = state;

    try {
      switch (type) {
        case "click": {
          const currTile = grid[payload.x][payload.y];
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
            revealUnflaggedBombs(state.grid);
            return { ...state, dialogOpen: true };
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
          const currTile = grid[payload.x][payload.y];

          if (
            currTile.revealed ||
            currTile.flagged === payload.locallyFlagged
          ) {
            return state;
          }
          grid[payload.x][payload.y].flagged = payload.locallyFlagged;

          if (payload.locallyFlagged) {
            // if this, then we added a flag which means there should be one less unaccounted bomb
            state.bombsLeft--;
            if (grid[payload.x][payload.y].isBomb) {
              state.trueBombsLeft--; // then we actually marked a bomb
            }

            if (state.trueBombsLeft === 0) {
              // then we won; there are no bombs left unmarked
              state.gameResult = "win";
              state.dialogOpen = true;
            }
          } else {
            state.bombsLeft++; // we retracted a flag
            if (grid[payload.x][payload.y].isBomb) {
              state.trueBombsLeft++; // then we actually unmarked a bomb
            }
          }
          return { ...state };
        }
        case "play-again": {
          return initState();
        }
      }
    } catch (error) {
      // we lost the game if there was an error thrown from reveal()
      revealUnflaggedBombs(state.grid);
      return { ...state, dialogOpen: true };
    }
  }
  const [gridRowCount, gridColCount] = [12, 30];
  const numBombs =
    difficulty === "easy" ? 30 : difficulty === "medium" ? 50 : 70;

  function initGrid(): TileState[][] {
    // initialize variables
    const defaultTile: TileState = {
      isBomb: false,
      revealed: false,
      flagged: false,
      value: 0,
    };
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

  function initState(): State {
    return {
      grid: initGrid(),
      bombsLeft: numBombs,
      trueBombsLeft: numBombs,
      dialogOpen: false,
      gameResult: "loss", // loss is default
    };
  }

  const [state, dispatch] = useReducer(reducer, initState());

  const keyObj = useRef(0);

  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setTimeElapsed((time) => time + 1),
      1000
    );
    return () => clearInterval(interval);
  }, []);

  function onDialogClose() {
    dispatch({ type: "play-again", payload: null });
  }

  // create list of tiles from value grid
  const tiles: JSX.Element[] = state.grid.map((row, rowIndex) => (
    <Box display="flex">
      {row.map((tileState, colIndex) => (
        <Tile
          state={tileState}
          dispatch={dispatch}
          key={keyObj.current++}
          x={rowIndex}
          y={colIndex}
        />
      ))}
    </Box>
  ));

  return (
    <div className="App">
      <Stack display="flex" m={2} spacing={2} overflow="auto">
        <Box
          style={{
            position: "fixed",
            left: "50%",
            transform: "translate(-50%, 0)",
          }}
          display="flex"
          justifyContent="center"
        >
          <InfoBox>
            <TimerOutlinedIcon />
            <Typography sx={{ pl: 1.5 }}>{timeElapsed}</Typography>{" "}
          </InfoBox>
          <InfoBox>
            <Flag sx={{ color: "red" }} />
            <Typography sx={{ pl: 1.5 }}>{state.bombsLeft}</Typography>
          </InfoBox>
        </Box>
        <Box
          pt={6}
          display="flex"
          width="max-content"
          maxWidth="100%"
          flexWrap="wrap"
        >
          {tiles}
        </Box>
        <Dialog open={state.dialogOpen} onClose={() => onDialogClose()}>
          {state.gameResult === "loss" ? (
            <DialogTitle textAlign="center" color="#da012d">
              Game Over
            </DialogTitle>
          ) : (
            <DialogTitle textAlign="center">You Win!</DialogTitle>
          )}
          <DialogContent>
            {state.gameResult === "loss" ? (
              <DialogContentText textAlign="center" gutterBottom>
                You blew up a mine
              </DialogContentText>
            ) : (
              <DialogContentText textAlign="center" gutterBottom>
                Thanks for playing!
              </DialogContentText>
            )}

            <Stack
              direction="row"
              spacing={1}
              textAlign="center"
              justifyContent="center"
              display="flex"
              alignItems="center"
            >
              <Button onClick={() => menuCallback()}>Menu</Button>
              <Button
                sx={{
                  color: "#138808",
                }}
                onClick={() => onDialogClose()}
              >
                Play Again
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>
      </Stack>
    </div>
  );
}

export default App;
