import "../styles/Tile.css";
import Box from "@mui/material/Box";
import FlagIcon from "@mui/icons-material/Flag";
import CoronavirusIcon from "@mui/icons-material/Coronavirus";
import React, { useState } from "react";
import { TileState, Action } from "./Game";
import { useMediaQuery, useTheme } from "@mui/material";

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
  x: number;
  y: number;
};

type LocalState = "clicked" | "flagged" | "untouched";

const Tile = ({ state, dispatch, x, y }: Props) => {
  const { value, flagged, isBomb, revealed } = state;

  const [localState, setLocalState] = useState<LocalState>(
    flagged ? "flagged" : revealed ? "clicked" : "untouched"
  );

  function onRightClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.preventDefault();
    if (revealed) return;
    let locallyFlagged: boolean;
    if (localState === "flagged") {
      setLocalState(revealed ? "clicked" : "untouched");
      locallyFlagged = false;
    } else {
      setLocalState("flagged");
      locallyFlagged = true;
    }
    dispatch({
      type: "flag",
      payload: { x, y, locallyFlagged },
    });
  }

  function onLeftClick() {
    if (localState === "flagged") return;
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

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));
  const size = matches ? 50 : 30;
  const stroke = matches ? 1.5 : 0.5;

  return (
    <Box
      bgcolor={revealed ? "lightgray" : "#e0e0e0"}
      width={size}
      height={size}
      alignItems="center"
      display="flex"
      justifyContent="center"
      fontSize={size * 4 + "%"}
      border={`${stroke}px solid gray`}
      onClick={onLeftClick}
      onContextMenu={onRightClick}
      color={localState === "flagged" ? "red" : colors[value]}
    >
      {showTileValue()}
    </Box>
  );
};

export default Tile;
