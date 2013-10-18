// Constants
var LENGTH        = 8;    // size of the board
var TILE_SIZE     = 50;   // size of a tile

// Variables
var whiteBoard    = {};
var blackBoard    = {};
var canvasL       = document.getElementById('white');
var canvasD       = document.getElementById('black');
var ctxL          = canvasL.getContext('2d');
var ctxB          = canvasD.getContext('2d');
var clickFunction = {};   // the function to perform on a click

/**
 * Onclick event
 * @param event The mouse event object
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

/**
 * Change the click handler for flipping
 * @param name The id attribute of the button to activate
 * @param func The function object to assign as the new clickFunction
 */
function changeClickHandler(name, func) {
  clickFunction = func;
  $( ".button" ).each(function() {
    $( this ).removeClass( "active" );
  });

  $('#'+name).addClass('active');
}

/**
 * Create a new board
 * @param color The color to assign all new tiles of the board
 *
 * @return The new board array
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

/**
 * Reset the tiles on both boards
 */
function reset() {
  whiteBoard = makeBoard("green");
  blackBoard = makeBoard("gray");

  drawBoards();
}

/**
 * Draw the boards and their tiles
 */
function drawBoards() {
  // draw each tile
  for (var row = 0; row < LENGTH; row++) {
    for (var col = 0; col < LENGTH; col++) {
      ctxL.fillStyle = whiteBoard[row][col].type;
      ctxL.fillRect(row * TILE_SIZE, col * TILE_SIZE, TILE_SIZE, TILE_SIZE);

      ctxB.fillStyle = blackBoard[row][col].type;
      ctxB.fillRect(row * TILE_SIZE, col * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }

  // draw the tile lines
  ctxL.beginPath();
  ctxB.beginPath();
  for (var i = 0; i < LENGTH; i++) {
    ctxL.moveTo(0, TILE_SIZE * i);
    ctxL.lineTo(canvasL.width, TILE_SIZE * i);
    ctxL.moveTo(TILE_SIZE * i, 0);
    ctxL.lineTo(TILE_SIZE * i, canvasL.height);

    ctxB.moveTo(0, TILE_SIZE * i);
    ctxB.lineTo(canvasD.width, TILE_SIZE * i);
    ctxB.moveTo(TILE_SIZE * i, 0);
    ctxB.lineTo(TILE_SIZE * i, canvasD.height);
  }
  ctxL.stroke();
  ctxB.stroke();
}

/**
 * Flip all horizontal and vertical tiles centered on row, col
 * @param row The row to flip
 * @param col The column to flip
 */
function flipRookTiles(row, col) {
  var rowTemp, colTemp;
  for (var i = 0; i < LENGTH; i++) {
    rowTemp = whiteBoard[row][i];
    colTemp = whiteBoard[i][col];

    whiteBoard[row][i] = blackBoard[row][i];
    blackBoard[row][i] = rowTemp;

    if (i != row) {
      whiteBoard[i][col] = blackBoard[i][col];
      blackBoard[i][col] = colTemp;
    }
  }

  drawBoards();
}

/**
 * Flip all diagonal tiles centered on row, col
 * @param row The center row of the flip
 * @param col The center column of the flip
 */
function flipBishTiles(row, col) {
  var row1, row2, temp;
  for (var i = 0; i < LENGTH; i++) {
    row1 = row - (col - i);
    row2 = row + (col - i);

    if (row1 < LENGTH && row1 >= 0) {
      temp = whiteBoard[row1][i];
      whiteBoard[row1][i] = blackBoard[row1][i];
      blackBoard[row1][i] = temp;
    }

    if (row2 < LENGTH && row2 >= 0 && row1 != row2) {
      temp = whiteBoard[row2][i];
      whiteBoard[row2][i] = blackBoard[row2][i];
      blackBoard[row2][i] = temp;
    }
  }

  drawBoards();
}

/**
 * Asset pre-loader object. Loads all images and sounds
 */
assetLoader = new function() {
  // images
  this.imgs = {
    'warrior' : new Image(),
    'archer'  : new Image(),
    'wizard'  : new Image()
  };

  // sounds
  this.sounds = {};
}

/**
 * Unit base class
 */
function Unit() {
  // unit info
  this.loc         = {     // current row and column on the board
    'row'  : 0,
    'col'  : 0
  };
  this.color       = '';   // white, black
  this.type        = '';   // warrior, archer, wizard
  img              = {};   // reference to the assetLoader img

  // action stats
  var actionLimit  = 2;    // how many actions the unit can perform per turn
  var moveLimit    = 2;    // how many move actions the unit can perform per turn
  var atkLimit     = 1;    // how many attack actions the unit can perform per turn
  var moveActions  = 0;    // the current move actions the unit has performed this turn
  var atkActions   = 0;    // the current attack actions the unit has performed this turn

  // unit stats
  this.hp           = 0;    // health
  this.spd          = 0;    // movement speed (how far unit can move)
  this.rng          = 0;    // attack range (how far unit can attack)
  this.dmg          = {     // damage range, low-high
    'low'  : 0,
    'high' : 0
  };

  /**
   * Draw the unit to the board
   * @param ctx The canvas context to draw on
   */
  this.draw = function(ctx) {
    ctx.drawImage(this.img, this.loc.row * TILE_SIZE, this.loc.col * TILE_SIZE);
  };

  /**
   * Move to an empty square
   * @param row The row to move to
   * @param col The column to move to
   *
   * @return True if the unit can move, false otherwise
   */
  this.move = function(row, col) {
    if (this.canMove() && this.inMoveRange(row, col)) {
      this.loc.row = row;
      this.loc.col = col;
      moveActions++;
      return true;
    }

    return false;
  };

  /**
   * Performs the unit's attack action
   * Function to be overwritten for each unit type
   *
   * @return True if the unit can use it's power, false otherwise
   */
  this.attack = function() {
    if (this.canAtack()) {
      atkActions  ++;
      return true;
    }

    return false;
  };

  /**
   * If the unit can move this turn
   *
   * @return True if the unit can move, false otherwise.
   */
  this.canMove = function() {
    return moveActions < moveLimit;
  };

  /**
   * If the unit can attack this turn
   *
   * @return True if the unit can use it's power, false otherwise
   */
  this.canAttack = function() {
    return atkActions < atkLimit;
  };

  /**
   * Check if the row and column are within the unit's move range
   * @param row The row to check
   * @param col The column to check
   *
   * @return True if row, col is within range, false otherwise
   */
  this.inMoveRange = function(row, col) {
    var rangeRow = Math.abs(this.loc.row - row);
    var rangeCol = Math.abs(this.loc.col - col);

    return rangeCol + rangeRow <= this.spd;
  };

  /**
   * Check if the row and column are within the unit's attack range
   * @param row The row to check
   * @param col The column to check
   *
   * @return True if row, col is within range, false otherwise
   */
  this.inAtkRange = function(row, col) {
    var rangeRow = Math.abs(this.loc.row - row);
    var rangeCol = Math.abs(this.loc.col - col);

    return rangeCol + rangeRow <= this.rng;
  };

  /**
   * Reset the unit's move and power actions
   */
  this.resetActions = function() {
    moveActions  = 0;
    atkActions   = 0;
  };
}

/**
 * Warrior class
 * @param color The color to assign the unit
 */
function Warrior(color) {
  this.color = color;
  this.type  = 'Warrior';
  this.img   = assetLoader.imgs.warrior;

  this.hp    = 0;
  this.spd   = 0;
  this.rng   = 1;
  this.dmg   = {
    'low'  : 0,
    'high' : 0
  };

  /**
   * Performs the unit's attack action
   *
   * @return True if the unit can use it's power, false otherwise
   */
  this.attack = function() {
    return;
  };
}
Warrior.prototype = new Unit(); // set up inheritance

/**
 * Archer class
 * @param color The color to assign the unit
 */
function Archer(color) {
  this.color = color;
  this.type  = 'Archer';
  this.img   = assetLoader.imgs.archer;

  this.hp    = 0;
  this.spd   = 0;
  this.rng   = 0;
  this.dmg   = {
    'low'  : 0,
    'high' : 0
  };

  /**
   * Performs the unit's attack action
   *
   * @return True if the unit can use it's attack, false otherwise
   */
  this.attack = function() {
    return;
  };
}
Archer.prototype = new Unit(); // set up inheritance

/**
 * Wizard class
 * @param color The color to assign the unit
 */
function Wizard(color) {
  this.color = color;
  this.type  = 'Wizard';
  this.img   = assetLoader.imgs.wizard;

  this.hp    = 0;
  this.spd   = 0;
  this.rng   = 0;
  this.dmg   = {
    'low'  : 0,
    'high' : 0
  };

  /**
   * Performs the unit's attack action
   *
   * @return True if the unit can use it's power, false otherwise
   */
  this.attack = function() {
    return;
  };
}
Wizard.prototype = new Unit(); // set up inheritance

reset();