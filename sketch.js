// Copyright Jack Hedaya (c) 2017 Copyright Holder All Rights Reserved.

var account = {
  loggedIn: false,
  savePass: false,

  selectedText: "",

  tempUser: "",
  tempPass: "",

  username: "",
  password: ""
}

var register = {
  registerNow: false,

  selectedText: "",

  tempUser: "",
  tempPass: "",
  tempPassConf: ""
}

var bannedWords;

var mouseX;
var mouseY;

var finalSizeW;
var finalSizeH;

var images = {};

var tileSize;

var jagged = 15;

var cnv;

var id;

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

var board;

var selected;

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

function preload() {
  selected = defaults.selected;
  board = defaults.board;

  images.pawn = loadImage("assets/pieces/Pawn.png");
  images.rook = loadImage("assets/pieces/Rook.png");
  images.bishop = loadImage("assets/pieces/Bishop.png");
  images.knight = loadImage("assets/pieces/Knight.png");
  images.king = loadImage("assets/pieces/King.png");
  images.queen = loadImage("assets/pieces/Queen.png");

  images.check = loadImage("assets/icons/Check.png");

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

  var i = generateInstanceID();
  id = i;
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

  if (readCookie("username") && readCookie("password")) {
    var userCookie = readCookie("username");
    var passCookie = readCookie("password");

    var r = firebase.database().ref('accounts/' + userCookie);
    r.once('value', function(snapshot) {
      if (snapshot.val() && CryptoJS.AES.decrypt(snapshot.val().password, "bohemian rhapsody").toString(CryptoJS.enc.Utf8) === CryptoJS.AES.decrypt(passCookie, "bohemian rhapsody").toString(CryptoJS.enc.Utf8)) {
        account.loggedIn = true;
        account.username = userCookie;
        account.password = passCookie;
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

  if (movement.oLocX) {
    return;
  }

  if (mouseX < finalSizeW || mouseX > finalSizeW + tileSize * 8) {
    return;
  }

  if (!account.loggedIn) {
    var b = fonts.vera.textBounds("Register here", 0, 0, 12);
    var dhx = cnv.width / 2 - b.w / 2;
    var dhy = (cnv.height / 2 - b.h / 2) + (tileSize * 1.7);

    var b1 = fonts.vera.textBounds("Log in here", 0, 0, 12);
    var dhx1 = cnv.width / 2 - b.w / 2;
    var dhy1 = (cnv.height / 2 - b.h / 2) + (tileSize * 2);

    if (mouseX > finalSizeW + (2 * tileSize) + tileSize * (3 / 4) && mouseX < (finalSizeW + (2 * tileSize) + tileSize * (3 / 4)) + (tileSize * 2.5) && mouseY > tileSize * 2.5 + tileSize / 4 && mouseY < (tileSize * 2.5 + tileSize / 4) + (tileSize * 2.5, 4 * (tileSize / 10)) && !account.loggedIn && !register.registerNow) {
      account.selectedText = "loginU";
      drawLogin();
    } else if (mouseX > finalSizeW + (2 * tileSize) + tileSize * (3 / 4) && mouseX < (finalSizeW + (2 * tileSize) + tileSize * (3 / 4)) + (tileSize * 2.5) && mouseY > (tileSize * 2.5 + tileSize / 4) + 70 && mouseY < ((tileSize * 2.5 + tileSize / 4) + 70) + (4 * (tileSize / 10)) && !account.loggedIn && !register.registerNow) {
      account.selectedText = "loginP";
      drawLogin();
    } else if (mouseX > finalSizeW + (3.5 * tileSize) && mouseX < (finalSizeW + (3.5 * tileSize)) + tileSize * 0.8 && mouseY > (tileSize * 2.5 + tileSize / 2.5) + (tileSize * 1.6) && mouseY < ((tileSize * 2.5 + tileSize / 2.5) + (tileSize * 1.6)) + 4 * (tileSize / 10) && !account.loggedIn && !register.registerNow) {
      if (!account.tempUser || !account.tempPass) {
        return;
      }

      var r = firebase.database().ref('accounts/' + account.tempUser);
      r.once('value', function(snapshot) {
        if (snapshot.val() && CryptoJS.AES.decrypt(snapshot.val().password, "bohemian rhapsody").toString(CryptoJS.enc.Utf8) === account.tempPass) {
          account.loggedIn = true;
          account.username = account.tempUser;
          account.password = CryptoJS.AES.encrypt(account.tempPass, "bohemian rhapsody");
          drawAll();

          if (account.savePass) {
            print(createCookie("username", account.username, 14));
            print(createCookie("password", account.password, 14));
          }
        } else {
          textSize(12);
          fill('red');
          var b = fonts.vera.textBounds("Invalid username or password", 0, 0, 12);
          var dhx = cnv.width / 2 - b.w / 2;
          var dhy = cnv.height / 2 - b.h / 2 + (tileSize * 1.2);

          text("Invalid username or password", dhx, dhy);
        }
      });
    } else if (mouseX > finalSizeW + (2.2 * tileSize) + tileSize * (3 / 4) && mouseY > tileSize * 3.9 + tileSize / 4 && mouseX < (finalSizeW + (2.2 * tileSize) + tileSize * (3 / 4)) + tileSize / 7 && mouseY < (tileSize * 3.9 + tileSize / 4) + tileSize / 7 && !account.loggedIn && !register.registerNow) {
      if (!account.savePass) {
        account.savePass = true;
      } else {
        account.savePass = false;
      }
      drawLogin();
    } else if (mouseX > dhx && mouseX < dhx + b.w && mouseY > dhy - b.h && mouseY < dhy && !account.loggedIn && !register.registerNow) {
      register.registerNow = true;

      register.selectedText = "";
      account.selectedText = "";

      drawAll();
    } else if (mouseX > dhx1 && mouseX < dhx1 + b.w && mouseY > dhy1 - b.h && mouseY < dhy1 && !account.loggedIn && register.registerNow) {
      register.registerNow = false;

      register.selectedText = "";

      account.selectedText = "";

      drawAll();
    } else if (mouseX > finalSizeW + (2 * tileSize) + tileSize * (3 / 4) && mouseX < (finalSizeW + (2 * tileSize) + tileSize * (3 / 4)) + (tileSize * 2.5) && mouseY > tileSize * 2 + tileSize / 4 && mouseY < (tileSize * 2 + tileSize / 4) + (4 * (tileSize / 10)) && !account.loggedIn && register.registerNow) {
      register.selectedText = "regU";
      drawLogin();
    } else if (mouseX > finalSizeW + (2 * tileSize) + tileSize * (3 / 4) && mouseX < (finalSizeW + (2 * tileSize) + tileSize * (3 / 4)) + (tileSize * 2.5) && mouseY > (tileSize * 2 + tileSize / 4) + 70 && mouseY < ((tileSize * 2 + tileSize / 4) + 70) + (4 * (tileSize / 10)) && !account.loggedIn && register.registerNow) {
      register.selectedText = "regP";
      drawLogin();
    } else if (mouseX > finalSizeW + (2 * tileSize) + tileSize * (3 / 4) && mouseX < (finalSizeW + (2 * tileSize) + tileSize * (3 / 4)) + (tileSize * 2.5) && mouseY > (tileSize * 2 + tileSize / 4) + 140 && mouseY < ((tileSize * 2 + tileSize / 4) + 140) + (4 * (tileSize / 10))) {
      register.selectedText = "regPConf";
      drawLogin();
    } else {
      if (register.registerNow) {
        register.selectedText = "";
      } else if (!register.registerNow && !account.loggedIn) {
        account.selectedText = "";
      }

      drawLogin();
    }

    if (mouseX > finalSizeW + (3.45 * tileSize) && mouseX < (finalSizeW + (3.45 * tileSize)) + (tileSize * 1.105) && mouseY > (tileSize * 2.5 + tileSize / 4) + 150 && mouseY < ((tileSize * 2.5 + tileSize / 4) + 150) + (5 * (tileSize / 10)) && !account.loggedIn && register.registerNow) {

      register.coolDown = true;
      var alreadyFound = false;

      var accs = [];
      var r = firebase.database().ref('accounts');
      r.once('value', function(snapshot) {
        for (snap in snapshot.val()) {
          if (snap === register.tempUser) {
            alreadyFound = true;
          }
        }

        if (!(register.tempUser.includes('.') && register.tempUser.includes('$') && register.tempUser.includes('[') && register.tempUser.includes(']') && register.tempUser.includes('#')) && register.tempUser && register.tempPass === register.tempPassConf && register.tempPass.length > 6 && !alreadyFound) {

          var encrypted = CryptoJS.AES.encrypt(register.tempPass, "bohemian rhapsody").toString();

          firebase.database().ref("accounts/" + register.tempUser).set({
            id,
            name: register.tempUser,
            password: encrypted
          });

          register.selectedText = "";

          register.tempUser = "";
          register.tempPassConf = "";
          register.tempPass = "";

          register.registerNow = false;
          drawAll();
        } else {
          if (register.tempUser.includes('.') || register.tempUser.includes('$') || register.tempUser.includes('[') || register.tempUser.includes(']') || register.tempUser.includes('#')) {
            textFont(fonts.adlanta);
            textSize(11);
            register.tempUser = "";
            drawAll();
            fill('red');
            text("Username may not contain '.' '$' '[' ']' or '#'", finalSizeW + (2 * tileSize) + tileSize * (3 / 4), (tileSize * 2 + tileSize / 4) + 45);
          } else if (register.tempPass !== register.tempPassConf) {
            textFont(fonts.adlanta);
            textSize(11);
            register.tempPassConf = "";
            register.tempPass = "";
            drawAll();
            fill('red');
            text("Passwords must match", finalSizeW + (2 * tileSize) + tileSize * (3 / 4), (tileSize * 2 + tileSize / 4) + 115);
          } else if (register.tempPass.length <= 6) {
            textFont(fonts.adlanta);
            textSize(11);
            register.tempPassConf = "";
            register.tempPass = "";
            drawAll();
            fill('red');
            text("Password must be > than 6 chars", finalSizeW + (2 * tileSize) + tileSize * (3 / 4), (tileSize * 2 + tileSize / 4) + 115);
          } else if (alreadyFound) {
            textFont(fonts.adlanta);
            textSize(11);
            register.tempUser = "";
            register.tempPass = "";
            register.tempPassConf = "";
            drawAll();
            fill('red');
            text("Username taken", finalSizeW + (2 * tileSize) + tileSize * (3 / 4), (tileSize * 2 + tileSize / 4) + 45);
          } else if (!register.tempUser) {
            textFont(fonts.adlanta);
            textSize(11);
            register.tempUser = "";
            register.tempPass = "";
            register.tempPassConf = "";
            drawAll();
            fill('red');
            text("Username cannot be empty", finalSizeW + (2 * tileSize) + tileSize * (3 / 4), (tileSize * 2 + tileSize / 4) + 45);
          } else {
            textFont(fonts.adlanta);
            textSize(11);
            register.tempPassConf = "";
            register.tempPass = "";
            drawAll();
            fill('red');
            text("An unknown error occured", finalSizeW + (2 * tileSize) + tileSize * (3 / 4), (tileSize * 2 + tileSize / 4) + 115);
          }
        }
      });
    }
    return;
  }

  var pixelColor = {
    red: get(mouseX, mouseY)[0],
    green: get(mouseX, mouseY)[1],
    Blue: get(mouseX, mouseY)[2],
    color: color(get(mouseX, mouseY)[0], get(mouseX, mouseY)[1], get(mouseX, mouseY)[2])
  }

  var position = null;

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

    var equX = size * (i % 2);
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
}

function drawLogin() {
  if (!account.loggedIn && !register.registerNow) {
    fill('#343547');
    rect(finalSizeW + (2 * tileSize) + tileSize / 2, tileSize * 2, tileSize * 3, tileSize * 4);

    textFont(fonts.toThePoint);

    fill('white');
    textSize(30);
    text("Username", finalSizeW + (2 * tileSize) + tileSize * (3 / 4) + 1, (tileSize * 2.5 + tileSize / 4) - 5);

    if (account.selectedText === "loginU") {
      fill('#888888');
    }

    rect(finalSizeW + (2 * tileSize) + tileSize * (3 / 4), tileSize * 2.5 + tileSize / 4, tileSize * 2.5, 4 * (tileSize / 10));

    fill('black');
    textSize(20);
    textFont(fonts.vera);
    text(account.tempUser, finalSizeW + (2 * tileSize) + tileSize * (3 / 4) + 4, (tileSize * 2.5 + tileSize / 4) + (4 * (tileSize / 10)) - 8);

    fill('white');
    textSize(30);
    textFont(fonts.toThePoint);
    text("Password", finalSizeW + (2 * tileSize) + tileSize * (3 / 4) + 1, (tileSize * 2.5 + tileSize / 4) + 65);

    if (account.selectedText === "loginP") {
      fill('#888888');
    }

    rect(finalSizeW + (2 * tileSize) + tileSize * (3 / 4), (tileSize * 2.5 + tileSize / 4) + 70, tileSize * 2.5, 4 * (tileSize / 10));

    fill('black');
    textSize(50);
    textFont(fonts.toThePoint);

    var stars = "";

    for (var i = 0; i < account.tempPass.length; i++) {
      stars += "*";
    }

    text(stars, finalSizeW + (2 * tileSize) + tileSize * (3 / 4) + 2, (tileSize * 2.5 + tileSize / 4) + (4 * (tileSize / 10)) + 69);

    fill('#6F6DC5');
    textSize(25);
    textFont(fonts.vera);
    rect(finalSizeW + (3.5 * tileSize), (tileSize * 2.5 + tileSize / 2.5) + (tileSize * 1.6), tileSize * 0.8, 4 * (tileSize / 10));

    textFont(fonts.vegur);
    fill('white');
    text("Login", finalSizeW + (3.5 * tileSize) + tileSize * 0.1, (tileSize * 2.5 + tileSize / 2.5) + (tileSize * 1.5) + 4 * (tileSize / 10));

    fill('black');
    textFont(fonts.vera);
    textSize(12);

    var b = fonts.vera.textBounds("Don't have an account?", 0, 0, 12);
    var dhx = cnv.width / 2 - b.w / 2;
    var dhy = cnv.height / 2 - b.h / 2;

    text("Don't have an account?", dhx, dhy + (tileSize * 1.45));

    fill('#0479FB');

    var b = fonts.vera.textBounds("Register here", 0, 0, 12);
    var dhx = cnv.width / 2 - b.w / 2;
    var dhy = cnv.height / 2 - b.h / 2;

    text("Register here", dhx, dhy + (tileSize * 1.7));

    fill('white');
    rect(finalSizeW + (2.2 * tileSize) + tileSize * (3 / 4), tileSize * 3.9 + tileSize / 4, tileSize / 7, tileSize / 7);

    if (account.savePass)
      image(images.check, finalSizeW + (2.2 * tileSize) + tileSize * (3 / 4), tileSize * 3.9 + tileSize / 4, tileSize / 7, tileSize / 7);

    fill('gray');
    text("Stay signed in", finalSizeW + (2.2 * tileSize) + tileSize * (3 / 4) + (tileSize / 5), tileSize * 3.9 + tileSize / 4 + tileSize / 8);

  } else if (register.registerNow && !account.loggedIn) {
    fill('#343547');
    rect(finalSizeW + (2 * tileSize) + tileSize / 2, tileSize * 1.5, tileSize * 3, tileSize * 5);

    textFont(fonts.toThePoint);

    fill('white');
    textSize(30);
    text("Username", finalSizeW + (2 * tileSize) + tileSize * (3 / 4) + 1, (tileSize * 2 + tileSize / 4) - 5);

    if (register.selectedText === "regU") {
      fill('#888888');
    }

    rect(finalSizeW + (2 * tileSize) + tileSize * (3 / 4), tileSize * 2 + tileSize / 4, tileSize * 2.5, 4 * (tileSize / 10));

    fill('black');
    textSize(20);
    textFont(fonts.vera);
    text(register.tempUser, finalSizeW + (2 * tileSize) + tileSize * (3 / 4) + 4, (tileSize * 2.3 + tileSize / 4) + (1 * (tileSize / 10)) - 8);

    fill('white');
    textSize(30);
    textFont(fonts.toThePoint);
    text("Password", finalSizeW + (2 * tileSize) + tileSize * (3 / 4) + 1, (tileSize * 2 + tileSize / 4) + 65);

    if (register.selectedText === "regP") {
      fill('#888888');
    }

    rect(finalSizeW + (2 * tileSize) + tileSize * (3 / 4), (tileSize * 2 + tileSize / 4) + 70, tileSize * 2.5, 4 * (tileSize / 10));

    fill('black');
    textSize(50);
    textFont(fonts.toThePoint);

    var stars = "";

    for (var i = 0; i < register.tempPass.length; i++) {
      stars += "*";
    }

    text(stars, finalSizeW + (2 * tileSize) + tileSize * (3 / 4) + 2, (tileSize * 2 + tileSize / 4) + (4 * (tileSize / 10)) + 69);

    fill('white');
    textSize(30);
    textFont(fonts.toThePoint);
    text("Confirm Password", finalSizeW + (2 * tileSize) + tileSize * (3 / 4) + 1, (tileSize * 2 + tileSize / 4) + 135);

    if (register.selectedText === "regPConf") {
      fill('#888888');
    }

    rect(finalSizeW + (2 * tileSize) + tileSize * (3 / 4), (tileSize * 2 + tileSize / 4) + 140, tileSize * 2.5, 4 * (tileSize / 10));

    fill('black');
    textSize(50);
    textFont(fonts.toThePoint);

    var stars = "";

    for (var i = 0; i < register.tempPassConf.length; i++) {
      stars += "*";
    }

    text(stars, finalSizeW + (2 * tileSize) + tileSize * (3 / 4) + 2, (tileSize * 2 + tileSize / 4) + (4 * (tileSize / 10)) + 139);

    fill('#6F6DC5');
    textSize(25);
    textFont(fonts.vera);
    rect(finalSizeW + (3.45 * tileSize), (tileSize * 2.5 + tileSize / 4) + 150, tileSize * 1.105, 5 * (tileSize / 10));

    textFont(fonts.vegur);
    fill('white');
    text("Register", finalSizeW + (3.4 * tileSize) + 10, (tileSize * 2.5 + tileSize / 4) + 125 + 6.5 * (tileSize / 10));

    fill('black');
    textFont(fonts.vera);
    textSize(12);

    var b = fonts.vera.textBounds("Already have an account?", 0, 0, 12);
    var dhx = cnv.width / 2 - b.w / 2;
    var dhy = cnv.height / 2 - b.h / 2;

    text("Already have an account?", dhx, dhy + (tileSize * 1.75));

    fill('#0479FB');

    var b = fonts.vera.textBounds("Log in here", 0, 0, 12);
    var dhx = cnv.width / 2 - b.w / 2;
    var dhy = (cnv.height / 2 - b.h / 2) + (tileSize * 2);

    text("Log in here", dhx, dhy);
  }
}

$(document).keypress(function(e) {
  var character = String.fromCharCode(e.which);


  if (account.selectedText === "loginU") {
    if (account.tempUser.length > 14) {
      return;
    }
    if (character === " ")
      account.tempUser += "_";
    else
      account.tempUser += character;
  } else if (account.selectedText === "loginP") {
    if (account.tempPass.length > 14) {
      return;
    }
    account.tempPass += character;
  } else if (register.selectedText === "regU") {
    if (register.tempUser.length > 14) {
      return;
    }
    if (character === " ")
      register.tempUser += "_";
    else
      register.tempUser += character;
  } else if (register.selectedText === "regP") {
    if (register.tempPass.length > 14) {
      return;
    }
    register.tempPass += character;
  } else if (register.selectedText === "regPConf") {
    if (register.tempPassConf.length > 14) {
      return;
    }
    register.tempPassConf += character;
  }

  drawAll();
});

$(document).keydown(function(e) {
  if (account.selectedText === "loginU") {
    if (e.which === 8) {
      account.tempUser = account.tempUser.substr(0, account.tempUser.length - 1);

      drawAll();
      return;
    }
  } else if (account.selectedText === "loginP") {
    if (e.which === 8) {
      account.tempPass = account.tempPass.substr(0, account.tempPass.length - 1);

      drawAll();
      return;
    }
  }
  if (register.selectedText === "regU") {
    if (e.which === 8) {
      register.tempUser = register.tempUser.substr(0, register.tempUser.length - 1);

      drawAll();
      return;
    }
  } else if (register.selectedText === "regP") {
    if (e.which === 8) {
      register.tempPass = register.tempPass.substr(0, register.tempPass.length - 1);

      drawAll();
      return;
    }
  } else if (register.selectedText === "regPConf") {
    if (e.which === 8) {
      register.tempPassConf = register.tempPassConf.substr(0, register.tempPassConf.length - 1);

      drawAll();
      return;
    }
  }
});

function drawAll() {
  drawBoard(selected);
  drawPieces();
  drawKilled();
  drawLogin();
}
