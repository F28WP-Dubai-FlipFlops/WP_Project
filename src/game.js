// Constants to get html elements
const cameraDiv = document.getElementById("camera");
const gameScreen = document.getElementById("gameScreen");
const healthbar = document.getElementById("healthbar");

// Constants for map size
const mapWidth = gameScreen.offsetWidth;
const mapHeight = gameScreen.offsetHeight;


// Objects to store all player, name tag and laser objects and divs
let players = {};
let lasers = {};
let playerDivs = {};
let nameTagDivs = {};
let laserDivs = {};

// Variables to store this client's ID and username
var clientId;
const username = prompt("Enter your username");
document.getElementById("playerName").innerText = username;


// Register client on server and get the client id
socket.emit("playerJoin", username);
socket.on("connect", () => {
  clientId = socket.id;
  console.log("My ID: " + clientId);
});

// Get client state and start the game
socket.on("clientState", (state) => {
  createPlayer(state);
  init();
});

// Get states of all players periodically
socket.on("playerStates", (allPlayerStates) => {
  // If a player is in the game, add them to the local game state
  for (let id in allPlayerStates) {
    if (!(id in players)) {
      createPlayer(allPlayerStates[id]);
    }
  }

  // If a player has left the game, remove them from the local game state
  for (let id in players) {
    if (!(id in allPlayerStates)) {
      removePlayer(id);
    }
  }

  // Update states of all players except client
  for (let id in allPlayerStates) {
    if (id !== clientId) {
      players[id].setState(allPlayerStates[id]);
    }
  }
});

// Create a new laser whenever another player fires a lasers
socket.on("newLaser", (laserState) => {
  createLaser(laserState);
});

// If another player has hit this client, apply damage effects
socket.on("takeDamage", (playerId, laserId) => {
  removeLaser(laserId);
  players[playerId].takeDamage();
  damageEffect(playerId);
});

// If a player has died, remove them from the game state
socket.on("playerDead", (playerId) => {
  removePlayer(playerId);
});

// If the client has died, end the game
socket.on("youLost", () => {
  endGame();
});



let camera;          // Variable for camera object
let controller;      // Variable for player controller
let inputInterval;   // Variable to hold playerInput interval
let startTime;       // Variable for when the last frame was drawn
let deltaTime;       // Variable for time elapsed since last frame was drawn
let animFrame;       // Variable to hold AnimationFrame

// Starts game
function init() {
  camera = new Camera(cameraDiv, gameScreen, players[clientId]);
  controller = new Controller();

  window.addEventListener("keydown", (e) => controller.keyListener(e));
  window.addEventListener("keyup", (e) => controller.keyListener(e));
  window.addEventListener("mousemove", (e) => { 
    controller.mouseListener(e, camera.getCamX(), camera.getCamY());

    // Update the aim angle of the client
    players[clientId].setAimAngle(controller.state.mouseX, 
                                  controller.state.mouseY);
  });

  // Interval to send player state to server every 10ms
  inputInterval = setInterval(() => {
    socket.emit("playerInput", players[clientId].getState());
  }, 10);

  // Variable used to calculate positions independant of frame rate
  startTime = Date.now();

  // Start game loop
  window.requestAnimationFrame(gameLoop);
}

// Function called every time new frame is drawn
function gameLoop() {
  // Calculate time since last frame was drawn
  deltaTime = ((Date.now() - startTime) / 1000) * 60;

  // Move client using controller state
  players[clientId].move(controller.state, deltaTime);

  // For smooth movement, update positions of other players based on their 
  // previous velocities
  for (let id in players) {
    if (id !== clientId) {
      // A new controller state is sent so that the direction of the player 
      // does not change
      players[id].move((new Controller()).state, deltaTime);
    }
  }

  // If client is able to shoot, make a laser and set a cooldown
  if (controller.state.shoot && players[clientId].canShoot) {
    const laserState = {
      id: generateLaserId(), 
      playerId: clientId, 
      pos: {
        x: players[clientId].getCentreX(), 
        y: players[clientId].getCentreY()
      }, 
      angle: players[clientId].aimAngle
    };

    createLaser(laserState);
    players[clientId].applyShootCooldown();
    // Let the server and other players know when the laser is shot
    socket.emit("shotLaser", laserState);
  }
  

  // Update positions of lasers
  for (let id in lasers) {
    lasers[id].move(deltaTime);

    // Remove laser is it hits the edge of the map
    if (lasers[id].isOutOfBounds()) {
      removeLaser(id);
    }
  }
  
  
  checkHits();               // Checks if lasers have hit a player
  updateDisplay();           // Moves html divs
  camera.moveCamera();       // Moves camera

  startTime = Date.now();    // Stores time when this frame was drawn
  
  // Call gameLoop() again when the browser is ready to draw next frame
  animFrame = window.requestAnimationFrame(gameLoop);
}



// Create a new player object
function createPlayer(playerState) {
  const id = playerState.id;

  // Make a new player object (within js)
  let player = new Player(playerState);
  players[id] = player;


  // Make a html div to represent player
  let playerDiv = document.createElement("div");
  playerDiv.setAttribute("class", "player");

  let imgColor = Math.floor(Math.random() * 8) + 1;
  playerDiv.style.backgroundImage = "url(/images/spaceship" + imgColor + ".png)";
  
  // Set position of player div and add to html
  playerDiv.style.left = playerState.pos.x + "px";
  playerDiv.style.top = playerState.pos.y + "px";
  gameScreen.appendChild(playerDiv);


  // Create a name tag for the player
  let nameTag = document.createElement("div");
  nameTag.setAttribute("class", "username");
  nameTag.innerText = playerState.username;

  // Centre name tag and set its position 5px below player
  nameTag.style.left = (playerDiv.offsetLeft + (playerDiv.offsetWidth / 2) 
                        - (nameTag.offsetWidth / 2)) + "px";
  nameTag.style.top = (playerDiv.offsetTop + playerDiv.offsetHeight) + "px";
  gameScreen.appendChild(nameTag);

  
  playerDivs[id] = playerDiv;
  nameTagDivs[id] = nameTag;

  console.log(playerState.username + " has joined the game");
}

// Deletes a player and its html div
function removePlayer(playerId) {
  console.log(players[playerId].username + " has left the game");

  gameScreen.removeChild(playerDivs[playerId]);
  gameScreen.removeChild(nameTagDivs[playerId]);

  delete players[playerId];
  delete playerDivs[playerId];
  delete nameTagDivs[playerId];
}

// Generates ta unique laser id
function generateLaserId() {
  let laserId;
  do {
    laserId = Math.floor(Math.random() * 1000);
  } while(laserId in lasers);

  return laserId;
}

// Create a new laser object
function createLaser(laserState) {
  let laser = new Laser(laserState);

  // Create an html div to represent laser
  let laserDiv = document.createElement("div");
  laserDiv.setAttribute("class", "laser");
  laserDiv.style.transform = "rotate(" + laserState.angle + "rad)";
  gameScreen.appendChild(laserDiv);
  

  lasers[laserState.id] = laser;
  laserDivs[laserState.id] = laserDiv;
}

// Checks if any of client's lasers have hit another player
function checkHits() {
  for (let lId in lasers) {
    for (let pId in players) {
      if (lasers[lId].playerId === clientId && pId !== clientId) {
        // Constants for centre x and y positions and radius of player and 
        // laser
        const playerX = players[pId].getCentreX();
        const playerY = players[pId].getCentreY();
        const laserX = lasers[lId].getCentreX();
        const laserY = lasers[lId].getCentreY();
        const laserR = laserWidth / 2;
        const playerR = playerWidth / 2;

        // Calculate distance between player and laser
        const distance = Math.sqrt(((playerX - laserX) ** 2) 
                        + ((playerY - laserY) ** 2));
        
        // If the distance is less then the sum of their of radii, the laser 
        // hit the player
        if (distance < playerR + laserR) {
          removeLaser(lId);
          players[pId].takeDamage();
          damageEffect(pId);
          socket.emit("playerHit", pId, lId);

          if(players[pId].hp <= 0){
            removePlayer(pId);
          }
          
          break;
        }
      }
    }
  }
}

// Deletes a laser object and its html div
function removeLaser(laserId) {
  gameScreen.removeChild(laserDivs[laserId]);
  delete lasers[laserId];
  delete laserDivs[laserId]
}

// Play an animation when a player takes damage
function damageEffect(playerId) {
  healthbar.style.width = players[playerId] + "%";

  // Play the animation by adding a class to player div
  playerDivs[playerId].setAttribute("class", "player damage");

  // Remove the animation class after animation is over
  setTimeout(() => {
    playerDivs[playerId].setAttribute("class", "player");
  }, 300);
}


// Updates positions of all html elements
function updateDisplay() {
  // Update client's health bar
  healthbar.style.width = players[clientId].hp + "%";

  // Move players and their name tags on the screen
  for (let id in players) {
    playerDivs[id].style.left = players[id].position.x + "px";
    playerDivs[id].style.top = players[id].position.y + "px";

    playerDivs[id].style.transform = "rotate(" + players[id].aimAngle + "rad)";

    nameTagDivs[id].style.left = (players[id].getCentreX() 
                                  - (nameTagDivs[id].offsetWidth / 2)) + "px";
    nameTagDivs[id].style.top = (players[id].position.y + playerHeight) + "px";
  }

  // Move lasers on the screen
  for (let id in lasers) {
    laserDivs[id].style.left = lasers[id].position.x + "px";
    laserDivs[id].style.top = lasers[id].position.y + "px"; 
  }
}

// Ends the game and displays points earned
function endGame() {
  updateDisplay();
  window.cancelAnimationFrame(animFrame);
  clearInterval(inputInterval);

  removePlayer(clientId);

  // TODO End screen
}
