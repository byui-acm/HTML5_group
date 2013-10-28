// =========================================================

// BBBBB       OOOOO       AAA      RRRRRR     DDDDD
// BB   B     OO   OO     AAAAA     RR   RR    DD  DD
// BBBBBB     OO   OO    AA   AA    RRRRRR     DD   DD
// BB   BB    OO   OO    AAAAAAA    RR  RR     DD   DD
// BBBBBB      OOOO0     AA   AA    RR   RR    DDDDDD

// =========================================================

// Constants
var LENGTH       = 8;        // size of the board
var TILE_SIZE    = 50;       // size of a tile
var WHITE        = 'white';
var BLACK        = 'black';
var WARRIOR      = 'warrior';
var ARCHER       = 'archer';
var WIZARD       = 'wizard';

// Variables
var whiteBoard   = {};
var blackBoard   = {};
var canvasL      = document.getElementById('white');
var canvasB      = document.getElementById('black');
var ctxL         = canvasL.getContext('2d');
var ctxB         = canvasB.getContext('2d');
var currentTurn  = WHITE;  // The color of the player whose turn it currently is
var selectedUnit = {};     // The currently selected unit

/**
 * Helper function - determine if an object is empty
 * @param object to check
 */
function isEmpty(obj) {
  var name;
  for (name in obj) {
    return false;
  }
  return true;
}

/**
 * Helper function - determine if an object is not empty
 * @param object to check
 */
function isNotEmpty(obj) {
  var name;
  for (name in obj) {
    return true;
  }
  return false;
}

/**
 * Onclick event
 * @param event The mouse event object
 */
clickHandler = function(event, boardColor) {
  var mouseX = event.offsetX || event.layerX;
  var mouseY = event.offsetY || event.layerY;

  var row = Math.floor(mouseY / TILE_SIZE);
  var col = Math.floor(mouseX / TILE_SIZE);

  var board = window[boardColor+'Board'];
  var tile = board.board[row][col];

  // select own unit
  if (isEmpty(selectedUnit) && tile.unit !== null && tile.unit.color === currentTurn) {
    selectedUnit = tile.unit;
    selectedUnit.isSelected = true;
  }
  // move to empty square
  else if (isNotEmpty(selectedUnit) && tile.unit === null && selectedUnit.inMoveRange(row, col)) {
    if (selectedUnit.move(row, col)) {
      // unit moved successfully, switch turns
      curentTurn = (currentTurn === WHITE ? BLACK : WHITE);
    }
  }
  // attack enemy units
  else if (isNotEmpty(selectedUnit) && tile.unit !== null && tile.unit.color !== currentTurn && selectedUnit.inAtkRange(row, col)) {
    if (selectedUnit.attack(row, col)) {
      // unit attacked successfully, switch turns
      curentTurn = (currentTurn === WHITE ? BLACK : WHITE);
    }
  }
  // select a different own unit
  else if (isNotEmpty(selectedUnit) && tile.unit !== null && tile.unit.color === currentTurn) {
    selectedUnit.isSelected = false;
    selectedUnit = tile.unit;
    selectedUnit.isSelected = true;
  }

};
canvasL.onclick = function(event) {clickHandler(event, WHITE)};
canvasB.onclick = function(event) {clickHandler(event, BLACK)};

/**
 * Asset pre-loader object. Loads all images and sounds
 */
assetLoader = new function() {
  // images
  this.imgs        = {
    'white_tile' : 'imgs/white-tile.png',
    'black_tile' : 'imgs/black-tile.png',
    'warrior'    : 'imgs/warrior.png'
  };

  // sounds
  this.sounds      = {};

  var assetsLoaded = 0;                                // how many assets have been loaded
  var numImgs      = Object.keys(this.imgs).length;    // total number of image assets
  var numSounds    = Object.keys(this.sounds).length;  // total number of sound assets
  this.totalAssest = numImgs + numSounds;              // total number of assets
  this.isReady     = false;                            // know when all assets have been loaded

  /**
   * Ensure all assets are loaded before using them
   * @param self Reference to the assetLoader object
   */
  function assetLoaded(self) {
    assetsLoaded++;
    if (assetsLoaded === self.totalAssest) {
      self.isReady = true;
      window.startGame();
    }
  };

  // create asset, set callback for asset loading, set asset source
  var self = this;
  var src  = '';
  for (img in this.imgs) {
    src = this.imgs[img];
    this.imgs[img] = new Image();
    this.imgs[img].onload = function() { assetLoaded(self); };
    this.imgs[img].src = src;
  }
  for (sound in this.sounds) {
    src = this.sounds[sound];
    this.sounds[sound] = new Audio();
    this.sounds[sound].onload = function() { assetLoaded(self); };
    this.sounds[sound].src = src;
  }
}

/**
 * Tile object
 * @param color The color type for the tile (white, black)
 */
function Tile(color) {
  this.type = color;          // white, black
  this.img  = color+'_tile';  // key to the assetLoader.imgs object
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

  drawBoards();
}

// =========================================================

// UU   UU    NN   NN    IIIII    TTTTTTT     SSSSS
// UU   UU    NNN  NN     III       TTT      SS
// UU   UU    NN N NN     III       TTT       SSSSS
// UU   UU    NN  NNN     III       TTT           SS
//  UUUUU     NN   NN    IIIII      TTT       SSSSS

// =========================================================

/**
 * Unit base class
 */
function Unit() {
  // unit info
  this.loc         = {       // current row and column on the board
    'row'  : 0,
    'col'  : 0
  };
  this.color       = '';     // white, black
  this.type        = '';     // warrior, archer, wizard

  this.start_loc   = {       // starting placement of unit on board
    'row'  : 0,
    'col'  : 0
  };
  this.isSelected  = false;  // if the unit is currently selected

  // action stats
  var actionLimit  = 2;      // how many actions the unit can perform per turn
  var moveLimit    = 2;      // how many move actions the unit can perform per turn
  var atkLimit     = 1;      // how many attack actions the unit can perform per turn
  var moveActions  = 0;      // the current move actions the unit has performed this turn
  var atkActions   = 0;      // the current attack actions the unit has performed this turn

  // unit stats
  this.hp           = 0;     // health
  this.spd          = 0;     // movement speed (how far unit can move)
  this.rng          = 0;     // attack range (how far unit can attack)
  this.dmg          = {      // damage range, low-high
    'low'  : 0,
    'high' : 0
  };

  /**
   * Draw the unit to the board
   * @param ctx The canvas context to draw on
   */
  this.draw = function(ctx) {
    ctx.drawImage(assetLoader.imgs[this.type], this.loc.row * TILE_SIZE, this.loc.col * TILE_SIZE);

    if (this.isSelected) {
      this.drawMoveRange(ctx);
      this.drawAtkRange(ctx);
    }
  };

  /**
   * Draw the unit's move range to the board
   * @param ctx The canvas context to draw on
   */
  this.drawMoveRange = function(ctx) {
    // Highlight movement outline
    var offset = 0;
    var newCol;
    for (var i = 0; i <= this.spd * 2; i++) {
      newCol = this.loc.col - (this.spd - i);
      ctx.strokeStyle = "rgb(0, 255, 0)";

      // Left half
      if (i <= this.spd) {
        // Highlight movement square above
        ctx.strokeRect( newCol * TILE_SIZE, (row - offset + 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        // Highlight movement square below
        ctx.strokeRect( newCol * TILE_SIZE, (row + offset) * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        offset++;
      }
      // Right half
      else {
        // Highlight movement square above
        ctx.strokeRect( (newCol - 1) * TILE_SIZE, (row - offset + 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        // Highlight movement square below
        ctx.strokeRect( (newCol - 1) * TILE_SIZE, (row + offset) * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        offset--;
      }
    }

    // Highlight last square
    ctx.strokeRect( newCol * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  };

  /**
   * Draw the unit's attack range to the board
   * @param ctx The canvas context to draw on
   */
  this.drawAtkRange = function(ctx) {

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

// =========================================================

//   GGGG    AAA   MM    MM EEEEEEE    LL       OOOOO    GGGG  IIIII  CCCCC
//  GG  GG  AAAAA  MMM  MMM EE         LL      OO   OO  GG  GG  III  CC    C
// GG      AA   AA MM MM MM EEEEE      LL      OO   OO GG       III  CC
// GG   GG AAAAAAA MM    MM EE         LL      OO   OO GG   GG  III  CC    C
//  GGGGGG AA   AA MM    MM EEEEEEE    LLLLLLL  OOOO0   GGGGGG IIIII  CCCCC


// =========================================================

// Steven is this what you are thinking for the object hierarchy of units?
var light_units = new Array(
  // Expected parameters are: (starting_loc, wizard type)
    wizardD  = new Wizard(),
    wizardO  = new Wizard(),
    warrior1 = new Warrior(),
    warrior2 = new Warrior(),
    warrior3 = new Warrior(),
    archer1  = new Archer(),
    archer2  = new Archer(),
    archer3  = new Archer()
  );
var dark_units = new Array(

  );

function populate_board() {

}

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