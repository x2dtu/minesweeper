import "../styles/Tile.css";
import Box from "@mui/material/Box";
import FlagIcon from "@mui/icons-material/Flag";
import CoronavirusIcon from "@mui/icons-material/Coronavirus";
import React, { useState } from "react";
import { TileState, Action } from "../App";

const colors: string[] = [
  "black",
  "#0000ff",
  "#008200",
  "#fe0000",
  "#000084",
  "#840000",
  "#008284",
  "#840084",
  "#757575",
];

type Props = {
  state: TileState;
  dispatch: React.Dispatch<Action>;
  size: number;
  x: number;
  y: number;
};

type LocalState = "clicked" | "flagged" | "untouched";

const Tile = ({ state, size, dispatch, x, y }: Props) => {
  const { value, flagged, isBomb, revealed } = state;

  const [localState, setLocalState] = useState<LocalState>(
    flagged ? "flagged" : revealed ? "clicked" : "untouched"
  );

  function onRightClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.preventDefault();
    setLocalState("flagged");
    dispatch({ type: "flag", payload: { x, y } });
  }

  function onLeftClick() {
    console.log("clicked");
    setLocalState("clicked");
    dispatch({ type: "click", payload: { x, y } });
  }

  function showTileValue() {
    if (localState === "clicked" && isBomb) {
      return <CoronavirusIcon />;
    }
    if (localState === "flagged") {
      return <FlagIcon />;
    }
    if (localState === "clicked" && value) {
      return value;
    }
    return null; // output nothing
  }

  return (
    <Box
      bgcolor="lightgray"
      width={size}
      height={size}
      alignItems="center"
      display="flex"
      justifyContent="center"
      fontSize={size * 4 + "%"}
      // boxShadow="0 0 0 3px gray"
      border="1.5px solid gray"
      onClick={onLeftClick}
      onContextMenu={onRightClick}
      color={flagged ? "red" : colors[value]}
    >
      {showTileValue()}
    </Box>
  );
};

export default Tile;
