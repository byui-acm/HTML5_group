
// Constants
var LENGTH     = 8;
var TILE_SIZE  = 50;

// Variables
var lightBoard = {};
var darkBoard  = {};
var canvasL    = document.getElementById('light');
var canvasD    = document.getElementById('dark');
var ctxL       = canvasL.getContext('2d');
var ctxD       = canvasD.getContext('2d');

/*
 * Onclick event
 */
clickHandler = function(event) {
  var mouseX = event.offsetX || event.layerX;
  var mouseY = event.offsetY || event.layerY;

  var yPos = Math.floor(mouseY / TILE_SIZE);
  var xPos = Math.floor(mouseX / TILE_SIZE);

  flipRookTiles(xPos, yPos);
};
canvasL.onclick = function(event) {clickHandler(event)};
canvasD.onclick = function(event) {clickHandler(event)};

/*
 * Create a new board with the color provided
 */
function makeBoard(color) {
  var board = [];
  for (var i = 0; i < LENGTH; i++) {
    board[i] = [];
    for (var j = 0; j < LENGTH; j++) {
      board[i][j] = {}; // Tile type.
      board[i][j].type = color;
    }
  }

  return board;
}

lightBoard = makeBoard("green");
darkBoard  = makeBoard("gray");

/*
 * Draw the boards and their tiles
 */
function drawBoards() {
  // Draw each tile
  for (var row = 0; row < LENGTH; row++) {
    for (var col = 0; col < LENGTH; col++) {
      ctxL.fillStyle = lightBoard[row][col].type;
      ctxL.fillRect(row * TILE_SIZE, col * TILE_SIZE, TILE_SIZE, TILE_SIZE);

      ctxD.fillStyle = darkBoard[row][col].type;
      ctxD.fillRect(row * TILE_SIZE, col * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }

  // Draw the tile lines
  ctxL.beginPath();
  ctxD.beginPath();
  for (var i = 0; i < LENGTH; i++) {
    ctxL.moveTo(0, TILE_SIZE * i);
    ctxL.lineTo(canvasL.width, TILE_SIZE * i);
    ctxL.moveTo(TILE_SIZE * i, 0);
    ctxL.lineTo(TILE_SIZE * i, canvasL.height);

    ctxD.moveTo(0, TILE_SIZE * i);
    ctxD.lineTo(canvasD.width, TILE_SIZE * i);
    ctxD.moveTo(TILE_SIZE * i, 0);
    ctxD.lineTo(TILE_SIZE * i, canvasD.height);
  }
  ctxL.stroke();
  ctxD.stroke();
}

drawBoards();

/*
 * Flip all horizontal and vertical tiles centered on xPos, yPos
 */
function flipRookTiles(xPos, yPos) {
  for (var i = 0; i < LENGTH; i++) {
    rowTemp = lightBoard[xPos][i];
    colTemp = lightBoard[i][yPos];

    lightBoard[xPos][i] = darkBoard[xPos][i];
    darkBoard[xPos][i] = rowTemp;

    if (i != xPos) {
      lightBoard[i][yPos] = darkBoard[i][yPos];
      darkBoard[i][yPos] = colTemp;
    }
  }

  drawBoards();
}

/*
 * Flip all diagonal tiles centered on xPos, yPos
 */
function flipBishTiles(xPos, yPos) {
  // make two sets of y variables
  // iterate on x, when ys are equal
  // only flip one.
  var x = xPos;
  var y1 = yPos;
  var y2 = yPos;
  while (x > 0) {
    x--;
    y1--;
    y2++;
  }
  for ( ; x < LENGTH; x++) {
    if (y1 >= 0 && y1 < LENGTH) {
      temp = lightBoard[x][y1];
      lightBoard[x][y1] = darkBoard[x][y1];
      darkBoard[x][y1] = temp;
    }
    y1++;
    if (y2 >= 0 && y2 < LENGTH && y1 != y2) {
      temp = lightBoard[x][y2];
      lightBoard[x][y2] = darkBoard[x][y2];
      darkBoard[x][y2] = temp;
    }
    y2--;
  }

  drawBoards();
}