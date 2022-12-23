var canvas;
var backgroundImage, car1_img, car2_img, track;
var fuelImage, powerCoinImage;

var database, gameState;
var form, player, playerCount;
var allPlayers, car1, car2, fuels, powerCoins, obstacles;
var cars = [];
var obstacle1Img, obstacle2Img;

function preload() { //imagenes
  backgroundImage = loadImage("./assets/background.png");
  car1_img = loadImage("../assets/car1.png");
  car2_img = loadImage("../assets/car2.png");
  track = loadImage("../assets/track.jpg");
  fuelImage = loadImage("./assets/fuel.png");
  obstacle1Img = loadImage("./assets/obstacle1.png");
  obstacle2Img = loadImage("./assets/obstacle2.png");
  powerCoinImage = loadImage("./assets/goldCoin.png");
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  database = firebase.database(); //crear base de datos
  game = new Game();
  game.getState();
  game.start();
}

function draw() { //ver en que estado de juego estamos
  background(backgroundImage);
  if (playerCount === 2) {
    game.update(1);
  }

  if (gameState === 1) {
    game.play();
  }
}

function windowResized() { //ajuste de pantalla
  resizeCanvas(windowWidth, windowHeight);
}
