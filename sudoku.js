const EMPTY_CELL = "0";
const GRID_SIZE = 9;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

const sudokuString1 =
  "530070000600195000098000060800060003400803001700020006060000280000419005000080079";
const sudokuString2 =
  "009748000700000000020109000007000240064010590095000100000403060000000004000265900";
const sudokuString3 =
  "300200000000107000706030500070009080900020004010800050009040301000702000000008006";

let isSolving = false;
let shouldStop = false;

async function mainjs() {
  let suitableIndexes = [];
  const falselyInsertedIndexesAndNumbers = new Map();

  // Get current puzzle state
  const inputs = document.querySelectorAll(".cell input");
  const sudoku = Array.from(inputs).map((input) =>
    input.value ? input.value : EMPTY_CELL
  );

  // Find empty cells
  for (let thatIndex = 0; thatIndex < TOTAL_CELLS; thatIndex++) {
    if (sudoku[thatIndex] === EMPTY_CELL) {
      suitableIndexes.push(thatIndex);
    }
  }

  if (suitableIndexes.length === 0) {
    checkSudokuFinished(sudoku);
    return;
  }

  let index = 0;
  while (index >= 0 && index < suitableIndexes.length) {
    if (shouldStop) {
      // Check if we should stop
      isSolving = false;
      setInputsEnabled(true);
      return;
    }

    let currentIndex = suitableIndexes[index];

    // Add delay to visualize the solving process
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Try to solve current cell
    let result = await tryNextNumber(
      sudoku,
      currentIndex,
      falselyInsertedIndexesAndNumbers
    );

    if (result) {
      // Move forward
      index++;
    } else {
      // Backtrack
      sudoku[currentIndex] = EMPTY_CELL;
      falselyInsertedIndexesAndNumbers.delete(currentIndex);
      index--;

      if (index >= 0) {
        // Clear the previous cell's failed attempts when backtracking
        let previousIndex = suitableIndexes[index];
        let currentNumber = sudoku[previousIndex];
        let falseNumbers =
          falselyInsertedIndexesAndNumbers.get(previousIndex) || new Set();
        falseNumbers.add(currentNumber);
        falselyInsertedIndexesAndNumbers.set(previousIndex, falseNumbers);
      }
    }

    updateGrid(sudoku);
    highlightCell(currentIndex);
  }

  if (index >= 0) {
    updateStatus("Sudoku solved!");
  } else {
    updateStatus("No solution found!");
  }
}

async function tryNextNumber(
  solvedSudoku,
  index,
  falselyInsertedIndexesAndNumbers
) {
  let availableNumbersArray = availableNumbers(solvedSudoku, index);

  // Get the set of previously tried numbers for this cell
  let falseNumbersSet =
    falselyInsertedIndexesAndNumbers.get(index) || new Set();

  // Filter out previously tried numbers
  availableNumbersArray = availableNumbersArray.filter(
    (num) => !falseNumbersSet.has(String(num))
  );

  if (availableNumbersArray.length === 0) {
    return false;
  }

  // Try the next available number
  const number = availableNumbersArray[0];
  solvedSudoku[index] = String(number);
  return true;
}

function checkRow(sud, index) {
  let thisRow = [];
  let j = 0;
  const tmp = index;
  let division = 0;
  division = tmp / GRID_SIZE;
  division = Math.floor(division);
  for (let i = division * GRID_SIZE; i < division * GRID_SIZE + 9; i++) {
    thisRow[j] = sud[i];
    j++;
  }

  return thisRow;
}

function checkColumn(sud, index) {
  var thisColumn = [];
  let j = 0;
  const tmp = index;
  let remainder = 0;
  remainder = tmp % GRID_SIZE;
  for (let i = remainder; i < remainder + 73; i = i + 9) {
    thisColumn[j] = sud[i];
    j++;
  }
  return thisColumn;
}

function checkBox(sud, index) {
  var thisBox = [];
  let tmp = index / 3;
  tmp = Math.floor(tmp);
  let division;
  division = tmp / 3;
  division = Math.floor(division);
  let divisionOfDivision;
  divisionOfDivision = division / 3;
  divisionOfDivision = Math.floor(divisionOfDivision);
  let j = 0;

  for (
    let i = tmp * 3 - division * GRID_SIZE + divisionOfDivision * GRID_SIZE * 3;
    i < tmp * 3 - division * GRID_SIZE + divisionOfDivision * 27 + 21;
    i++
  ) {
    thisBox[j] = sud[i];
    j++;
    if (i % 3 === 2) {
      i = i + 6;
    }
  }

  return thisBox;
}

function deleteZeros(array) {
  for (let i = 0; i < GRID_SIZE; i++) {
    if (array[i] === EMPTY_CELL) {
      array.splice(i, 1);
      i--;
    }
  }
}

function printSudoku(str) {
  updateGrid(str);
  str = str.join("");
  let output = "";
  for (let i = 0; i < GRID_SIZE; i++) {
    output += str.substr(i * GRID_SIZE, GRID_SIZE) + "\n";
    if (i % 3 === 2) {
      output += "\n";
    }
  }
  console.log(output);
}

function availableNumbers(solvedSudoku, index) {
  const arow = checkRow(solvedSudoku, index);
  const acol = checkColumn(solvedSudoku, index);
  const abox = checkBox(solvedSudoku, index);

  // Get all numbers that are already used
  let usedNumbers = new Set(
    [...arow, ...acol, ...abox].filter((x) => x !== EMPTY_CELL)
  );

  // Return available numbers (1-9 minus used numbers)
  let available = [];
  for (let i = 1; i <= 9; i++) {
    if (!usedNumbers.has(String(i))) {
      available.push(i);
    }
  }
  return available;
}

/**
 * Validates if the Sudoku puzzle is complete and correct
 * @param {string[]} solvedSudoku - The completed Sudoku grid
 * @returns {boolean} True if the Sudoku is valid and complete
 */
function checkSudokuFinished(solvedSudoku) {
  // Input validation
  if (!solvedSudoku || solvedSudoku.length !== TOTAL_CELLS) {
    return false;
  }

  for (let i = 0; i < TOTAL_CELLS; i++) {
    if (solvedSudoku[i] === EMPTY_CELL) {
      return false;
    }

    const availableNumbersArray = availableNumbers(solvedSudoku, i);
    if (availableNumbersArray.length !== 0) {
      return false;
    }
  }

  console.log("Sudoku Finished!");
  isSudokuAnswerValid(solvedSudoku);
  return true;
}

/**
 * Validates if a completed Sudoku solution is correct
 * @param {string[]} sudoku - The completed Sudoku grid
 * @returns {boolean} True if the solution is valid
 */
function isSudokuAnswerValid(sudoku) {
  // Check each row, column, and box
  for (let i = 0; i < GRID_SIZE; i++) {
    // Check row
    const row = checkRow(sudoku, i * GRID_SIZE);
    if (!isGroupValid(row)) {
      console.log("Invalid row:", i + 1);
      return false;
    }

    // Check column
    const column = checkColumn(sudoku, i);
    if (!isGroupValid(column)) {
      console.log("Invalid column:", i + 1);
      return false;
    }

    // Check 3x3 box
    const boxStartIndex = Math.floor(i / 3) * 27 + (i % 3) * 3;
    const box = checkBox(sudoku, boxStartIndex);
    if (!isGroupValid(box)) {
      console.log("Invalid box:", i + 1);
      return false;
    }
  }

  console.log("Solution is valid!");
  return true;
}

/**
 * Checks if a group (row, column, or box) contains all numbers 1-9
 * @param {string[]} group - Array of numbers to check
 * @returns {boolean} True if the group is valid
 */
function isGroupValid(group) {
  const numbers = new Set(group);
  if (numbers.size !== GRID_SIZE) return false;

  // Check if all numbers 1-9 are present
  for (let i = 1; i <= GRID_SIZE; i++) {
    if (!numbers.has(String(i))) return false;
  }
  return true;
}

// Add DOM-related functions
function initializeGrid() {
  const grid = document.getElementById("sudokuGrid");
  grid.innerHTML = ""; // Clear existing grid completely

  // Create fresh 9x9 grid
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      const input = document.createElement("input");
      input.type = "number";
      input.min = "1";
      input.max = "9";
      input.maxLength = "1";
      input.className = "cell-input";

      // Prevent non-numeric input
      input.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^1-9]/g, "");
      });

      cell.appendChild(input);
      grid.appendChild(cell);
    }
  }
}

function updateGrid(values) {
  const inputs = document.querySelectorAll(".cell input");
  inputs.forEach((input, index) => {
    input.value = values[index] === EMPTY_CELL ? "" : values[index];
    input.readOnly = values[index] !== EMPTY_CELL;
    if (input.readOnly) {
      input.classList.add("initial");
    } else {
      input.classList.remove("initial");
    }
  });
}

function highlightCell(index) {
  if (shouldStop) return; // Don't highlight if we're stopping

  const cells = document.querySelectorAll(".cell input");
  cells.forEach((cell, i) => {
    if (i === index) {
      cell.style.backgroundColor = "#ffeb3b"; // Yellow highlight
    } else if (!cell.readOnly && !cell.value) {
      cell.style.backgroundColor = "white";
    }
  });
}

function updateStatus(message) {
  document.getElementById("status").textContent = message;
}

function setInputsEnabled(enabled) {
  const inputs = document.querySelectorAll(".cell input");
  inputs.forEach((input) => {
    input.disabled = !enabled;
  });
}

// Add event listeners
document.addEventListener("DOMContentLoaded", () => {
  initializeGrid();

  // Update preset selection handler
  document.getElementById("preset").addEventListener("change", (e) => {
    let puzzle;
    switch (e.target.value) {
      case "1":
        puzzle = sudokuString1;
        break;
      case "2":
        puzzle = sudokuString2;
        break;
      case "3":
        puzzle = sudokuString3;
        break;
      default:
        return;
    }
    const sudokuArray = puzzle.split("");
    updateGrid(sudokuArray);
    updateStatus("Preset puzzle loaded");
  });

  // Clear button handler
  document.getElementById("clear").addEventListener("click", () => {
    // First stop any ongoing solving
    shouldStop = true;
    isSolving = false;

    // Wait a brief moment for the solving to stop
    setTimeout(() => {
      // Create a new empty grid
      initializeGrid();

      // Double-check all inputs are cleared
      document.querySelectorAll(".cell input").forEach((input) => {
        input.value = "";
        input.style.backgroundColor = "white";
        input.readOnly = false;
        input.classList.remove("initial");
        input.disabled = false;
      });

      updateStatus("Grid cleared");
    }, 100); // Small delay to ensure solving has stopped
  });

  // Solve button handler
  document.getElementById("solve").addEventListener("click", async () => {
    if (isSolving) {
      updateStatus("Already solving...");
      return;
    }

    try {
      isSolving = true;
      shouldStop = false; // Reset stop flag
      setInputsEnabled(false);
      updateStatus("Solving...");
      await mainjs();
    } catch (error) {
      console.error(error);
      updateStatus("Error solving puzzle!");
    } finally {
      isSolving = false;
      shouldStop = false; // Make sure stop flag is reset
      setInputsEnabled(true);
    }
  });
});
