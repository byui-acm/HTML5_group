// Constants
var LENGTH        = 8;        // size of the board
var TILE_SIZE     = 50;       // size of a tile
var WHITE         = 'white';
var BLACK         = 'black';
var WARRIOR       = 'warrior';
var ARCHER        = 'archer';
var WIZARD        = 'wizard';

// Variables
var whiteBoard    = {};
var blackBoard    = {};
var canvasL       = document.getElementById('white');
var canvasB       = document.getElementById('black');
var ctxL          = canvasL.getContext('2d');
var ctxB          = canvasB.getContext('2d');
var clickFunction = {};       // the function to perform on a click

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
canvasB.onclick = function(event) {clickHandler(event)};
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
 * Asset pre-loader object. Loads all images and sounds
 */
assetLoader = new function() {
  // images
  this.imgs = {
    'white_tile' : new Image(),
    'black_tile' : new Image(),
    'warrior'    : new Image()
  };

  // sounds
  this.sounds = {};

  var assetsLoaded = 0;                                // how many assets have been loaded
  var numImgs      = Object.keys(this.imgs).length;    // total number of image assets
  var numSounds    = Object.keys(this.sounds).length;  // total number of sound assets
  this.totalAssest = numImgs + numSounds;              // total number of assets
  this.isReady     = false;                            // know when all assets have been loaded

  /**
   * Ensure all images are loaded before using them
   * @param self Reference to the assetLoader object
   */
  function imageLoaded(self) {
    assetsLoaded++;
    if (assetsLoaded === self.totalAssest) {
      self.isReady = true;
      window.startGame();
    }
  };

  // set callback for asset loading
  var self = this;
  for (img in this.imgs) {
    this.imgs[img].onload = function() { imageLoaded(self); };
  }
  for (sound in this.sounds) {
    this.sounds[sound].onload = function() { imageLoaded(self); };
  }

  // set all asset sources
  this.imgs.white_tile.src = 'imgs/white-tile.png';
  this.imgs.black_tile.src = 'imgs/black-tile.png';
  this.imgs.warrior.src    = 'imgs/warrior.png';
}

/**
 * Tile object
 * @param color The color type for the tile (white, black)
 */
function Tile(color) {
  this.type = color;          // white, black
  this.img  = color+"_tile";  // key to the assetLoader.imgs object
  this.unit = {};             // reference to the Unit object that is on the tile

  /**
   * Draw the tile
   * @param ctx The canvas context to draw to
   */
  this.draw = function(ctx, row, col) {
    ctx.drawImage(assetLoader.imgs[this.img], row * TILE_SIZE, col * TILE_SIZE);

    // draw the unit on the square if there is one
    if (Object.keys(this.unit).length) {
      this.unit.draw(ctx);
    }
  }
}

/**
 * Board object
 * @param color The color type for the tile (white, black)
 */
function Board(color) {
  this.type          = color;                // white, black
  this.board         = [];                   // 2d array that holds Tile objects
  this.canvas        = (color === WHITE ? canvasL : canvasB);
  this.ctx           = (color === WHITE ? ctxL    : ctxB);
  this.ctx.fillStyle = 'rgba(0, 0, 0, .1)';  // draw a dark transparent square over a tile

  /**
   * Draw the board tiles
   */
  this.draw = function() {
    for (var row = 0; row < LENGTH; row++) {
      for (var col = 0; col < LENGTH; col++) {
        this.board[row][col].draw(this.ctx, row, col);

        // alternate drawing tiles lighter or darker
        if ((row % 2 && col % 2) || (!(row % 2) && !(col % 2))) {
          this.ctx.fillRect(row * TILE_SIZE, col * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  };

  /**
   * Reset the board
   */
  this.reset = function() {
    this.board = [];
    for (var i = 0; i < LENGTH; i++) {
      this.board[i] = [];
      for (var j = 0; j < LENGTH; j++) {
        this.board[i][j] = new Tile(this.type);
      }
    }
  };

  this.reset();  // make the board
}

/**
 * Draw both boards
 */
function drawBoards() {
  whiteBoard.draw();
  blackBoard.draw();
}

/**
 * Flip all horizontal and vertical tiles centered on row, col
 * @param row The row to flip
 * @param col The column to flip
 */
function flipRookTiles(row, col) {
  var rowTemp, colTemp;
  for (var i = 0; i < LENGTH; i++) {
    rowTemp = whiteBoard.board[row][i];
    colTemp = whiteBoard.board[i][col];

    whiteBoard.board[row][i] = blackBoard.board[row][i];
    blackBoard.board[row][i] = rowTemp;

    if (i != row) {
      whiteBoard.board[i][col] = blackBoard.board[i][col];
      blackBoard.board[i][col] = colTemp;
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
      temp = whiteBoard.board[row1][i];
      whiteBoard.board[row1][i] = blackBoard.board[row1][i];
      blackBoard.board[row1][i] = temp;
    }

    if (row2 < LENGTH && row2 >= 0 && row1 != row2) {
      temp = whiteBoard.board[row2][i];
      whiteBoard.board[row2][i] = blackBoard.board[row2][i];
      blackBoard.board[row2][i] = temp;
    }
  }

  drawBoards()
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
    ctx.drawImage(assetLoader.imgs[this.type], this.loc.row * TILE_SIZE, this.loc.col * TILE_SIZE);
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
   * Function should overwritten if it is different from the base attack function
   * @param row The row to move attack
   * @param col The column to move attack
   *
   * @return True if the unit can use it's power, false otherwise
   */
  this.attack = function(row, col) {
    if (this.canAtack() && this.inAtkRange(row, col)) {
      // do something

      atkActions++;
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
  this.type  = WARRIOR;

  this.hp    = 0;
  this.spd   = 0;
  this.rng   = 1;
  this.dmg   = {
    'low'  : 0,
    'high' : 0
  };
}
Warrior.prototype = new Unit(); // set up inheritance

/**
 * Archer class
 * @param color The color to assign the unit
 */
function Archer(color) {
  this.color = color;
  this.type  = ARCHER;

  this.hp    = 0;
  this.spd   = 0;
  this.rng   = 0;
  this.dmg   = {
    'low'  : 0,
    'high' : 0
  };
}
Archer.prototype = new Unit(); // set up inheritance

/**
 * Wizard class
 * @param color The color to assign the unit
 */
function Wizard(color) {
  this.color = color;
  this.type  = WIZARD;

  this.hp    = 0;
  this.spd   = 0;

  /**
   * Performs the Wizards flip attack
   *
   * @return True if the Wizard can use it's power, false otherwise
   */
  this.attack = function() {
    return;
  };
}
Wizard.prototype = new Unit(); // set up inheritance

/**
 * Reset the game
 */
function reset() {
  whiteBoard.reset();
  blackBoard.reset();
  drawBoards();
}

/**
 * Start the game
 */
function startGame() {
  whiteBoard = new Board(WHITE);
  blackBoard = new Board(BLACK);
  drawBoards();
}