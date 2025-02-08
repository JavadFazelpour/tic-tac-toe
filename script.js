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
class ConsoleView {
  static printGrid(grid) {
    grid.forEach((row) => {
      console.log(row.map((cell) => (cell === null ? "." : cell)).join(" "));
    });
  }

  static printMessage(turn) {
    console.log(`Its ${turn.name}s turn with ${turn.mark}.`);
  }

  static printErrorMessage() {
    console.log(`The cell is already marked please choose another cell.`);
  }

  static getUserInput() {
    let userInput = prompt(
      `To mark a cell, please enter row and column numbers separated by comma for example: 2,1`
    );
    return userInput.split(",");
  }

  static printWinner(turn) {
    console.log(`Winner is ${turn.name} with ${turn.mark} mark`);
  }
}
