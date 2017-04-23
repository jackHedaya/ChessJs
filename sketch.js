// Copyright Jack Hedaya (c) 2017 Copyright Holder All Rights Reserved.

var mouseX;
var mouseY;

var finalSizeW;
var finalSizeH;

var images = {};

var tileSize;

var jagged = 15;

const Pieces = {
  White: {
    Pawn: 1,
    Rook: 2,
    Knight: 3,
    Bishop: 4,
    Queen: 5,
    King: 6
  },
  Black: {
    Pawn: 11,
    Rook: 12,
    Knight: 13,
    Bishop: 14,
    Queen: 15,
    King: 16
  }
}

var defaults = {
  board: [
    [12, 13, 14, 15, 16, 14, 13, 12],
    [11, 11, 11, 11, 11, 11, 11, 11],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [2, 3, 4, 5, 6, 4, 3, 2],
  ],

  selected: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ]
}

var board = defaults.board;

var selected = defaults.selected;

var subtractColor = [
  [0, 1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20, 21, 22, 23],
  [24, 25, 26, 27, 28, 29, 30, 31],
  [32, 33, 34, 35, 36, 37, 38, 39],
  [40, 41, 42, 43, 44, 45, 46, 47],
  [48, 49, 50, 51, 52, 53, 54, 55],
  [56, 57, 58, 59, 60, 61, 62, 63],
];

var movement = {}

function preload() {
  images.pawn = loadImage("assets/pieces/Pawn.png");
  images.rook = loadImage("assets/pieces/Rook.png");
  images.bishop = loadImage("assets/pieces/Bishop.png");
  images.knight = loadImage("assets/pieces/Knight.png");
  images.king = loadImage("assets/pieces/King.png");
  images.queen = loadImage("assets/pieces/Queen.png");
}

function setup() {
  var cnv = createCanvas(windowWidth, windowHeight);

  fill('#C7D3FF');
  rect(0, 0, cnv.width, cnv.height);

  finalSizeW = (cnv.width - cnv.height) / 2;
  finalSizeH = cnv.height;

  tileSize = finalSizeH / 8;

  drawAll();
}

function draw() {}

async function mouseClicked() {
  if (movement.oLocX) {return;}

  var pixelColor = {
    red: get(mouseX, mouseY)[0],
    green: get(mouseX, mouseY)[1],
    Blue: get(mouseX, mouseY)[2],
    color: color(get(mouseX, mouseY)[0], get(mouseX, mouseY)[1], get(mouseX, mouseY)[2])
  }

  var position = null;

  external:
    for (var i = 0; i < board.length; i++) {
      for (var j = 0; j < board[i].length; j++) {
        let posColor1 = color(119 - subtractColor[j][i], 136 - subtractColor[j][i], 153 - subtractColor[j][i]);
        let posColor2 = color(105 - subtractColor[j][i], 105 - subtractColor[j][i], 105 - subtractColor[j][i]);
        let posColor3 = color(240 - subtractColor[j][i], 230 - subtractColor[j][i], 140 - subtractColor[j][i]);
        let posColor4 = color(20 + subtractColor[i][j], 20 + subtractColor[i][j], 20 + subtractColor[i][j]);
        let posColor5 = color(255 - subtractColor[i][j], 255 - subtractColor[i][j], 255 - subtractColor[i][j]);

        if ((compareColors(pixelColor.color, posColor1)) || (compareColors(pixelColor.color, posColor2))) {
          position = new Position(j, i);

          print("(" + position.y + ', ' + position.x + ")");

          break external;
        } else if (compareColors(pixelColor.color, color(255, 127, 80))) {
          selected = defaults.selected;

          drawAll();
          return;
        } else if (compareColors(pixelColor.color, posColor3)) {
          position = new Position(j, i);
          print("(" + position.y + ', ' + position.x + ")");

          var startPos = whatPosition(2, selected);

          calcMov(startPos, position);

          selected = defaults.selected;

          for (var i = 0; i < jagged; i++) {

            drawAll();

            await sleep(1);
          }

          board[position.y][position.x] = board[startPos.y][startPos.x];
          board[startPos.y][startPos.x] = 0;

          delete movement.oLocX;
          delete movement.oLocY;

          drawAll();
          return;
        } else if (compareColors(pixelColor.color, posColor5))
        {
          if (selected[i][j] === 2)
          {
            selected = defaults.selected;
            drawAll();
            return;
          } else
          {
            position = new Position(i, j);

            print("(" + position.y + ', ' + position.x + ")");

            break external;
          }
        }
      }
    }

  if (position === null) {
    console.error("Position not detected");
    return;
  }

  switch (board[position.y][position.x]) {
    case 0:
      selected = defaults.selected;
      break;
    case 1:
      selected = possiblePawn(board, position.y, position.x);
      break;
    case 2:
      selected = possibleRook(board, position.y, position.x);
      break;
    case 3:
      selected = possibleKnight(board, position.y, position.x);
      break;
    case 4:
      selected = possibleBishop(board, position.y, position.x);
      break;
    case 5:
      selected = possibleQueen(board, position.y, position.x);
      break;
    case 6:
      selected = possibleKing(board, position.y, position.x);
      break;
    default:
      print("Huh?! Are you some form of extraterrestrial chess piece? Mr. " + board[position.y][position.x]);
      break;
  }

  drawAll();
}

function calcMov(start, end) {

  var changingY = (end.y - start.y) * tileSize;
  var changingX = (end.x - start.x) * tileSize;

  var pixJumpX = changingX / jagged;
  var pixJumpY = changingY / jagged;

  movement.oX = pixJumpX;
  movement.oY = pixJumpY;

  movement.oLocX = start.x;
  movement.oLocY = start.y;

  movement.x = movement.oX;
  movement.y = movement.oY;
}

function drawBoard(selected) {
  let isWhiteT = true;

  for (var i = 0; i < selected.length; i++) {
    for (var j = 0; j < selected[i].length; j++) {
      if (isWhiteT) {
        fill(119 - subtractColor[j][i], 136 - subtractColor[j][i], 153 - subtractColor[j][i]);
      } else {
        fill(105 - subtractColor[j][i], 105 - subtractColor[j][i], 105 - subtractColor[j][i]);
      }

      if (selected[j][i] === 1) {
        if (board[j][i] > 10) {
          fill(255 - subtractColor[j][i], 38 - subtractColor[j][i], 49 - subtractColor[j][i]);
        } else {
          fill(240 - subtractColor[j][i], 230 - subtractColor[j][i], 140 - subtractColor[j][i]);
        }
      } else if (selected[j][i] === 2) {
        fill(255, 127, 80);
      } else {}

      rect(finalSizeW + tileSize * i, j * tileSize, tileSize, tileSize);
      isWhiteT = !isWhiteT;
    }

    isWhiteT = !isWhiteT;
  }
}

function drawPieces() {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {

      var adder = {
        x: 0,
        y: 0
      }

      if (isNotWhitePiece(board[i][j])) {
        tint(20 + subtractColor[i][j], 20 + subtractColor[i][j], 20 + subtractColor[i][j]);
      } else if (board[i][j] > 0) {
        tint(255 - subtractColor[i][j], 255 - subtractColor[i][j], 255 - subtractColor[i][j]);
      }

      if (i === movement.oLocY && j === movement.oLocX) {
        adder.x = movement.x;
        adder.y = movement.y;

        movement.x += movement.oX;
        movement.y += movement.oY;
      }

      var equX = finalSizeW + tileSize * j + adder.x;
      var equY = i * tileSize + adder.y;

      switch (board[i][j]) {
        case 1:
        case 11:
          image(images.pawn, equX, equY, tileSize, tileSize);
          break;
        case 2:
        case 12:
          image(images.rook, equX, equY, tileSize, tileSize);
          break;
        case 3:
        case 13:
          image(images.knight, equX, equY, tileSize, tileSize);
          break;
        case 4:
        case 14:
          image(images.bishop, equX, equY, tileSize, tileSize);
          break;
        case 5:
        case 15:
          image(images.queen, equX, equY, tileSize, tileSize);
          break;
        case 6:
        case 16:
          image(images.king, equX, equY, tileSize, tileSize);
          break;
      }
    }
  }
}

function drawAll() {
  drawBoard(selected);
  drawPieces();
}
