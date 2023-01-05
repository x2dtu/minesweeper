import "../styles/Tile.css";
import Box from "@mui/material/Box";
import FlagIcon from "@mui/icons-material/Flag";
import CoronavirusIcon from "@mui/icons-material/Coronavirus";
import React, { useState } from "react";

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

type Props = { value: number; size: number; isBomb: boolean };

const Tile = ({ value, size, isBomb }: Props) => {
  const [clicked, setClicked] = useState(false);
  const [flagged, setFlagged] = useState(false);

  function onRightClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.preventDefault();
    if (clicked) return;
    setFlagged(!flagged);
  }

  function onLeftClick() {
    if (flagged) return;
    setClicked(true);
  }

  function showTileValue() {
    if (clicked && isBomb) {
      return <CoronavirusIcon />;
    }
    if (flagged) {
      return <FlagIcon />;
    }
    if (clicked && value) {
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
      color={clicked ? colors[value] : "red"}
    >
      {showTileValue()}
    </Box>
  );
};

export default Tile;
