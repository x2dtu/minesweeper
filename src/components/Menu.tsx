import { Box, Button, Stack, Typography } from "@mui/material";
import React, { useState } from "react";
import { Difficulty } from "../App";

type Props = {
  menuCallback: () => void;
  difficultyCallback: (diff: Difficulty) => void;
};

const Menu = ({ menuCallback, difficultyCallback }: Props) => {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const difficulties: Difficulty[] = ["easy", "medium", "hard"];

  return (
    <Stack
      display="flex"
      justifyContent="center"
      textAlign="center"
      alignItems="center"
      spacing={1}
    >
      <Typography variant="h1" gutterBottom pt={5}>
        Welcome to Minesweeper
      </Typography>
      <Typography gutterBottom>Select a difficulty:</Typography>
      <Stack
        direction="row"
        display="flex"
        spacing={6}
        marginLeft="auto"
        marginRight="auto"
        p={1}
        pb={6}
      >
        {difficulties.map((diff) => (
          <Box flex="1 1 0px">
            <Button
              variant={difficulty === diff ? "outlined" : "text"}
              onClick={() => setDifficulty(diff)}
            >
              {diff}
            </Button>
          </Box>
        ))}
      </Stack>
      <Button
        variant="contained"
        onClick={() => {
          menuCallback();
          difficultyCallback(difficulty);
        }}
      >
        Play
      </Button>
    </Stack>
  );
};

export default Menu;
