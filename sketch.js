// Copyright Jack Hedaya (c) 2017 Copyright Holder All Rights Reserved.

var account = {
  loggedIn: false,
  savePass: false,

  username: "–",
  password: "",
  wins: "-",
  losses: "-"
}

var register = {
  registerNow: false,

  selectedText: "",

  tempUser: "",
  tempPass: "",
  tempPassConf: ""
}

var menu = {
  opened: false
}

var mouseX;
var mouseY;

var finalSizeW;
var finalSizeH;

var images = {};

var tileSize;

var jagged = 15;

var cnv;

var roomID;

var fonts = {}

let swPawn = {
  sel: false
}

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

var killedPieces = {
  white: [],
  black: []
}

var movement = {}

var buttons = {}

var firstHandler;

function preload() {

  images.pawn = loadImage("assets/pieces/Pawn.png");
  images.rook = loadImage("assets/pieces/Rook.png");
  images.bishop = loadImage("assets/pieces/Bishop.png");
  images.knight = loadImage("assets/pieces/Knight.png");
  images.king = loadImage("assets/pieces/King.png");
  images.queen = loadImage("assets/pieces/Queen.png");

  images.check = loadImage("assets/icons/Check.png");
  images.x = loadImage("assets/icons/X.png");
  images.hamburgerBar = loadImage("assets/icons/Hamburger-Bar.png");

  fonts.toThePoint = loadFont('assets/fonts/To-The-Point.ttf');
  fonts.adlanta = loadFont('assets/fonts/Adlanta.otf');
  fonts.vegur = loadFont('assets/fonts/Vegur-Regular.otf');
  fonts.goodFish = loadFont('assets/fonts/Goodfish.ttf');
  fonts.vera = loadFont('assets/fonts/Bitstream-Vera.ttf');

  var config = {
    apiKey: "AIzaSyCky5zFbJiHtI9id13c28fGtakamyb6NHY",
    authDomain: "chess-7ee44.firebaseapp.com",
    databaseURL: "https://chess-7ee44.firebaseio.com",
    projectId: "chess-7ee44",
    storageBucket: "chess-7ee44.appspot.com",
    messagingSenderId: "387942735772"
  };

  firebase.initializeApp(config);

  roomID = generateInstanceID();
}

async function setup() {
  if (windowWidth > 1037 && windowHeight > 678) {
    cnv = createCanvas(windowWidth, windowHeight);
  } else {
    cnv = createCanvas(1037, 678);
  }

  fill('#C7D3FF');
  rect(0, 0, cnv.width, cnv.height);

  fill('blue')
  textFont(fonts.vera);
  textSize(18);
  var b = fonts.vera.textBounds("Loading...", 0, 0, 18);
  var dhx = cnv.width / 2 - b.w / 2;
  var dhy = cnv.height / 2 - b.h / 2;

  text("Loading...", dhx, dhy);

  finalSizeW = (cnv.width - cnv.height) / 2;
  finalSizeH = cnv.height;

  tileSize = finalSizeH / 8;
  setButtons();

  if (readCookie("username") && readCookie("password")) {
    var userCookie = readCookie("username");
    var passCookie = readCookie("password");

    var r = firebase.database().ref('accounts/' + userCookie);
    r.once('value', function(snapshot) {
      if (snapshot.val() && CryptoJS.AES.decrypt(snapshot.val().password, "bohemian rhapsody").toString(CryptoJS.enc.Utf8) === CryptoJS.AES.decrypt(passCookie, "bohemian rhapsody").toString(CryptoJS.enc.Utf8)) {
        account.loggedIn = true;
        account.username = userCookie;
        account.password = passCookie;
        account.losses = snapshot.val().losses;
        account.wins = snapshot.val().wins;
      }
      drawAll();
    });
  } else {
    drawAll();
  }
  //writeBoard(board);
}

function draw() {}

async function mouseClicked() {

  if (movement.oLocX || menu.incrUp || menu.incrDown) {
    return;
  }

  if (buttons.menu.isInBounds(mouseX, mouseY)) {
    buttons.menu.handler();

    drawAll();
  }

  if (!account.loggedIn) {
    var b = fonts.vera.textBounds("Register here", 0, 0, 12);
    var dhx = cnv.width / 2 - b.w / 2;
    var dhy = (cnv.height / 2 - b.h / 2) + (tileSize * 1.7);

    var b1 = fonts.vera.textBounds("Log in here", 0, 0, 12);
    var dhx1 = cnv.width / 2 - b.w / 2;
    var dhy1 = (cnv.height / 2 - b.h / 2) + (tileSize * 2);

    if (buttons.loginUsername.isInBounds(mouseX, mouseY) && !account.loggedIn && !register.registerNow) {
      firstHandler = buttons.loginUsername;
      buttons.loginUsername.handler();

      drawLogin();
    } else if (buttons.loginPassword.isInBounds(mouseX, mouseY) && !account.loggedIn && !register.registerNow) {
      firstHandler = buttons.loginPassword;

      drawLogin();
    } else if (buttons.loginButton.isInBounds(mouseX, mouseY) && !account.loggedIn && !register.registerNow) {
      buttons.loginButton.handler();
    } else if (buttons.staySignedIn.isInBounds(mouseX, mouseY) && !account.loggedIn && !register.registerNow) {
      buttons.staySignedIn.handler();

      drawLogin();
    } else if (buttons.toRegisterPage.isInBounds(mouseX, mouseY) && !account.loggedIn && !register.registerNow) {
      buttons.toRegisterPage.handler();

      drawLogin();
    } else if (buttons.toLoginPage.isInBounds(mouseX, mouseY) && !account.loggedIn && register.registerNow) {
      buttons.toLoginPage.handler();

      drawAll();
    } else if (buttons.registerUsername.isInBounds(mouseX, mouseY) && !account.loggedIn && register.registerNow) {
      buttons.registerUsername.handler();

      drawLogin();
    } else if (buttons.registerPassword.isInBounds(mouseX, mouseY) && !account.loggedIn && register.registerNow) {
      buttons.registerPassword.handler();

      drawLogin();
    } else if (buttons.registerPasswordConf.isInBounds(mouseX, mouseY) && !account.loggedIn && register.registerNow) {
      buttons.registerPasswordConf.handler();

      drawLogin();
    } else if (buttons.joinMatch.isInBounds(mouseX, mouseY) && menu.opened) {
      buttons.joinMatch.handler();

      drawAll();
    } else if (buttons.joinRandomMatch.isInBounds(mouseX, mouseY) && menu.opened) {
      buttons.joinRandomMatch.handler();

      drawAll();
    } else {
      firstHandler = null;

      drawAll();
    }

    if (buttons.registerButton.isInBounds(mouseX, mouseY) && !account.loggedIn && register.registerNow) {
      buttons.registerButton.handler();
    }

    return;
  } else {
    if (buttons.logoutButton.isInBounds(mouseX, mouseY)) {
      buttons.logoutButton.handler();

      drawAll();
    }
  }

  var pixelColor = {
    red: get(mouseX, mouseY)[0],
    green: get(mouseX, mouseY)[1],
    Blue: get(mouseX, mouseY)[2],
    color: color(get(mouseX, mouseY)[0], get(mouseX, mouseY)[1], get(mouseX, mouseY)[2])
  }

  var position = null;

  if (mouseX < finalSizeW || mouseX > finalSizeW + tileSize * 8) {
    return;
  }

  if (swPawn.sel) {
    if (compareColors(pixelColor.color, color(255, 255, 255)) && mouseY >= tileSize * 3) {
      board[swPawn.y][swPawn.x] = Pieces.White.Queen;

      swPawn.sel = false;
      delete swPawn.y;
      delete swPawn.x;

      drawAll();
      //writeBoard(board);
      return;
    } else if (compareColors(pixelColor.color, color(254, 254, 254)) && mouseY >= tileSize * 3) {
      board[swPawn.y][swPawn.x] = Pieces.White.Bishop;

      swPawn.sel = false;
      delete swPawn.y;
      delete swPawn.x;

      drawAll();
      //writeBoard(board);
      return;
    } else if (compareColors(pixelColor.color, color(253, 253, 253)) && mouseY >= tileSize * 3) {
      board[swPawn.y][swPawn.x] = Pieces.White.Knight;

      swPawn.sel = false;
      delete swPawn.y;
      delete swPawn.x;

      drawAll();
      //writeBoard(board);
      return;
    } else if (compareColors(pixelColor.color, color(252, 252, 252)) && mouseY >= tileSize * 3) {
      board[swPawn.y][swPawn.x] = Pieces.White.Rook;

      swPawn.sel = false;
      delete swPawn.y;
      delete swPawn.x;

      drawAll();
      //writeBoard(board);
      return;
    } else {
      return;
    }
  }

  external:
    for (var i = 0; i < board.length; i++) {
      for (var j = 0; j < board[i].length; j++) {

        let blueTileColor = color(119 - subtractColor[j][i], 136 - subtractColor[j][i], 153 - subtractColor[j][i]);
        let grayTileColor = color(105 - subtractColor[j][i], 105 - subtractColor[j][i], 105 - subtractColor[j][i]);
        let selectColor = color(240 - subtractColor[j][i], 230 - subtractColor[j][i], 140 - subtractColor[j][i]);
        let blackColor = color(20 + subtractColor[i][j], 20 + subtractColor[i][j], 20 + subtractColor[i][j]);
        let whiteColor = color(255 - subtractColor[i][j], 255 - subtractColor[i][j], 255 - subtractColor[i][j]);
        let killColor = color(255 - subtractColor[j][i], 38 - subtractColor[j][i], 49 - subtractColor[j][i]);
        let promotionColor = color(86 - subtractColor[j][i], 255 - subtractColor[j][i], 151 - subtractColor[j][i]);

        if ((compareColors(pixelColor.color, blueTileColor)) || (compareColors(pixelColor.color, grayTileColor))) {
          position = new Position(j, i);

          print("(" + position.y + ', ' + position.x + ")");

          break external;
        } else if (compareColors(pixelColor.color, color(255, 127, 80))) {
          selected = defaults.selected;

          drawAll();
          //writeBoard(board);
          return;
        } else if (compareColors(pixelColor.color, selectColor)) {
          position = new Position(j, i);
          print("(" + position.y + ', ' + position.x + ")");

          var startPos = whatPosition(2, selected);

          calcMov(startPos, position);

          selected = defaults.selected;

          for (var i = 0; i < jagged; i++) {

            drawAll();
            //writeBoard(board);

            await sleep(1);
          }

          board[position.y][position.x] = board[startPos.y][startPos.x];
          board[startPos.y][startPos.x] = 0;

          delete movement.oLocX;
          delete movement.oLocY;

          drawAll();
          //writeBoard(board);
          return;
        } else if (compareColors(pixelColor.color, blackColor)) {
          position = new Position(i, j);
          print("(" + position.y + ', ' + position.x + ")");

          if (selected[position.y][position.x] > 0) {

            var startPos = whatPosition(2, selected);

            calcMov(startPos, position);

            selected = defaults.selected;

            for (var i = 0; i < jagged; i++) {

              drawAll();
              //writeBoard(board);

              await sleep(1);
            }

            killedPieces.black.push(board[position.y][position.x]);

            board[position.y][position.x] = board[startPos.y][startPos.x];
            board[startPos.y][startPos.x] = 0;

            delete movement.oLocX;
            delete movement.oLocY;

            drawAll();
            //writeBoard(board);

            return;
          } else {
            selected = defaults.selected;
            drawAll();
            //writeBoard(board);
            return;
          }
        } else if (compareColors(pixelColor.color, whiteColor)) {
          if (selected[i][j] === 2) {
            selected = defaults.selected;
            drawAll();
            //writeBoard(board);
            return;
          } else {
            position = new Position(i, j);

            print("(" + position.y + ', ' + position.x + ")");

            break external;
          }
        } else if (compareColors(pixelColor.color, killColor)) {
          position = new Position(j, i);

          var startPos = whatPosition(2, selected);

          calcMov(startPos, position);

          selected = defaults.selected;

          killedPieces.black.push(board[position.y][position.x]);

          for (var i = 0; i < jagged; i++) {

            drawAll();
            //writeBoard(board);

            await sleep(1);
          }

          board[position.y][position.x] = board[startPos.y][startPos.x];
          board[startPos.y][startPos.x] = 0;

          delete movement.oLocX;
          delete movement.oLocY;

          drawAll();
          //writeBoard(board);
          //writeBoard(board);
          return;
        } else if (compareColors(pixelColor.color, promotionColor)) {
          position = new Position(j, i);

          var startPos = whatPosition(2, selected);

          calcMov(startPos, position);

          selected = defaults.selected;

          killedPieces.black.push(board[position.y][position.x]);

          for (var i = 0; i < jagged; i++) {

            drawAll();
            //writeBoard(board);

            await sleep(1);
          }

          board[position.y][position.x] = board[startPos.y][startPos.x];
          board[startPos.y][startPos.x] = 0;

          delete movement.oLocX;
          delete movement.oLocY;

          drawAll();
          //writeBoard(board);

          return;
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
  //writeBoard(board);
}

$(document).keypress(function(e) {
  if (!firstHandler) {
    return;
  }

  var character = String.fromCharCode(e.which);

  if (e.which === 13) {
    return;
  }

  // if (isNaN(character) && firstHandler === buttons.joinMatch) {
  //   return;
  // }

  if (acceptableSize(buttons.loginUsername, 14) || acceptableSize(buttons.loginPassword, 14) || acceptableSize(buttons.registerUsername, 14) || acceptableSize(buttons.registerPassword, 14) || acceptableSize(buttons.registerPasswordConf, 14) || (acceptableSize(buttons.joinMatch, 12) && event.which != 8 && isNaN(String.fromCharCode(event.which)))) {
    return;
  }

  if (character === " ") {
    character = "_";
  }

  firstHandler.text += character;

  drawAll();
});

$(document).keydown(function(e) {
  if (!firstHandler) {
    return;
  }

  if (e.which === 8) {
    firstHandler.text = firstHandler.text.substr(0, firstHandler.text.length - 1);
  }

  drawAll();
});

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

      if (selected[j][i] === 3) {
        fill(86 - subtractColor[j][i], 255 - subtractColor[j][i], 151 - subtractColor[j][i]);
      } else if (selected[j][i] === 2) {
        fill(255, 127, 80);
      } else if (selected[j][i] === 1) {
        if (board[j][i] > 10) {
          fill(255 - subtractColor[j][i], 38 - subtractColor[j][i], 49 - subtractColor[j][i]);
        } else {
          fill(240 - subtractColor[j][i], 230 - subtractColor[j][i], 140 - subtractColor[j][i]);
        }
      }

      if (board[j][i] === 1 && j === 0) {
        swPawn.sel = true;
        swPawn.y = j;
        swPawn.x = i;
      }

      rect(finalSizeW + tileSize * i, j * tileSize, tileSize, tileSize);
      isWhiteT = !isWhiteT;
    }

    isWhiteT = !isWhiteT;
  }

  if (!account.loggedIn) {
    fill(100, 100, 100, 100);
    rect(finalSizeW, 0, tileSize * 8, cnv.height);
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

function drawKilled() {
  var size = cnv.height / 12;
  for (var i = 0; i < killedPieces.white.length; i++) {

    var equX = size * (i % 2) + tileSize;
    var equY = size * (i / 2);

    tint(255 - i, 255 - i, 255 - i);

    switch (killedPieces.white[i]) {
      case 1:
        image(images.pawn, equX, equY, size, size);
        break;
      case 2:
        image(images.rook, equX, equY, size, size);
        break;
      case 3:
        image(images.knight, equX, equY, size, size);
        break;
      case 4:
        image(images.bishop, equX, equY, size, size);
        break;
      case 5:
        image(images.queen, equX, equY, size, size);
        break;
      case 6:
        image(images.king, equX, equY, size, size);
        break;
    }
  }

  for (var i = 0; i < killedPieces.black.length; i++) {

    var equX = finalSizeW + tileSize * 8 + size * (i % 2);
    var equY = size * (i / 2);

    tint(20 + i, 20 + i, 20 + i);

    switch (killedPieces.black[i]) {
      case 11:
        image(images.pawn, equX, equY, size, size);
        break;
      case 12:
        image(images.rook, equX, equY, size, size);
        break;
      case 13:
        image(images.knight, equX, equY, size, size);
        break;
      case 14:
        image(images.bishop, equX, equY, size, size);
        break;
      case 15:
        image(images.queen, equX, equY, size, size);
        break;
      case 16:
        image(images.king, equX, equY, size, size);
        break;
    }
  }

  if (swPawn.sel) {
    fill(86, 255, 151);
    rect(finalSizeW + tileSize / 2, tileSize * 3, tileSize * 7, tileSize * 2);

    tint(255, 255, 255);
    image(images.queen, finalSizeW + tileSize / 2, tileSize * 3, (tileSize * 7) / 4, tileSize * 2);

    tint(254, 254, 254);
    image(images.bishop, finalSizeW + tileSize / 2 + ((tileSize * 7) / 4), tileSize * 3, (tileSize * 7) / 4, tileSize * 2);

    tint(253, 253, 253);
    image(images.knight, finalSizeW + tileSize / 2 + (((tileSize * 7) / 4) * 2), tileSize * 3, (tileSize * 7) / 4, tileSize * 2);

    tint(252, 252, 252);
    image(images.rook, finalSizeW + tileSize / 2 + (((tileSize * 7) / 4) * 3), tileSize * 3, (tileSize * 7) / 4, tileSize * 2);

  }
}

function drawLogin() {
  if (!account.loggedIn && !register.registerNow) {
    fill('#343547');
    rect(finalSizeW + (2 * tileSize) + tileSize / 2, tileSize * 2, tileSize * 3, tileSize * 4);

    textFont(fonts.toThePoint);

    fill('white');
    textSize(30);
    text("Username", finalSizeW + (2 * tileSize) + tileSize * (3 / 4) + 1, (tileSize * 2.5 + tileSize / 4) - 5);

    buttons.loginUsername.draw();

    fill('white');
    textSize(30);
    textFont(fonts.toThePoint);
    text("Password", finalSizeW + (2 * tileSize) + tileSize * (3 / 4) + 1, (tileSize * 2.5 + tileSize / 4) + 65);

    buttons.loginPassword.passwordText = true;
    buttons.loginPassword.draw();

    buttons.loginButton.textColor = color('white');
    buttons.loginButton.buttonColor = color('#925BB5');
    buttons.loginButton.draw();

    var b = fonts.vera.textBounds("Don't have an account?", 0, 0, 12);
    var dhx = cnv.width / 2 - b.w / 2;
    var dhy = cnv.height / 2 - b.h / 2;

    textFont(fonts.vera);
    fill('#888888');
    textSize(12);
    text("Don't have an account?", dhx, dhy + (tileSize * 1.45));

    buttons.toRegisterPage.textColor = color('#0479FB');
    buttons.toRegisterPage.draw();

    buttons.staySignedIn.draw();

    fill('gray');
    text("Stay signed in", finalSizeW + (2.2 * tileSize) + tileSize * (3 / 4) + (tileSize / 5), tileSize * 3.9 + tileSize / 4 + tileSize / 8);

  } else if (register.registerNow && !account.loggedIn) {
    fill('#343547');
    rect(finalSizeW + (2 * tileSize) + tileSize / 2, tileSize * 1.5, tileSize * 3, tileSize * 5);

    textFont(fonts.toThePoint);

    fill('white');
    textSize(30);
    text("Username", finalSizeW + (2 * tileSize) + tileSize * (3 / 4) + 1, (tileSize * 2 + tileSize / 4) - 5);

    buttons.registerUsername.draw();

    fill('white');
    textSize(30);
    textFont(fonts.toThePoint);
    text("Password", finalSizeW + (2 * tileSize) + tileSize * (3 / 4) + 1, (tileSize * 2 + tileSize / 4) + 65);

    buttons.registerPassword.passwordText = true;
    buttons.registerPassword.draw();

    fill('white');
    textSize(30);
    textFont(fonts.toThePoint);
    text("Confirm Password", finalSizeW + (2 * tileSize) + tileSize * (3 / 4) + 1, (tileSize * 2 + tileSize / 4) + 135);

    buttons.registerPasswordConf.passwordText = true;
    buttons.registerPasswordConf.draw();

    buttons.registerButton.buttonColor = color('#925BB5');
    buttons.registerButton.textColor = color('white');
    buttons.registerButton.draw();

    fill('#888888');
    textFont(fonts.vera);
    textSize(12);

    var b = fonts.vera.textBounds("Already have an account?", 0, 0, 12);
    var dhx = cnv.width / 2 - b.w / 2;
    var dhy = cnv.height / 2 - b.h / 2;

    text("Already have an account?", dhx, dhy + (tileSize * 1.75));

    buttons.toLoginPage.textColor = color('#0479FB');
    buttons.toLoginPage.draw();
  }
}

function drawMenu() {
  if (menu.opened) {
    image(images.x, 10, 10, tileSize / 2, tileSize / 2);
  } else {
    image(images.hamburgerBar, 10, 10, tileSize / 2, tileSize / 2);
  }

  if (menu.incrUp) {
    fill('rgba(106,117,194, 0.9)');
    rect(0, 0, menu.incrUp, cnv.height);
    image(images.x, 10, 10, tileSize / 2, tileSize / 2);
  } else if (menu.incrDown) {
    fill('rgba(106,117,194, 0.9)');
    rect(0, 0, menu.incrDown, cnv.height);
    image(images.hamburgerBar, 10, 10, tileSize / 2, tileSize / 2);
  } else {
    if (menu.opened && menu.incrUp !== 0) {
      fill('rgba(106,117,194, 0.9)');
      rect(0, 0, finalSizeW + 10 + tileSize / 2, cnv.height);
      image(images.x, 10, 10, tileSize / 2, tileSize / 2);
    }
  }

  if (menu.opened && !menu.incrUp && !menu.incrDown && menu.incrUp !== 0 && !menu.incrDown !== 0) {
    drawMenuPage();
  }
}

function drawMenuPage() {
  textFont(fonts.toThePoint);
  textSize(30);
  fill('white');
  text("Join Match:", ((finalSizeW + 10 + tileSize / 2) - tileSize * 1.975) / 2, tileSize * 1.18);

  buttons.joinMatch.draw();

  buttons.joinRandomMatch.textColor = color('white');
  buttons.joinRandomMatch.buttonColor = color('#333646');
  buttons.joinRandomMatch.draw();

  buttons.undoMove.textColor = color('white');
  buttons.undoMove.buttonColor = color('#333646');
  buttons.undoMove.draw();

  textFont(fonts.toThePoint);
  textSize(50);
  text("Account: " + account.username, ((finalSizeW + 10 + tileSize / 2) - (fonts.toThePoint.textBounds("Account: " + account.username, 0, 0, 50).w)) / 2, tileSize * 3.4);

  var string = "";
  while (fonts.toThePoint.textBounds(string, 0, 0, 50).w < fonts.toThePoint.textBounds("Account: " + account.username, 0, 0, 50).w) {
    string += "=";
  }

  text(string, ((finalSizeW + 10 + tileSize / 2) - (fonts.toThePoint.textBounds(string, 0, 0, 50).w)) / 2, tileSize * 3.7);

  textSize(25);
  textFont(fonts.adlanta);
  text("Wins: " + account.wins, ((finalSizeW + 10 + tileSize / 2) - (fonts.adlanta.textBounds("Wins: " + account.wins, 0, 0, 25).w)) / 2, tileSize * 4);
  text("Losses: " + account.losses, ((finalSizeW + 10 + tileSize / 2) - (fonts.adlanta.textBounds("Losses: " + account.losses, 0, 0, 25).w)) / 2, tileSize * 4.3);

  buttons.changeUsername.buttonColor = color('#333646');
  buttons.changeUsername.textColor = color('white');
  buttons.changeUsername.draw();

  buttons.changePassword.buttonColor = color('#333646');
  buttons.changePassword.textColor = color('white');
  buttons.changePassword.draw();

  buttons.settings.buttonColor = color('#333646');
  buttons.settings.textColor = color('white');
  buttons.settings.draw();

  buttons.logoutButton.buttonColor = color('#925BB5');
  buttons.logoutButton.textColor = color('white');
  buttons.logoutButton.draw();

  buttons.contactUs.fontSize = 13.5;
  buttons.contactUs.textColor = color('#FFA75D');
  buttons.contactUs.draw();

  buttons.reportBug.fontSize = 13.5;
  buttons.reportBug.textColor = color('#FFA75D');
  buttons.reportBug.draw();
}

async function setButtons() {
  var menuSize = finalSizeW + 10 + tileSize / 2;

  buttons.menu = new ImageButton(images.hamburgerBar, 10, 10, tileSize / 2, tileSize / 2, async function() {
    menu.opened = !menu.opened
    if (menu.opened) {
      for (var i = 0; i < 3 * (finalSizeW + 10 + tileSize / 2); i += 90) {
        if (i + 90 >= 2 * (finalSizeW + 10 + tileSize / 2)) {
          menu.incrUp = finalSizeW + 10 + tileSize / 2;
        } else {
          menu.incrUp = i / 3;
        }
        drawAll();

        await sleep(1);
      }

      delete menu.incrUp;
      drawAll();
      return;
    } else {
      for (var i = 3 * (finalSizeW + 10 + tileSize / 2); i > 0; i -= 90) {

        if (i - 90 <= 0) {
          menu.incrDown = 0;
        } else {
          menu.incrDown = i / 3;
        }

        drawAll();

        await sleep(1);
      }

      delete menu.incrDown;
      drawAll();
      return;
    }
  });

  buttons.loginUsername = new TextField(finalSizeW + (2 * tileSize) + tileSize * (3 / 4), tileSize * 2.5 + tileSize / 4, tileSize * 2.5, 4 * (tileSize / 10));
  buttons.loginPassword = new TextField(finalSizeW + (2 * tileSize) + tileSize * (3 / 4), (tileSize * 2.5 + tileSize / 4) + 70, tileSize * 2.5, 4 * (tileSize / 10));

  buttons.staySignedIn = new CheckBox(finalSizeW + (2.2 * tileSize) + tileSize * (3 / 4), tileSize * 3.9 + tileSize / 4);
  buttons.loginButton = new TextButton("Log In", finalSizeW + (3.5 * tileSize), (tileSize * 2.5 + tileSize / 2.5) + (tileSize * 1.6), tileSize * 0.8, 4 * (tileSize / 10), function() {
    if (!buttons.loginUsername.text || !buttons.loginPassword.text) {
      return;
    }

    var r = firebase.database().ref('accounts/' + buttons.loginUsername.text);
    r.once('value', function(snapshot) {
      if (snapshot.val() && CryptoJS.AES.decrypt(snapshot.val().password, "bohemian rhapsody").toString(CryptoJS.enc.Utf8) === buttons.loginPassword.text) {
        account.loggedIn = true;
        account.username = buttons.loginUsername.text;
        account.password = CryptoJS.AES.encrypt(buttons.loginPassword.text, "bohemian rhapsody");
        account.wins = snapshot.val().wins;
        account.losses = snapshot.val().losses;
        drawAll();

        if (buttons.staySignedIn.checked) {
          createCookie("username", account.username, 14);
          createCookie("password", account.password, 14);
        }
      } else {
        textSize(12);
        fill('red');
        var b = fonts.vera.textBounds("Invalid username or password", 0, 0, 12);
        var dhx = cnv.width / 2 - b.w / 2;
        var dhy = cnv.height / 2 - b.h / 2 + (tileSize * 1.2);

        text("Invalid username or password", dhx, dhy);
      }

      buttons.loginUsername.text = "";
      buttons.loginPassword.text = "";
    });
  });

  buttons.toRegisterPage = new LabelButton("Register Here", cnv.width / 2 - fonts.vera.textBounds("Register here", 0, 0, 12).w / 2, cnv.height / 2 - fonts.vera.textBounds("Register here", 0, 0, 12).h / 2 + (tileSize * 1.7), function() {
    register.registerNow = true;

    buttons.loginUsername.text = "";
    buttons.loginPassword.text = "";
  });

  buttons.registerUsername = new TextField(finalSizeW + (2 * tileSize) + tileSize * (3 / 4), tileSize * 2 + tileSize / 4, tileSize * 2.5, 4 * (tileSize / 10));
  buttons.registerPassword = new TextField(finalSizeW + (2 * tileSize) + tileSize * (3 / 4), (tileSize * 2 + tileSize / 4) + 70, tileSize * 2.5, 4 * (tileSize / 10));
  buttons.registerPasswordConf = new TextField(finalSizeW + (2 * tileSize) + tileSize * (3 / 4), (tileSize * 2 + tileSize / 4) + 140, tileSize * 2.5, 4 * (tileSize / 10));

  buttons.registerButton = new TextButton("Register", finalSizeW + (3.45 * tileSize), (tileSize * 2.5 + tileSize / 4) + 150, tileSize * 1.105, 5 * (tileSize / 10), function() {
    var alreadyFound = false;

    var accs = [];
    var r = firebase.database().ref('accounts');

    r.once('value', function(snapshot) {
      for (snap in snapshot.val()) {
        if (snap === buttons.registerUsername.text) {
          alreadyFound = true;
        }
      }

      if (!(buttons.registerUsername.text.includes('.') && buttons.registerUsername.text.includes('$') && buttons.registerUsername.text.includes('[') && buttons.registerUsername.text.includes(']') && buttons.registerUsername.text.includes('#')) && buttons.registerUsername.text && buttons.registerPassword.text === buttons.registerPasswordConf.text && buttons.registerPassword.text.length > 6 && !alreadyFound) {

        var encrypted = CryptoJS.AES.encrypt(buttons.registerPassword.text, "bohemian rhapsody").toString();

        firebase.database().ref("accounts/" + buttons.registerUsername.text).set({
          name: buttons.registerUsername.text,
          password: encrypted,
          wins: 0,
          losses: 0
        });

        firstHandler = null;

        buttons.registerUsername.text = "";
        buttons.registerPasswordConf.text = "";
        buttons.registerPassword.text = "";

        register.registerNow = false;
        drawAll();
      } else {
        if (buttons.registerUsername.text.includes('.') || buttons.registerUsername.text.includes('$') || buttons.registerUsername.text.includes('[') || buttons.registerUsername.text.includes(']') || buttons.registerUsername.text.includes('#')) {
          textFont(fonts.adlanta);
          textSize(11);

          buttons.registerUsername.text = "";

          drawAll();
          fill('red');
          text("Username may not contain '.' '$' '[' ']' or '#'", finalSizeW + (2 * tileSize) + tileSize * (3 / 4), (tileSize * 2 + tileSize / 4) + 45);
        } else if (buttons.registerPassword.text !== buttons.registerPasswordConf.text) {
          textFont(fonts.adlanta);
          textSize(11);

          buttons.registerPasswordConf.text = "";
          buttons.registerPassword.text = "";

          drawAll();
          fill('red');
          text("Passwords must match", finalSizeW + (2 * tileSize) + tileSize * (3 / 4), (tileSize * 2 + tileSize / 4) + 115);
        } else if (buttons.registerPassword.text.length <= 6) {
          textFont(fonts.adlanta);
          textSize(11);

          buttons.registerPasswordConf.text = "";
          buttons.registerPassword.text = "";

          drawAll();
          fill('red');
          text("Password must be > than 6 chars", finalSizeW + (2 * tileSize) + tileSize * (3 / 4), (tileSize * 2 + tileSize / 4) + tileSize);
        } else if (alreadyFound) {
          textFont(fonts.adlanta);
          textSize(11);

          buttons.registerUsername.text = "";
          buttons.registerPasswordConf.text = "";
          buttons.registerPassword.text = "";

          drawAll();
          fill('red');
          text("Username taken", finalSizeW + (2 * tileSize) + tileSize * (3 / 4), (tileSize * 2 + tileSize / 4) + 45);
        } else if (!buttons.registerUsername.text) {
          textFont(fonts.adlanta);
          textSize(11);
          buttons.registerUsername.text = "";
          buttons.registerPasswordConf.text = "";
          buttons.registerPassword.text = "";
          drawAll();
          fill('red');
          text("Username cannot be empty", finalSizeW + (2 * tileSize) + tileSize * (3 / 4), (tileSize * 2 + tileSize / 4) + 45);
        } else {
          textFont(fonts.adlanta);
          textSize(11);

          buttons.registerPasswordConf.text = "";
          buttons.registerPassword.text = "";

          drawAll();
          fill('red');
          text("An unknown error occured", finalSizeW + (2 * tileSize) + tileSize * (3 / 4), (tileSize * 2 + tileSize / 4) + 115);
        }
      }
    });
  });

  buttons.toLoginPage = new LabelButton("Log in here", cnv.width / 2 - fonts.vera.textBounds("Log in here", 0, 0, 12).w / 2, (cnv.height / 2 - fonts.vera.textBounds("Log in here", 0, 0, 12).h / 2) + (tileSize * 2), function() {
    register.registerNow = false;

    buttons.registerUsername.text = "";
    buttons.registerPassword.text = "";
    buttons.registerPasswordConf.text = "";
    firstHandler = null;
  });

  buttons.joinMatch = new TextField((menuSize - tileSize * 1.975) / 2, tileSize * 1.2, tileSize * 1.975, 4 * (tileSize / 10));
  buttons.joinRandomMatch = new TextButton("Join Random Match", (menuSize - (fonts.vegur.textBounds("Join Random Match", 0, 0, 25).w + tileSize / 4)) / 2, tileSize * 1.8, fonts.vegur.textBounds("Join Random Match", 0, 0, 25).w + tileSize / 4, 4 * (tileSize / 10), function() {
    print("JOIN!");
  });
  buttons.undoMove = new TextButton("Request Undo Move", (menuSize - (fonts.vegur.textBounds("Request Undo Move", 0, 0, 25).w + tileSize / 4)) / 2, tileSize * 2.4, fonts.vegur.textBounds("Request Undo Move", 0, 0, 25).w + tileSize / 4, 4 * (tileSize / 10), function() {
    print("Coming Soon To Theaters!");

    drawAll();
  });
  buttons.changeUsername = new TextButton("Change Username", (menuSize - (fonts.vegur.textBounds("Change Username", 0, 0, 25).w + tileSize / 4)) / 2, tileSize * 4.6, fonts.vegur.textBounds("Change Username", 0, 0, 25).w + tileSize / 4, 4 * (tileSize / 10), function() {
    print("Almost there");
  });
  buttons.changePassword = new TextButton("Change Password", (menuSize - (fonts.vegur.textBounds("Change Password", 0, 0, 25).w + tileSize / 4)) / 2, tileSize * 5.2, fonts.vegur.textBounds("Change Password", 0, 0, 25).w + tileSize / 4, 4 * (tileSize / 10), function() {
    print("Almost there");
  });
  buttons.settings = new TextButton("Settings", (menuSize - (fonts.vegur.textBounds("Settings", 0, 0, 25).w + tileSize / 4)) / 2, tileSize * 5.8, fonts.vegur.textBounds("Settings", 0, 0, 25).w + tileSize / 4, 4 * (tileSize / 10), function() {
    print("Almost there");
  });

  buttons.logoutButton = new TextButton("Log Out", (menuSize - (fonts.vegur.textBounds("Log Out", 0, 0, 25).w + tileSize / 4)) / 2, tileSize * 6.9, fonts.vegur.textBounds("Log Out", 0, 0, 25).w + tileSize / 4, 4 * (tileSize / 10), function() {
    account.loggedIn = false;
    account.username = "-";
    account.password = "";
    account.losses = "-";
    account.wins = "-";
    account.savePass = false;
    eraseCookie("username");
    eraseCookie("password");
  });

  buttons.contactUs = new LabelButton("Contact Us", menuSize / 4, tileSize * 7.65, function() {
    print("Available soon!");
  });
  buttons.reportBug = new LabelButton("Report Bug", 2 * (menuSize / 4), tileSize * 7.65, function() {
    print("Available soon!");
  });
}

function drawAll() {
  fill('#C7D3FF');
  rect(0, 0, cnv.width, cnv.height);

  drawBoard(selected);
  drawPieces();
  drawKilled();
  drawLogin();
  drawMenu();
}
