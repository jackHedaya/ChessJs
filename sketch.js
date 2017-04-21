// Copyright Jack Hedaya (c) 2017 Copyright Holder All Rights Reserved.

var mouseX;
var mouseY;

var finalSizeW;
var finalSizeH;

var images = {};

var tileSize;

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
    [0, 0, 0, 0, 3, 0, 0, 0],
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

var board = [
  [12, 13, 14, 15, 16, 14, 13, 12],
  [11, 11, 11, 11, 11, 11, 11, 11],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [2, 3, 4, 5, 6, 4, 3, 2],
];

var selected = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

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

  fill(254, 254, 254);
  rect(0, 0, cnv.width, cnv.height);

  finalSizeW = (cnv.width - cnv.height) / 2;
  finalSizeH = cnv.height;

  tileSize = finalSizeH / 8;

  fill(random(255), random(255), random(255));
  rect(finalSizeW, 0, finalSizeH, finalSizeH);

  drawAll();
}

function draw() {}

function mouseClicked() {
  var pixelColor = {
    Red: get(mouseX, mouseY)[0],
    Green: get(mouseX, mouseY)[1],
    Blue: get(mouseX, mouseY)[2],
    Color: color(get(mouseX, mouseY)[0], get(mouseX, mouseY)[1], get(mouseX, mouseY)[2])
  }

  let countObj = 0;

  let position = {};

  external:
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      let posColor1 = color(119 - countObj, 136 - countObj, 153 - countObj);
      let posColor2 = color(105 - countObj, 105 - countObj, 105 - countObj);


      if ((compareColors(pixelColor.Color, posColor1)) || (compareColors(pixelColor.Color, posColor2))) {
        position.y = j;
        position.x = i;
        print("(" + position.y + ', ' + position.x + ")");
        break external;
      } else if (compareColors(pixelColor.Color, color(255, 127, 80)))
      {
        selected = defaults.selected;
        drawAll();
        return;
      }

      countObj++;
    }
  }

  if (objectIsEmpty(position)) {
    console.error("Position not detected");
    return;
  }

  switch (board[position.y][position.x]) {
    case 1:
      selected = possiblePawn(board, position.y, position.x);
      break
    case 2:
      selected = possibleRook(board, position.y, position.x);
      break
    case 3:
      selected = possibleKnight(board, position.y, position.x);
      break;
    case 6:
      selected = possibleKing(board, position.y, position.x);
      break;
    default:
      print("Coming soon...!");
      break
  }

  drawAll();
}

function drawBoard(selected) {
  let isWhiteT = true;

  let subAmount = 0;

  for (var i = 0; i < selected.length; i++) {
    for (var j = 0; j < selected[i].length; j++) {
      if (isWhiteT) {
        fill(119 - subAmount, 136 - subAmount, 153 - subAmount);
      } else {
        fill(105 - subAmount, 105 - subAmount, 105 - subAmount);
      }

      if (selected[j][i] === 1) {
        if (board[j][i] > 10)
        {
          fill(255, 38, 49);
        } else {
          fill(240, 230, 140);
        }
      } else if (selected[j][i] === 2) {
        fill(255, 127, 80);
      } else {}

      rect(finalSizeW + tileSize * i, j * tileSize, tileSize, tileSize);
      isWhiteT = !isWhiteT;

      subAmount += 1;
    }

    isWhiteT = !isWhiteT
  }
}

function drawPieces() {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      if (isNotWhitePiece(board[i][j])) {
        tint(20, 20, 20);
      } else if (board[i][j] > 0) {
        tint(255, 255, 255);
      }

      switch (board[i][j]) {
        case 1:
        case 11:
          image(images.pawn, finalSizeW + tileSize * j, i * tileSize, tileSize, tileSize);
          break
        case 2:
        case 12:
          image(images.rook, finalSizeW + tileSize * j, i * tileSize, tileSize, tileSize);
          break
        case 3:
        case 13:
          image(images.knight, finalSizeW + tileSize * j, i * tileSize, tileSize, tileSize);
          break
        case 4:
        case 14:
          image(images.bishop, finalSizeW + tileSize * j, i * tileSize, tileSize, tileSize);
          break
        case 5:
        case 15:
          image(images.queen, finalSizeW + tileSize * j, i * tileSize, tileSize, tileSize);
          break
        case 6:
        case 16:
          image(images.king, finalSizeW + tileSize * j, i * tileSize, tileSize, tileSize);
          break
      }
    }
  }
}

function drawAll() {
  drawBoard(selected);
  drawPieces();
}
