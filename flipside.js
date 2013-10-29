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
var ORTH         = 'orth';
var DIAG         = 'diag';

var MAX_ACTIONS  = 4;       // actions allowed per turn


// Variables
var num_actions  = 0;

var whiteBoard   = {};
var blackBoard   = {};
var canvasL      = document.getElementById('white');
var canvasB      = document.getElementById('black');
var ctxL         = canvasL.getContext('2d');
var ctxB         = canvasB.getContext('2d');
var currentTurn  = WHITE;  // The color of the player whose turn it currently is
var selectedUnit = {};     // The currently selected unit

/**
 * Helper function - increment action count
 */
function incrementAction(){
  num_actions++;
  document.getElementById('actions_left').innerHTML=MAX_ACTIONS - num_actions;
}
/**
 * Helper function - reset action count
 */
function resetActions(){
  num_actions=0;
  document.getElementById('actions_left').innerHTML=MAX_ACTIONS;
}

/**
 * Helper function - switch current player
 */
function switchPlayer(){
  resetActions();
  currentTurn = (currentTurn === WHITE ? BLACK : WHITE);
  document.getElementById('current_player').innerHTML=currentTurn;
}

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
  if (
    isEmpty(selectedUnit) 
    && isNotEmpty(tile.unit) 
    && tile.unit.color === currentTurn 
    && tile.unit.hasActions()
    ) {
    selectedUnit = tile.unit;
  }
  // move to empty square
  else if (
    isNotEmpty(selectedUnit) 
    && isEmpty(tile.unit) 
    && selectedUnit.inMoveRange(row, col)
    && (selectedUnit.loc.board == tile.loc)
    ) {
    var preRow = selectedUnit.loc.row;
    var preCol = selectedUnit.loc.col;
    if (selectedUnit.move(row, col)) {
      // unit moved successfully
      board.board[preRow][preCol].unit = {};
      board.board[row][col].unit = selectedUnit;
      incrementAction();
    }
    selectedUnit = {};
  }
  // attack enemy units
  else if (isNotEmpty(selectedUnit) && isNotEmpty(tile.unit) && tile.unit.color !== currentTurn && selectedUnit.inAtkRange(row, col)) {
    if (selectedUnit.attack(row, col)) {
      // unit attacked successfully
      incrementAction();
    }
    selectedUnit = {};
  }
  // select a different own unit
  else if (isNotEmpty(selectedUnit) && isNotEmpty(tile.unit) && tile.unit.color === currentTurn) {
    selectedUnit = tile.unit;
  }

  console.log(num_actions);
  if(num_actions == MAX_ACTIONS){
    switchPlayer();
  }


  drawBoards();
  if(isNotEmpty(selectedUnit)){
    selectedUnit.drawMoveRange(window[selectedUnit.color+'Board'].ctx);
    selectedUnit.drawAtkRange(window[selectedUnit.color+'Board'].ctx);
  }

  document.getElementById('wizard_flip').style.display = "none"
  if(isNotEmpty(selectedUnit))
    if(selectedUnit.type === 'wizard')
      document.getElementById('wizard_flip').style.display = ""

};
canvasL.onclick = function(event) {clickHandler(event, WHITE)};
canvasB.onclick = function(event) {clickHandler(event, BLACK)};

/**
 * Onclick event
 * @param event The mouse event object
 */
hoverHanlder = function(event) {

}

/**
 * Asset pre-loader object. Loads all images and sounds
 */
assetLoader = new function() {
  // images
  this.imgs        = {
    'white_tile'        : 'imgs/white-tile.png',
    'black_tile'        : 'imgs/black-tile.png',
    'warrior_white'     : 'imgs/warrior-white.png',
    'archer_white'      : 'imgs/archer-white.png',
    'wizard_orth_white' : 'imgs/wizard-orth-white.png',
    'wizard_diag_white' : 'imgs/wizard-diag-white.png',
    'warrior_black'     : 'imgs/warrior-black.png',
    'archer_black'      : 'imgs/archer-black.png',
    'wizard_orth_black' : 'imgs/wizard-orth-black.png',
    'wizard_diag_black' : 'imgs/wizard-diag-black.png'
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


//  TTTTTTT    IIIII    LL         EEEEEEE
//    TTT       III     LL         EE
//    TTT       III     LL         EEEEE
//    TTT       III     LL         EE
//    TTT      IIIII    LLLLLLL    EEEEEEE
//
/**
 * Tile object
 * @param color The color type for the tile (white, black)
 */
function Tile(color) {
  this.type = color;          // white, black
  this.img  = color+'_tile';  // key to the assetLoader.imgs object
  this.unit = {};             // reference to the Unit object that is on the tile
  this.loc  = WHITE;          // white by default, indicates if tile is on the white or black board
  /**
   * Draw the tile
   * @param ctx The canvas context to draw to
   */
  this.draw = function(ctx, row, col) {
    ctx.drawImage(assetLoader.imgs[this.img], col * TILE_SIZE, row * TILE_SIZE);

    // draw the unit on the square if there is one
    if (isNotEmpty(this.unit)) {
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

  /**
   * Draw the board tiles
   */
  this.draw = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = 'rgba(0, 0, 0, .1)';

    for (var row = 0; row < LENGTH; row++) {
      for (var col = 0; col < LENGTH; col++) {
        this.board[row][col].draw(this.ctx, row, col);

        // alternate drawing tiles lighter or darker
        if ((row % 2 && col % 2) || (!(row % 2) && !(col % 2))) {
          this.ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
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
    'col'  : 0,
    'board': WHITE           // default board is white
  };
  this.color       = '';     // white, black
  this.type        = '';     // warrior, archer, wizard

  this.isSelected  = false;  // if the unit is currently selected

  // action stats
  this.actionLimit  = 2;      // how many actions the unit can perform per turn
  this.moveLimit    = 2;      // how many move actions the unit can perform per turn
  this.atkLimit     = 1;      // how many attack actions the unit can perform per turn
  this.moveActions  = 0;      // the current move actions the unit has performed this turn
  this.atkActions   = 0;      // the current attack actions the unit has performed this turn

  // unit stats
  this.hp           = 0;     // health
  this.spd          = 0;     // movement speed (how far unit can move)
  this.rng          = 0;     // attack range (how far unit can attack)
  this.dmg          = 0;     // damage

  this.switchBoard = function(){
    if(this.loc.board === WHITE)
      this.loc.board = BLACK;
    else
      this.loc.board = WHITE;
  }

  /**
   * Draw the unit to the board
   * Function should overwritten if it is different from the base draw function
   * @param ctx The canvas context to draw on
   */
  this.draw = function(ctx) {
    ctx.drawImage(assetLoader.imgs[this.type + '_' + this.color], this.loc.col * TILE_SIZE, this.loc.row * TILE_SIZE);
  };

  /**
   * Draw the unit's move range to the board
   * @param ctx The canvas context to draw on
   */
  this.drawMoveRange = function(ctx) {
    // Highlight movement outline
    ctx.lineWidth   = 2;
    ctx.fillStyle   = 'rgba(72, 97, 196, .2)';
    ctx.strokeStyle = '#4861C4';

    for (var row = this.loc.row - this.spd, endRow = this.loc.row + this.spd; row <= endRow; row++) {
      for (var col = this.loc.col - this.spd, endCol = this.loc.col + this.spd; col <= endCol; col++) {
        if (this.inMoveRange(row, col)) {
          ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.strokeRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  };

  /**
   * Draw the unit's attack range to the board
   * Function should overwritten if it is different from the base drawAtkRange function
   * @param ctx The canvas context to draw on
   */
  this.drawAtkRange = function(ctx) {
    // Highlight movement outline
    ctx.lineWidth   = 2;
    ctx.fillStyle   = 'rgba(186, 7, 37, .2)';
    ctx.strokeStyle = '#BA0725';

    for (var row = this.loc.row - this.spd, endRow = this.loc.row + this.spd; row <= endRow; row++) {
      for (var col = this.loc.col - this.spd, endCol = this.loc.col + this.spd; col <= endCol; col++) {
        if (this.inAtkRange(row, col)) {
          ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.strokeRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }
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
      this.moveActions++;
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
    if (this.canAttack() && this.inAtkRange(row, col)) {
      // do something

      this.atkActions++;
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
    return this.moveActions < this.moveLimit;
  };

  /**
   * If the unit can attack this turn
   *
   * @return True if the unit can use it's power, false otherwise
   */
  this.canAttack = function() {
    return this.atkActions < this.atkLimit;
  };

  /**
   * If the unit can has any actions left this turn
   *
   * @return True if the unit can use it's power, false otherwise
   */
  this.hasActions = function() {
    return this.moveActions + this.atkActions < this.actionLimit;
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
    this.moveActions  = 0;
    this.atkActions   = 0;
  };
}


//  CCCCC  LL        AAA    SSSSS   SSSSS  EEEEEEE  SSSSS
// CC    C LL       AAAAA  SS      SS      EE      SS
// CC      LL      AA   AA  SSSSS   SSSSS  EEEEE    SSSSS
// CC    C LL      AAAAAAA      SS      SS EE           SS
//  CCCCC  LLLLLLL AA   AA  SSSSS   SSSSS  EEEEEEE  SSSSS
/**
 * Warrior class
 * @param color The color to assign the unit
 */
function Warrior(color, loc) {
  this.color = color;
  this.type  = WARRIOR;
  this.loc   = loc;

  this.hp    = 3;
  this.spd   = 2;
  this.rng   = 1;
  this.dmg   = 2;
}
Warrior.prototype = new Unit(); // set up inheritance

/**
 * Archer class
 * @param color The color to assign the unit
 */
function Archer(color, loc) {
  this.color = color;
  this.type  = ARCHER;
  this.loc   = loc;

  this.hp    = 2;
  this.spd   = 3;
  this.rng   = 2;
  this.dmg   = 2;
}
Archer.prototype = new Unit(); // set up inheritance

/**
 * Wizard class
 * @param color The color to assign the unit
 */
function Wizard(color, loc, spell) {
  this.color = color;
  this.type  = WIZARD;
  this.loc   = loc;
  this.spell = spell;

  this.hp    = 5;
  this.spd   = 4;

  /**
   * Draw the Wizards to the board
   * @param ctx The canvas context to draw on
   */
  this.draw = function(ctx) {
    ctx.drawImage(assetLoader.imgs[this.type + '_' + this.spell + '_' + this.color], this.loc.col * TILE_SIZE, this.loc.row * TILE_SIZE);
  };

  /**
   * Performs the Wizards flip attack
   *
   * @return True if the Wizard can use it's power, false otherwise
   */
  this.attack = function() {
    return;
  };

  /**
   * Draw the Wizards's attack range to the board
   * @param ctx The canvas context to draw on
   */
  this.drawAtkRange = function(ctx) {
    // Highlight movement outline
    ctx.lineWidth   = 2;
    ctx.fillStyle   = 'rgba(7, 186, 31, .2)';
    ctx.strokeStyle = '#07BA1F';

    if (this.spell === ORTH) {
      for (var i = 0; i < LENGTH; i++) {
        ctx.fillRect(i * TILE_SIZE, this.loc.row * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        if (i !== this.loc.row) {
          ctx.fillRect(this.loc.col * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }
    else if (this.spell === DIAG) {
      var row1, row2
      for (var i = 0; i < LENGTH; i++) {
        row1 = this.loc.row - (this.loc.col - i);
        row2 = this.loc.row + (this.loc.col - i);

        if (row1 < LENGTH && row1 >= 0) {
          ctx.fillRect(i * TILE_SIZE, row1 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }

        if (row2 < LENGTH && row2 >= 0 && row1 != row2) {
          ctx.fillRect(i * TILE_SIZE, row2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }
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

function populate_boards() {
  // add light units to board
  var row = 0;
  for(var i=0; i<LENGTH; i++){
    if(i==0){ whiteBoard.board[row][i].unit=new Wizard(WHITE, {row: row, col: i, board: WHITE}, ORTH) }
    if(i==1){ whiteBoard.board[row][i].unit=new Warrior(WHITE, {row: row, col: i, board: WHITE}) }
    if(i==2){ whiteBoard.board[row][i].unit=new Archer(WHITE, {row: row, col: i, board: WHITE}) }
    if(i==3){ whiteBoard.board[row][i].unit=new Warrior(WHITE, {row: row, col: i, board: WHITE}) }
    if(i==4){ whiteBoard.board[row][i].unit=new Archer(WHITE, {row: row, col: i, board: WHITE}) }
    if(i==5){ whiteBoard.board[row][i].unit=new Warrior(WHITE, {row: row, col: i, board: WHITE}) }
    if(i==6){ whiteBoard.board[row][i].unit=new Archer(WHITE, {row: row, col: i, board: WHITE}) }
    if(i==7){ whiteBoard.board[row][i].unit=new Wizard(WHITE, {row: row, col: i, board: WHITE}, DIAG) }
  }

  // add dark units to board
  row = 7
  for(var i=0; i<LENGTH; i++){
    if(i==0){ blackBoard.board[row][i].unit=new Wizard(BLACK, {row: row, col: i, board: BLACK}, DIAG) }
    if(i==1){ blackBoard.board[row][i].unit=new Warrior(BLACK, {row: row, col: i, board: BLACK}) }
    if(i==2){ blackBoard.board[row][i].unit=new Archer(BLACK, {row: row, col: i, board: BLACK}) }
    if(i==3){ blackBoard.board[row][i].unit=new Warrior(BLACK, {row: row, col: i, board: BLACK}) }
    if(i==4){ blackBoard.board[row][i].unit=new Archer(BLACK, {row: row, col: i, board: BLACK}) }
    if(i==5){ blackBoard.board[row][i].unit=new Warrior(BLACK, {row: row, col: i, board: BLACK}) }
    if(i==6){ blackBoard.board[row][i].unit=new Archer(BLACK, {row: row, col: i, board: BLACK}) }
    if(i==7){ blackBoard.board[row][i].unit=new Wizard(BLACK, {row: row, col: i, board: BLACK}, ORTH) }
  }
}

/**
 * Reset the game
 */
function reset() {
  whiteBoard.reset();
  blackBoard.reset();
  populate_boards();
  drawBoards();
}

/**
 * Start the game
 */
function startGame() {
  whiteBoard = new Board(WHITE);
  blackBoard = new Board(BLACK);
  populate_boards();
  drawBoards();
}