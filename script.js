/*
++++++++++
|  Model |
++++++++++
*/
class Player {
  constructor(name, mark) {
    this.name = name;
    this.mark = mark;
  }
}

function createGameBoard(rows, columns) {
  const grid = Array(rows)
    .fill(null)
    .map(() => Array(columns).fill(null));

  const size = rows;

  function getGrid() {
    return grid;
  }

  function isCellAvailable(x, y) {
    if (x < 0 || x >= rows || y < 0 || y >= columns) {
      return false;
    }
    return !grid[x][y];
  }

  function setMarkAt(x, y, mark) {
    if (isCellAvailable(x, y)) {
      grid[x][y] = mark;
      return true;
    }
    return false;
  }

  function checkRows(mark) {
    return grid.some((row) => row.every((cell) => cell === mark));
  }

  function checkColumns(mark) {
    return grid[0].some((_, col) => grid.every((row) => row[col] === mark));
  }

  function checkDiagonals(mark) {
    const mainDiagonal = grid.every((row, i) => row[i] === mark);
    const antiDiagonal = grid.every((row, i) => row[size - 1 - i] === mark);
    return mainDiagonal || antiDiagonal;
  }

  function checkWinCondition(mark) {
    return checkRows(mark) || checkColumns(mark) || checkDiagonals(mark);
  }

  function checkDrawCondition() {
    return grid.every((row) => row.every((cell) => cell !== null));
  }

  return {
    getGrid,
    isCellAvailable,
    setMarkAt,
    checkWinCondition,
    checkDrawCondition,
  };
}

/*
++++++++++
|  View  |
++++++++++
*/

class AbstractView {
  constructor() {
    if (new.target === AbstractView) {
      throw new TypeError("Cannot construct AbstractView instances directly");
    }
  }

  displayGrid(grid) {
    throw new Error("Method 'displayGrid' must be implemented");
  }

  displayMessage(turn) {
    throw new Error("Method 'displayMessage' must be implemented");
  }

  displayErrorMessage() {
    throw new Error("Method 'displayErrorMessage' must be implemented");
  }

  getUserInput() {
    throw new Error("Method 'getUserInput' must be implemented");
  }

  displayWinner(turn) {
    throw new Error("Method 'displayWinner' must be implemented");
  }
}
class ConsoleView extends AbstractView {
  displayGrid(grid) {
    grid.forEach((row) => {
      console.log(row.map((cell) => (cell === null ? "." : cell)).join(" "));
    });
  }

  displayMessage(turn) {
    console.log(`Its ${turn.name}s turn with ${turn.mark}.`);
  }

  displayErrorMessage() {
    console.log(`The cell is already marked please choose another cell.`);
  }

  getUserInput() {
    let userInput = prompt(
      `To mark a cell, please enter row and column numbers separated by comma for example: 2,1`
    );
    return userInput.split(",");
  }

  displayWinner(turn) {
    console.log(`Winner is ${turn.name} with ${turn.mark} mark`);
  }
}

class DOMView extends AbstractView {
  displayGrid(grid) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const cellId = `r${i}c${j}`;
        const cell = document.getElementById(cellId);
        cell.textContent = grid[i][j] || "";
      }
    }
  }

  displayMessage(turn) {
    const message = document.querySelector(".message");
    message.textContent = `${turn.mark.toUpperCase()} TURN`;
  }

  displayErrorMessage() {
    const message = document.querySelector(".message");
    message.textContent = `\nThe cell is already marked please choose another cell.`;
  }

  getUserInput() {
    return new Promise((resolve) => {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const cellId = `r${i}c${j}`;
          const cell = document.getElementById(cellId);
          cell.addEventListener("click", (event) => {
            const row = parseInt(event.target.dataset.row);
            const col = parseInt(event.target.dataset.col);
            resolve([row, col]);
          });
        }
      }
    });
  }

  displayWinner(turn) {
    const message = document.querySelector(".message");
    message.textContent = `${
      turn.name
    } with ${turn.mark.toUpperCase()} mark Wins the Game`;
  }
}
/*
+++++++++++++++
|  Controller |
+++++++++++++++
*/

class GameController {
  constructor(rows, columns, playerOneName, playerTwoName, view) {
    if (!(view instanceof AbstractView)) {
      throw new Error("View must inherit from AbstractView");
    }
    this.view = view;

    this.gameBoard = createGameBoard(rows, columns);
    this.playerX = new Player(playerOneName, "X");
    this.playerO = new Player(playerTwoName, "O");

    this.gameOver = false;
    this.turn = this.playerX;
  }

  takeTurn() {
    return this.turn === this.playerX ? this.playerO : this.playerX;
  }

  async startGame() {
    while (!this.gameOver) {
      this.view.displayGrid(this.gameBoard.getGrid());
      this.view.displayMessage(this.turn);

      try {
        let userInput = await this.view.getUserInput();

        let row = parseInt(userInput[0]);
        let col = parseInt(userInput[1]);

        let success = this.gameBoard.isCellAvailable(row, col);

        if (success) {
          this.gameBoard.setMarkAt(row, col, this.turn.mark);
          this.gameOver = this.gameBoard.checkWinCondition(this.turn.mark);

          if (!this.gameOver) {
            this.turn = this.takeTurn();
          }
        } else {
          this.view.displayErrorMessage();
        }
      } catch (error) {
        console.error("Error getting user input:", error);
      }
    }

    this.view.displayGrid(this.gameBoard.getGrid());
    this.view.displayWinner(this.turn);
  }
}

const cont = new GameController(3, 3, "A", "Z", new DOMView());
cont.startGame();
