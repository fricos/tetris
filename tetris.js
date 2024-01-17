const canvas = document.getElementById('tetrisCanvas');
const context = canvas.getContext('2d');
const blockSize = 30;
const columns = 10;
const rows = 20;
canvas.width = blockSize * columns;
canvas.height = blockSize * rows;
let board = [];

// Tetrominoes
const tetrominoes = [
  [[1, 1, 1, 1]],
  [[1, 1, 1], [1]],
  [[1, 1, 1], [0, 0, 1]],
  [[1, 1, 1], [1, 0]],
  [[1, 1], [1, 1]],
];

let currentTetromino;
let currentX, currentY;

const fallInterval = 500; // Milliszekundumokban
let lastFallTime = 0;

// Initialize the board
for (let row = 0; row < rows; row++) {
  board[row] = [];
  for (let col = 0; col < columns; col++) {
    board[row][col] = 0;
  }
}

// Check if the current tetromino collides with the board or the bottom
function checkCollision() {
  for (let row = 0; row < currentTetromino.length; row++) {
    for (let col = 0; col < currentTetromino[row].length; col++) {
      if (
        currentTetromino[row][col] !== 0 &&
        (board[currentY + row] === undefined || board[currentY + row][currentX + col] !== 0)
      ) {
        return true; // Collision detected
      }
    }
  }
  return false; // No collision
}

// Move the tetromino down
function moveTetrominoDown() {
  currentY++;

  // Check for collision
  if (checkCollision()) {
    // Move back up and fix the tetromino to the board
    currentY--;
    fixTetromino();
    removeCompletedRows();
    newTetromino();
  }
}

// Move the tetromino left
function moveTetrominoLeft() {
  currentX--;
  if (checkCollision()) {
    currentX++; // Revert the move if there is a collision
  }
}

// Move the tetromino right
function moveTetrominoRight() {
  currentX++;
  if (checkCollision()) {
    currentX--; // Revert the move if there is a collision
  }
}

// Rotate the tetromino
function rotateTetromino() {
  const originalTetromino = currentTetromino;
  currentTetromino = rotateMatrix(currentTetromino);
  if (checkCollision()) {
    // Revert the rotation if there is a collision
    currentTetromino = originalTetromino;
  }
}

// Rotate a matrix (2D array) 90 degrees
function rotateMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotatedMatrix = new Array(cols).fill(0).map(() => new Array(rows).fill(0));

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      rotatedMatrix[col][rows - 1 - row] = matrix[row][col];
    }
  }

  return rotatedMatrix;
}

// Fix the current tetromino to the board
function fixTetromino() {
  for (let row = 0; row < currentTetromino.length; row++) {
    for (let col = 0; col < currentTetromino[row].length; col++) {
      if (currentTetromino[row][col] !== 0) {
        board[currentY + row][currentX + col] = 1;
      }
    }
  }
}

// Remove completed rows
function removeCompletedRows() {
  for (let row = rows - 1; row >= 0; row--) {
    if (board[row].every(cell => cell !== 0)) {
      // Remove the completed row
      board.splice(row, 1);
      // Add a new empty row at the top
      board.unshift(new Array(columns).fill(0));
    }
  }
}

// Initialize a new tetromino
function newTetromino() {
  const randomIndex = Math.floor(Math.random() * tetrominoes.length);
  currentTetromino = tetrominoes[randomIndex];
  currentX = Math.floor((columns - currentTetromino[0].length) / 2);
  currentY = 0;

  // Check for game over (collision at the top)
  if (checkCollision()) {
    // Game over, reset the board
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        board[row][col] = 0;
      }
    }
  }
}

// Handle keyboard input
document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'ArrowUp':
      rotateTetromino();
      break;
    case 'ArrowDown':
      moveTetrominoDown();
      break;
    case 'ArrowLeft':
      moveTetrominoLeft();
      break;
    case 'ArrowRight':
      moveTetrominoRight();
      break;
  }
});

// Draw a square on the board
function drawSquare(x, y, color) {
  context.fillStyle = color;
  context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
  context.strokeStyle = "#222";
  context.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
}

// Draw the board
function drawBoard() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      if (board[row][col] !== 0) {
        drawSquare(col, row, "#00F");
      }
    }
  }
}

// Draw the current tetromino
function drawTetromino() {
  for (let row = 0; row < currentTetromino.length; row++) {
    for (let col = 0; col < currentTetromino[row].length; col++) {
      if (currentTetromino[row][col] !== 0) {
        drawSquare(currentX + col, currentY + row, "#F00");
      }
    }
  }
}

// The main game loop
function gameLoop(timestamp) {
  // Clear the canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the board
  drawBoard();

  // Draw and move the current tetromino
  drawTetromino();

  // Move the tetromino down at a fixed interval
  if (timestamp - lastFallTime > fallInterval) {
    moveTetrominoDown();
    lastFallTime = timestamp;
  }

  // Repeat the game loop
  requestAnimationFrame(gameLoop);
}

// Start the game loop and initialize the first tetromino
newTetromino();
gameLoop();
