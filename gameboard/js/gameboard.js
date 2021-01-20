//Start anonymous scope
;
(function() {

  //------------------------------------------------------------------------------
  // Util Functions
  //------------------------------------------------------------------------------
  var COLUMNS = 'abcdefg'.split('');

  function createPosObj() {
    let position = {};

    for (let i = 0; i < 7; i++) {
      let column = COLUMNS[i];

      let newColumn = new Array(6);
      for (var j = 0; j < newColumn.length; j++) {
        newColumn[j] = null;
      }
      position[column] = newColumn;
    }

    return position;
  }

  function checkVertical(move, position) {
    if (!move) return false;

    let x = COLUMNS.indexOf(move.column);
    let y = Number(move.row);
    let color = position[COLUMNS[x]][y];
    let column = position[COLUMNS[x]];

    let counter = 0;
    for (var i = 0; i < column.length; i++) {
      if (column[i] === color) {
        counter++;
        if (counter === 4) return true;
      } else {
        counter = 0;
      }
    }
    return false;
  }

  function checkHorizontal(move, position) {
    if (!move) return false;

    let x = COLUMNS.indexOf(move.column);
    let y = Number(move.row);
    let color = position[COLUMNS[x]][y];
    let row = [];

    for (let i of COLUMNS) {
      row.push(position[i][y]);
    }

    let counter = 0;
    for (var i = 0; i < row.length; i++) {
      if (row[i] === color) {
        counter++;
        if (counter === 4) return true;
      } else {
        counter = 0;
      }
    }
    return false;
  }

  function checkPosDiagonal(move, position) {
    if (!move) return false;

    let x = COLUMNS.indexOf(move.column);
    let y = Number(move.row);
    let color = position[COLUMNS[x]][y];

    let d = Math.min(x, y);
    let tx = x - d;
    let ty = y - d;

    let counter = 0;
    while (tx < 7 && ty < 6) {
      let posDiagonal = position[COLUMNS[tx]][ty];

      if (posDiagonal === color) {
        counter++;
        if (counter === 4) return true;
      } else {
        counter = 0;
      }

      tx++;
      ty++;
    }

    return false;
  }

  function checkNegDiagonal(move, position) {
    if (!move) return false;

    let x = COLUMNS.indexOf(move.column);
    let y = Number(move.row);
    let color = position[COLUMNS[x]][y];

    let d = Math.min(x, 5 - y);
    let tx = x - d;
    let ty = y + d;

    let counter = 0;
    while (tx < 7 && ty > -1) {
      let posDiagonal = position[COLUMNS[tx]][ty];

      if (posDiagonal === color) {
        counter++;
        if (counter === 4) return true;
      } else {
        counter = 0;
      }

      tx++;
      ty--;
    }

    return false;
  }
  Array.prototype.pushAtEmpty = function(element) {
    let index;
    for (index = 0; index < this.length; index++) {
      if (this[index] === null) {
        this.splice(index, 1, element);
        break;
      };
    };
    if (index === this.length) {
      return false;
    }
    return index;
  };



  window['Board'] = window['Board'] || function(containerElOrId, cfg) {
    'use strict';

    cfg = cfg || {};

    //------------------------------------------------------------------------------
    // Constants
    //------------------------------------------------------------------------------

    var MINIMUM_JQUERY_VERSION = '1.7.0',
      START_POSITION = createPosObj();

    var CSS = {
      alpha: 'alpha-d2270',
      blue: 'blue-vp7jdt',
      board: 'board-b72b1',
      clearfix: 'clearfix-7da63',
      gameboard: 'gameboard-63f37',
      red: 'red-se2h1c',
      row: 'row-5277c',
      piece: 'piece-417db',
      square: 'square-55d63',
      white: 'white-1e1d7'
    };

    //------------------------------------------------------------------------------
    // Module Variables
    //------------------------------------------------------------------------------

    // DOM elements
    var containerEl,
      boardEl;

    // constructor object
    var widget = {};

    //------------------------------------------------------------------------------
    // Stateful
    //------------------------------------------------------------------------------

    var ANIMATION_HAPPENING = false,
      BOARD_BORDER_SIZE = 2,
      CURRENT_PLAYER = 'blue',
      CURRENT_POSITION = {},
      GAME_OVER = false,
      LAST_MOVE,
      SQUARE_SIZE,
      SQUARE_ELS_IDS = {};


    //------------------------------------------------------------------------------
    // JS Util Functions
    //------------------------------------------------------------------------------
    function createId() {
      return 'xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/x/g, function(c) {
        var r = Math.random() * 16 | 0;
        return r.toString(16);
      });
    }

    function deepCopy(thing) {
      return JSON.parse(JSON.stringify(thing));
    }

    function compareSemVer(version, minimum) {
      version = parseSemVer(version);
      minimum = parseSemVer(minimum);

      var versionNum = (version.major * 10000 * 10000) +
        (version.minor * 10000) + version.patch;
      var minimumNum = (minimum.major * 10000 * 10000) +
        (minimum.minor * 10000) + minimum.patch;

      return (versionNum >= minimumNum);
    }

    function parseSemVer(version) {
      var tmp = version.split('.');
      return {
        major: parseInt(tmp[0], 10),
        minor: parseInt(tmp[1], 10),
        patch: parseInt(tmp[2], 10)
      };
    }

    //------------------------------------------------------------------------------
    // Validation / Errors
    //------------------------------------------------------------------------------

    // check dependencies
    function checkDeps() {
      // if containerId is a string, it must be the ID of a DOM node
      if (typeof containerElOrId === 'string') {

        // make sure the container element exists in the DOM
        var el = document.getElementById(containerElOrId);
        if (!el) return false;


        // set the containerEl
        containerEl = $(el);
      }

      // else it must be something that becomes a jQuery collection
      // with size 1
      // ie: a single DOM node or jQuery object
      else {
        containerEl = $(containerElOrId);

        if (containerEl.length !== 1) {
          window.alert('ChessBoard Error 1003: The first argument to ' +
            'ChessBoard() must be an ID or a single DOM node.' +
            '\n\nExiting...');
          return false;
        }
      }
      // JSON must exist
      if (!window.JSON ||
        typeof JSON.stringify !== 'function' ||
        typeof JSON.parse !== 'function') {
        window.alert('ChessBoard Error 1004: JSON does not exist. ' +
          'Please include a JSON polyfill.\n\nExiting...');
        return false;
      }

      // check for a compatible version of jQuery
      if (!(typeof window.$ && $.fn && $.fn.jquery &&
          compareSemVer($.fn.jquery, MINIMUM_JQUERY_VERSION) === true)) {
        window.alert('ChessBoard Error 1005: Unable to find a valid version ' +
          'of jQuery. Please include jQuery ' + MINIMUM_JQUERY_VERSION + ' or ' +
          'higher on the page.\n\nExiting...');
        return false;
      }

      return true;
    }

    function expandConfig() {

      if (cfg.hasOwnProperty('position') === true) {
        if (cfg.position === 'start') {
          CURRENT_POSITION = deepCopy(START_POSITION);
          // } else if (validPositionObject(cfg.position) === true) {
          //   CURRENT_POSITION = deepCopy(cfg.position);
        }
      }

      if (cfg.color !== 'red') {
        cfg.color = 'blue';
      }
      CURRENT_PLAYER = cfg.color;

      if (cfg.hasOwnProperty('pieceTheme') !== true ||
        (typeof cfg.pieceTheme !== 'string' &&
          typeof cfg.pieceTheme !== 'function')) {
        cfg.pieceTheme = 'img/pieces/standard/{piece}.png';
      }

      return true;
    }

    //------------------------------------------------------------------------------
    // Misc DOM
    //------------------------------------------------------------------------------

    function calculateSquareSize() {
      var containerWidth = parseInt(containerEl.css('width'), 10);

      if (!containerWidth || containerWidth <= 0) {
        return 0;
      }
      var boardWidth = containerWidth - 1;

      while (boardWidth % 7 !== 0 && boardWidth > 0) {
        boardWidth--;
      }
      return (boardWidth / 7);
    }

    // create random IDs for elements
    function createElIds() {
      // squares on the board
      for (var i = 0; i < COLUMNS.length; i++) {
        for (var j = 1; j <= 6; j++) {
          var square = COLUMNS[i] + j;
          SQUARE_ELS_IDS[square] = square + '-' + createId();
        }
      }
    }


    //------------------------------------------------------------------------------
    // Markup Building
    //------------------------------------------------------------------------------

    function buildBoardContainer() {
      var html = '<div class="' + CSS.gameboard + '">';
      html += '<div class="' + CSS.board + '"></div>';
      html += '</div>';
      return html;
    }

    function buildBoard() {
      var html = '';

      var alpha = deepCopy(COLUMNS);
      var row = 5;

      var squareColor = 'white';
      for (var i = 0; i < 6; i++) {
        html += '<div class="' + CSS.row + '">';
        for (var j = 0; j < 7; j++) {
          var square = alpha[j] + row;
          var column = alpha[j];

          html += '<div class="' + CSS.square + ' ' + CSS[squareColor] + ' ' +
            'column-' + column + ' ' +
            'square-' + square + '" ' +
            'style="width: ' + SQUARE_SIZE + 'px; height: ' + SQUARE_SIZE + 'px" ' +
            'id="' + SQUARE_ELS_IDS[square] + '" ' +
            'data-column="' + column + '" ' +
            'data-square="' + square + '">';

          html += '</div>';
        }
        html += '<div class="' + CSS.clearfix + '"></div></div>';
        row--;
      }
      return html;
    }

    function buildPieceImgSrc(piece) {
      if (typeof cfg.pieceTheme === 'function') {
        return cfg.pieceTheme(piece);
      }

      if (typeof cfg.pieceTheme === 'string') {
        return cfg.pieceTheme.replace(/{piece}/g, piece);
      }
    }

    function buildPiece(piece, id) {
      var html = '<img src="' + buildPieceImgSrc(piece) + '" ';
      if (id && typeof id === 'string') {
        html += 'id="' + id + '" ';
      }
      html += 'alt="" ' +
        'class="' + CSS.piece + '" ' +
        'data-piece="' + piece + '" ' +
        'style="width: ' + (SQUARE_SIZE - 1) + 'px;' +
        'height: ' + (SQUARE_SIZE - 1) + 'px;';

      html += '" />';

      return html;
    }



    //------------------------------------------------------------------------------
    // Control Flow
    //------------------------------------------------------------------------------

    function drawPosition() {
      boardEl.find('.' + CSS.piece).remove();

      for (var column in CURRENT_POSITION) {
        var colArr = CURRENT_POSITION[column]
        for (var i = 0; i < colArr.length; i++) {
          if (!colArr[i]) continue;
          let color = colArr[i];
          $("div[data-square='" + column + i + "']").append(buildPiece(CURRENT_POSITION[column][i]));
        }
      }
    }


    function drawBoard() {
      boardEl.html(buildBoard());
      drawPosition();
    }


    function dropPiece(column) {
      if (typeof cfg.onDropStart === 'function' &&
        cfg.onDropStart() === false) return;

      var index = CURRENT_POSITION[column].pushAtEmpty(color);
      if (index === false) return;

      drawPosition();

      LAST_MOVE = {
        column: column,
        row: index.toString(10),
        square: column + index
      }

      if (cfg.hasOwnProperty('onDrop') === true &&
        typeof cfg.onDrop === 'function') {
        cfg.onDrop(LAST_MOVE, CURRENT_POSITION);
      }
      CURRENT_PLAYER = changePlayer(CURRENT_PLAYER);
    }

    function gameIsOver() {
      if (GAME_OVER) return true;

      if (checkVertical(LAST_MOVE, CURRENT_POSITION) || checkHorizontal(LAST_MOVE, CURRENT_POSITION) ||
        checkPosDiagonal(LAST_MOVE, CURRENT_POSITION) || checkNegDiagonal(LAST_MOVE, CURRENT_POSITION)) {
        GAME_OVER = true;
        return true;
      }

      return false;
    }

    function changePlayer(player) {
      if (player === 'blue') {
        return 'red';
      }
      if (player == 'red') {
        return 'blue';
      }
    }

    //------------------------------------------------------------------------------
    // Public Methods
    //------------------------------------------------------------------------------

    widget.resize = function() {
      // calulate the new square size
      SQUARE_SIZE = calculateSquareSize();
      // set board width
      boardEl.css('width', (SQUARE_SIZE * 7) + 'px');
      // redraw the board
      drawBoard();
    };

    widget.gameOver = function() {
      if (cfg.hasOwnProperty('onGameOver') !== true ||
        typeof cfg.onGameOver !== 'function') {
        return
      }

      if (gameIsOver()) {
        cfg.onGameOver();
        return true;
      }

    };

    widget.turn = function() {
      if (CURRENT_PLAYER === 'blue') {
        return 'red';
      } else {
        return 'blue';
      }
    }

    widget.move = function(position, move) {
      if (CURRENT_POSITION === position) return;
      CURRENT_POSITION = position;
      LAST_MOVE = move;
      drawPosition();

      CURRENT_PLAYER = changePlayer(CURRENT_PLAYER);
    };

    //------------------------------------------------------------------------------
    // Browser Events
    //------------------------------------------------------------------------------

    function stopDefault(e) {
      e.preventDefault();
    }

    function mouseenterColumn(e) {
      if (cfg.hasOwnProperty('onMouseoverColumn') !== true ||
        typeof cfg.onMouseoverColumn !== 'function') return;

      // get the column and square
      var column = $(e.currentTarget).attr('data-column');
      var square = $(e.currentTarget).attr('data-square');


      // execute their function
      cfg.onMouseoverColumn(column, square);
    }

    function mouseleaveColumn(e) {
      if (cfg.hasOwnProperty('onMouseoutColumn') !== true ||
        typeof cfg.onMouseoutColumn !== 'function') return;

      // get the column
      var column = $(e.currentTarget).attr('data-column');

      // execute their function
      cfg.onMouseoutColumn(column);
    }

    function mousedownColumn(e) {
      // get the column
      dropPiece($(e.currentTarget).attr('data-column'));
    }

    //------------------------------------------------------------------------------
    // Initialization
    //------------------------------------------------------------------------------

    function addEvents() {
      // prevent browser "image drag"
      $('body').on('mousedown mousemove', '.' + CSS.piece, stopDefault);

      // mouse enter / leave square
      boardEl.on('mouseenter', '.' + CSS.square, mouseenterColumn);
      boardEl.on('mouseleave', '.' + CSS.square, mouseleaveColumn);

      //Button presses
      boardEl.on('mousedown', '.' + CSS.square, mousedownColumn)
    }


    function initDom() {
      // build board and save it in memory
      containerEl.html(buildBoardContainer());
      boardEl = containerEl.find('.' + CSS.board);

      // get the border size
      BOARD_BORDER_SIZE = parseInt(boardEl.css('borderLeftWidth'), 10);

      // set the size and draw the board
      widget.resize();
    }

    function init() {
      if (checkDeps() !== true || expandConfig() !== true) return;

      createElIds();

      initDom();
      addEvents();
    }

    //go time
    init();

    return widget;
  } // End of window.Board


})();