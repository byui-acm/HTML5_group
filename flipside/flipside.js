
// Constants
var LENGTH        = 8;
var TILE_SIZE     = 50;

// Variables
var lightBoard    = {};
var darkBoard     = {};
var canvasL       = document.getElementById('light');
var canvasD       = document.getElementById('dark');
var ctxL          = canvasL.getContext('2d');
var ctxD          = canvasD.getContext('2d');
var clickFunction = {};

/*
 * Onclick event
 */
clickHandler = function(event) {
  var mouseX = event.offsetX || event.layerX;
  var mouseY = event.offsetY || event.layerY;

  var col = Math.floor(mouseY / TILE_SIZE);
  var row = Math.floor(mouseX / TILE_SIZE);

  clickFunction(row, col);
};
canvasL.onclick = function(event) {clickHandler(event)};
canvasD.onclick = function(event) {clickHandler(event)};
clickFunction = flipRookTiles;

/*
 * Change the click handler for flipping
 */
function changeClickHandler(name, func) {
  clickFunction = func;
  $( ".button" ).each(function() {
    $( this ).removeClass( "active" );
  });

  $('#'+name).addClass('active');
}

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

/*
 * Reset the tiles on both boards
 */
function reset() {
  lightBoard = makeBoard("green");
  darkBoard  = makeBoard("gray");

  drawBoards();
}

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

/*
 * Flip all horizontal and vertical tiles centered on row, col
 */
function flipRookTiles(row, col) {
  var rowTemp, colTemp;
  for (var i = 0; i < LENGTH; i++) {
    rowTemp = lightBoard[row][i];
    colTemp = lightBoard[i][col];

    lightBoard[row][i] = darkBoard[row][i];
    darkBoard[row][i] = rowTemp;

    if (i != row) {
      lightBoard[i][col] = darkBoard[i][col];
      darkBoard[i][col] = colTemp;
    }
  }

  drawBoards();
}

/*
 * Flip all diagonal tiles centered on row, col
 */
function flipBishTiles(row, col) {
  var row1, row2, temp;
  for (var i = 0; i < LENGTH; i++) {
    row1 = row - (col - i);
    row2 = row + (col - i);

    if (row1 < LENGTH && row1 >= 0) {
      temp = lightBoard[row1][i];
      lightBoard[row1][i] = darkBoard[row1][i];
      darkBoard[row1][i] = temp;
    }

    if (row2 < LENGTH && row2 >= 0 && row1 != row2) {
      temp = lightBoard[row2][i];
      lightBoard[row2][i] = darkBoard[row2][i];
      darkBoard[row2][i] = temp;
    }
  }

  drawBoards();
}

reset();