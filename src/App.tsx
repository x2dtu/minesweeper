import { Box } from "@mui/material";
import Tile from "./components/Tile";

function App() {
  return (
    <div className="App">
      <Box
        display="flex"
        width="max-content"
        maxWidth="100%"
        flexWrap="wrap"
        m={2}
      >
        {[...Array(120)].map((_: any, index: number) => (
          <Tile
            key={index}
            value={Math.floor(Math.random() * (8 - 0 + 1) + 0)}
            size={50}
          ></Tile>
        ))}
      </Box>
    </div>
  );
}

export default App;
