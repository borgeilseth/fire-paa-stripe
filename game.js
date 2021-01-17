//game = new Chess();
var socket = io();

var color = "blue";
var players;
var roomId;
var play = true;

var room = document.getElementById("room")
var roomNumber = document.getElementById("roomNumbers")
var button = document.getElementById("button")
var state = document.getElementById('state')

var connect = function() {
  roomId = parseInt(room.value);
  if (roomId !== "" && roomId < 100 && roomId >= 0) {
    room.remove();
    roomNumber.innerHTML = "Room Number " + roomId;
    button.remove();
    socket.emit('joined', roomId);
  }
}

socket.on('full', function(msg) {
  if (roomId == msg)
    window.location.assign(window.location.href + 'full.html');
});

socket.on('play', function(msg) {
  if (msg == roomId) {
    play = false;
    state.innerHTML = "Game in Progress"
  }
  // console.log(msg)
});

socket.on('move', function(msg) {
  console.log(msg);
  if (msg.room == roomId) {
    board.move(msg.position, msg.move);
  }
});

socket.on('gameOver', function(msg) {
  if (msg == roomId) {
    state.innerHTML = 'GAME OVER';
  }
});

socket.on('player', (msg) => {
  var plno = document.getElementById('player')
  color = msg.color;

  plno.innerHTML = 'Player ' + msg.players + " : " + color;
  players = msg.players;

  if (players == 2) {
    play = false;
    socket.emit('play', msg.roomId);
    state.innerHTML = "Game in Progress"
  } else
    state.innerHTML = "Waiting for Second player";

  var cfg = {
    color: 'blue',
    position: 'start',
    onMouseoutColumn: onMouseoutColumn,
    onMouseoverColumn: onMouseoverColumn,
    onDrop: onDrop,
    onDropStart: onDropStart
  };
  board = Board('board', cfg);
});
// console.log(color)

var board;

//-----------------------------------------------------------------------------------------------

var removeGreyColumns = function() {
  $('#board .square-55d63').css('background', '');
  //console.log($('#board .square-55d63'));
};

var greyColumn = function(column) {
  var columnEl = $('#board .column-' + column);

  for (var i = 0; i < columnEl.length; i++) {
    if ($(columnEl[i]).hasClass('blue-vp7jdt')) {
      $(columnEl[i]).css('background', '#504AE4');
    } else if ($(columnEl[i]).hasClass('red-se2h1c')) {
      $(columnEl[i]).css('background', '#F24A42');
    } else {
      $(columnEl[i]).css('background', '#DBCCB5');
    }
  }
};

var onMouseoverColumn = function(column, square) {
  // highlight the column they moused over
  greyColumn(column, square);
};

var onMouseoutColumn = function(column) {
  removeGreyColumns();
};

var onDrop = function(column, row, position) {
  removeGreyColumns();
  greyColumn(column);

  var move = {
    column: column,
    row: row.toString(10),
    square: column + row
  }

  if (board.game_over()) {
    console.log('Game over');
  }

  //Emit move to server
  socket.emit('move', {
    move: move,
    position: position,
    room: roomId
  });
}

var onDropStart = function(arguments) {
  if (play || board.game_over() === true ||
    board.turn() === color) {
    return false
  }
};