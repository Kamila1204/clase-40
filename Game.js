class Game {
  constructor() {
    //reseteo de juego
    this.resetTitle = createElement("h2"); 
    this.resetButton = createButton("");

    //puntaje
    this.leadeboardTitle = createElement("h2");

    //nombre jugadores
    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
  }

  //obtención, y actualización de estado de juego
  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    //creación objeto clase player
    player = new Player();
    playerCount = player.getCount();

    //creación y muestra de form
    form = new Form();
    form.display();

    //se crea objeto, se les da imagen y se meten en una matriz
    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.scale = 0.07;

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.scale = 0.07;
//matriz carritos
    cars = [car1, car2];

    //----------------Recompensas y obstáculos
    fuels = new Group();
    powerCoins = new Group();
    obstacles = new Group();

    //Generación de obstáculos y sus posiciones, no podemos hacerlo al azar pq capaz a uno le toca más que a otro y sería injusto
    var obstaclesPositions = [
      { x: width / 2 + 250, y: height - 800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 1300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 1800, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 2300, image: obstacle2Image },
      { x: width / 2, y: height - 2800, image: obstacle2Image },
      { x: width / 2 - 180, y: height - 3300, image: obstacle1Image },
      { x: width / 2 + 180, y: height - 3300, image: obstacle2Image },
      { x: width / 2 + 250, y: height - 3800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 4300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 4800, image: obstacle2Image },
      { x: width / 2, y: height - 5300, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 5500, image: obstacle2Image }
    ];

    // Agregando sprite de combustible al juego
    this.addSprites(fuels, 4, fuelImage, 0.02);

    // Agregando sprite de moneda al juego
    this.addSprites(powerCoins, 18, powerCoinImage, 0.09);

    // Agregando sprite de obstáculos al juego, tamaño, imagen y posiciones
    this.addSprites(obstacles, obstaclesPosition.length, obstacle1Img, 0.04, obstaclesPositions);

  }


//Creación de sprites para los grupos de monedas y combustibles
  addSprites(spriteGroup, numberOfSprites, spriteImage, scale, positions=[]) {
    for (var i = 0; i < numberOfSprites; i++) {
      var x, y;

      if(position.length>0){ //verifica longitud, asigna imágenes y añade todo al grupo
        //si hay posiciones, entonces...
        x = positions[i].x;
        y = positions[i].y;
        spriteImage = positions[i].image; 
      }
      else{
        //si no hay posiciones definidas, entonces...
        x = random(width / 2 + 150, width / 2 - 150);
        y = random(-height * 4.5, height - 400); 
      }

      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage);

      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }

  //HTML
  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    //C39
    this.resetTitle.html("Reiniciar juego");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100);

    this.leadeboardTitle.html("Puntuación");
    this.leadeboardTitle.class("resetText");
    this.leadeboardTitle.position(width / 3 - 60, 40);

    this.leader1.class("leadersText");
    this.leader1.position(width / 3 - 50, 80);

    this.leader2.class("leadersText");
    this.leader2.position(width / 3 - 50, 130);
  }

  play() {
    this.handleElements();
    this.handleResetButton();

    Player.getPlayersInfo(); //obtención de info

    //si todos los jugadores  es diferente a indefinido (hay jugadores), entonces muestra fondo de pantalla
    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);

      //mostrar tabla de scores
      this.showLeaderboard();

      //índice de la matriz
      var index = 0;
      //muestra direcciones de los autos para saber quien va ganando y perdiendo
      for (var plr in allPlayers) {
        //agrega 1 al índice para cada bucle
        index = index + 1;

        //utiliza los datos de la base de datos para mostrar los autos en las direcciones x e y
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;

        if (index === player.index) { //sale circulito rojo que indica quien de los dos autos eres tú
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          // cambiar la posición de la cámara en la dirección y
          camera.position.y = cars[index - 1].position.y;
        }
      }

      // manejar eventos teclado
      this.handlePlayerControls();

      drawSprites();
    }
  }

  handleResetButton() { //Actualiza la página al presionar botón reset
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        playerCount: 0,
        gameState: 0,
        players: {}
      });
      window.location.reload();
    });
  }

  showLeaderboard() {
    var leader1, leader2;
    var players = Object.values(allPlayers); //si judador uno va primero, mostrar posición y rank
    if (
      (players[0].rank === 0 && players[1].rank === 0) ||
      players[0].rank === 1
    ) {
      // &emsp;    esta etiqueta se utiliza para mostrar cuatros espacios
      leader1 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;

      leader2 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
    }

    if (players[1].rank === 1) {
      leader1 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;

      leader2 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
    }

    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }

  handlePlayerControls() { //control del coche mediante teclado
    if (keyIsDown(UP_ARROW)) {
      player.positionY += 10;
      player.update();
    }

    if (keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50) {
      player.positionX -= 5;
      player.update();
    }

    if (keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 300) {
      player.positionX += 5;
      player.update();
    }
  }

}
