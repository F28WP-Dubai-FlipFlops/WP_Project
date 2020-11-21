
const cameraDiv = document.getElementById("camera");
const gameScreen = document.getElementById("gameScreen");
const mapWidth = gameScreen.offsetWidth;
const mapHeight = gameScreen.offsetHeight;

// Objects to store all player, name tag and laser objects
let players = {};
let laserShots = {};
let playerDivs = {};
let nameTagDivs = {};
let laserDivs = {};

// (Temp.) Add two players
createPlayer(1, "Player1", 0, 0);
createPlayer(2, "Player2", 500, 200);


const camera = new Camera(cameraDiv, gameScreen, players[1]);
const controller = new Controller();

// Variables used to calculate positions independant of frame rate
let startTime = Date.now();
let deltaTime;

// Function called every time new frame is drawn
function gameLoop() {
  // Calculate time since last frame was drawn
  deltaTime = ((Date.now() - startTime) / 1000) * 60;
  
  // Controls affect all players the same for now; used for testing
  for (let i in players) {
    let dx = 0;
    let dy = 0;
    
    // Calculate change in velocity based on key presses
    if (controller.left) dx += -1 * deltaTime;
    if (controller.right) dx += 1 * deltaTime;
    
    if (controller.up) dy += -1 * deltaTime;
    if (controller.down) dy += 1 * deltaTime;

    players[i].move(dx, dy);

    // If player is able to shoot, make a laser and set a cooldown
    if (controller.shoot && players[i].canShoot) {
      createNewLaser(i);
      players[i].applyShootCooldown();
    }
  }

  for (let i in laserShots) {
    laserShots[i].move(deltaTime);

    if (laserShots[i].isOutOfBounds()) {
      removeLaser(i);
    }
  }
  
  
  checkHits();               // Checks if lasers have hit a player
  updateDisplay();           // Moves html divs
  camera.moveCamera();       // Moves camera


  startTime = Date.now();    // Stores time when this frame was drawn
  window.requestAnimationFrame(gameLoop);
}


// Event listeners
window.addEventListener("keydown", (e) => controller.keyListener(e));
window.addEventListener("keyup", (e) => controller.keyListener(e));

window.addEventListener("mousemove", (e) => {
  controller.mouseListener(e, camera.getCamX(), camera.getCamY());
  
  // Recalculates the aim angle of the player
  for (let i in players) {
    players[i].setAimAngle(controller.mouseX, controller.mouseY);
  };
});

// Start game loop
window.requestAnimationFrame(gameLoop);



// Create a new player object
function createPlayer(id, username, x, y) {
  // Make a new player object (within js)
  let player = new Player(id, username, x, y);
  players[id] = player;


  // Make a html div to represent player
  let playerDiv = document.createElement("div");
  playerDiv.setAttribute("class", "player");

  let imgColor = Math.floor(Math.random() * 8) + 1;
  playerDiv.style.backgroundImage = "url(/images/spaceship" + imgColor + ".png)";
  
  // Set position of player div and add to html
  playerDiv.style.left = x + "px";
  playerDiv.style.top = y + "px";
  gameScreen.appendChild(playerDiv);


  // Create a name tag for the player
  let nameTag = document.createElement("div");
  nameTag.setAttribute("class", "username");
  nameTag.innerHTML = username;

  // Centre name tag and set its position 5px below player
  nameTag.style.left = (playerDiv.offsetLeft + (playerDiv.offsetWidth / 2) 
                        - (nameTag.offsetWidth / 2)) + "px";
  nameTag.style.top = (playerDiv.offsetTop + playerDiv.offsetHeight) + "px";
  gameScreen.appendChild(nameTag);

  
  playerDivs[id] = playerDiv;
  nameTagDivs[id] = nameTag;
}

// Create a new laser object
function createNewLaser(playerId) {
  // Generate a unique laser id
  let laserId;
  do {
    laserId = Math.floor(Math.random() * 1000);
  } while(laserId in laserShots);

  // Calulate position and direction of laser and make the laser object
  let x = players[playerId].getCentreX();
  let y = players[playerId].getCentreY();
  let angle = players[playerId].aimAngle;
  let laser = new Laser(laserId, playerId, x, y, angle);

  // Create an html div to represent laser
  let laserDiv = document.createElement("div");
  laserDiv.setAttribute("class", "laser");
  laserDiv.style.transform = "rotate(" + angle + "rad)";
  gameScreen.appendChild(laserDiv);
  
  
  laserShots[laserId] = laser;
  laserDivs[laserId] = laserDiv;
}

// Checks if any laser has hit a player
function checkHits() {
  for (let i in laserShots) {
    for (let j in players) {
      if (laserShots[i].playerId !== j) {
        // Constants for centre x and y positions and radius of player and laser
        const playerX = players[j].getCentreX();
        const playerY = players[j].getCentreY();
        const laserX = laserShots[i].getCentreX();
        const laserY = laserShots[i].getCentreY();
        const laserR = laserWidth / 2;
        const playerR = playerWidth / 2;

        // Calculate distance between player and laser
        const distance = Math.sqrt(((playerX - laserX) ** 2) 
                        + ((playerY - laserY) ** 2));
        
        // If the distance is less then the sum of their of radii, the laser 
        // hit the player
        if (distance < playerR + laserR) {
          removeLaser(i);
          players[j].takeDamage();
          damageEffect(j);
          break;
        }
      }
    }
  }
}

// Deletes a laser object and its html div
function removeLaser(laserId) {
  gameScreen.removeChild(laserDivs[laserId]);
  delete laserShots[laserId];
  delete laserDivs[laserId]
}

// Play an animation when a player takes damage
function damageEffect(playerId) {
  // Play the animation by adding a class to player div
  playerDivs[playerId].setAttribute("class", "player damage");

  // Remove the animation class after animation is over
  setTimeout(() => {
    playerDivs[playerId].setAttribute("class", "player");
  }, 300);
}


// Updates positions of all html elements
function updateDisplay() {
  for (let i in players) {
    // Move player on the game screen
    playerDivs[i].style.left = players[i].position.x + "px";
    playerDivs[i].style.top = players[i].position.y + "px";

    // Rotate player
    playerDivs[i].style.transform = "rotate(" + players[i].aimAngle + "rad)";

    // Move name tag on the game screen
    nameTagDivs[i].style.left = (players[i].getCentreX() 
                              - (nameTagDivs[i].offsetWidth / 2)) + "px";
    nameTagDivs[i].style.top = (players[i].position.y + playerHeight) + "px";
  }

  for (let i in laserShots) {
    laserDivs[i].style.left = laserShots[i].position.x + "px";
    laserDivs[i].style.top = laserShots[i].position.y + "px"; 
  }
}
