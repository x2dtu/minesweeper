# Minesweeper
I've always loved playing Minesweeper on my computer and phone, so I wanted to create a Minesweeper program of my own so I could appreciate more how the game works. I made this Minesweeper app using TypeScript, and as my first TypeScript project, it was really cool learning how to use TypeScript and its many advantages over Javascript when designing a program. As always, please email me at 3069391@gmail.com or comment on this project page should you have any questions about the game, suggestions for further improvement, or have found any bugs.

## Screenshots
Starting up the game, you will see a menu where you can select your difficulty. The higher the difficulty, the more mines there will be. <br/><br/>
![image](https://user-images.githubusercontent.com/82241006/211665985-f9a9a2a6-ed72-4e15-a598-5f64ef03024e.png) <br/><br/>

Left clicking will reveal a tile. Right clicking will flag a tile. Clicking on a mine will lose the game, but flagging every mine will win you the game. The numbers on each revealed tile indicate how many mines are adjacent to it (counting diagonals, so there are 8 adjacent tiles for every tile). For example, a tile marked with 2 will have 2 mines adjacent to it. Clicking on a revealed tile of value `n` when it has `n` flags adjacent to it will reveal all adjacent non-flagged tiles. If one of these revealed tiles happens to be a mine (in which case you made a mistake with flagging a non-mine tile), you will lose the game. A timer at the top shows how long you have taken. <br/>
![minesweeper_1](https://user-images.githubusercontent.com/82241006/211667612-3007cd3f-61f3-44db-8dba-a798182d992e.gif) <br/><br/>
Winning the game:<br/>
![minesweeper_won](https://user-images.githubusercontent.com/82241006/211671798-779c451f-b047-43bb-9ff2-042c6129fbf1.gif)
Losing the game: <br/>
![minesweeper_lost](https://user-images.githubusercontent.com/82241006/211671867-1f144037-db36-4f28-a234-c901d5b3f946.gif)
<br/><br/>
There is mobile support too -> The timer and flag count remaining will be fixed to the screen at the top while the grid can be scrolled through.

## Setup Instructions
1. First, download the source code, either by executing a `git clone https://github.com/x2dtu/minesweeper.git` in a terminal or downloading the project as a zip through the Github page and extracting that zip.
2. This project uses npm and node to run, so make sure to have both installed on your computer before you try to run this. <br>
In a terminal at the project directory,
3. Run `npm install` to install the necessary packages.
4. Run `npm start` to start the app. Enjoy!

