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

  startGame() {
    do {
      this.view.displayGrid(this.gameBoard.getGrid());
      this.view.displayMessage(this.turn);
      let userInput = this.view.getUserInput();
      let success = this.gameBoard.isCellAvailable(userInput[0], userInput[1]);
      if (success) {
        this.gameBoard.setMarkAt(userInput[0], userInput[1], this.turn.mark);
        this.gameOver = this.gameBoard.checkWinCondition(this.turn.mark);
        if (!this.gameOver) this.turn = this.takeTurn();
      } else {
        this.view.displayErrorMessage();
      }
    } while (!this.gameOver);

    this.view.displayGrid(this.gameBoard.getGrid());
    this.view.displayWinner(this.turn);
  }
}
