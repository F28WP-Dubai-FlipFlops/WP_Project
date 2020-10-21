
const gameScreen = document.getElementById("gameScreen");

const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;

const playerDiv = document.getElementById("player");


// Player object to keep track of player within javascript
let player = {
  width: 30, 
  height: 30, 
  
  position: {
    x: 0, 
    y: 0
  }, 
  
  velocity: {
    x: 0, 
    y: 0
  }
}


let laserShots = [];    // Array for all laserShot objects
let laserShotsDivs = [];    // Array for all divs representing laserShots

// Constructor function for LaserShot object; used to represent laser shots in js
function LaserShot() {
  this.width = 8;
  this.height = 8;

  // Generate laser from centre of player div
  this.position = {
    x: player.position.x + player.width - this.width/2, 
    y: player.position.y + player.height/2 - this.height/2
  }

  this.velocity = {
    x: 0, 
    y: 0
  }
}

// Method to create new laser shot and add to html
LaserShot.prototype.createShot = function() {
  let shot = document.createElement('div');
  shot.setAttribute('class', 'laser');
  gameScreen.appendChild(shot);
  laserShotsDivs.push(shot);
}


// Controller class to hande player input
playerController = {
  up: false, 
  down: false, 
  left: false, 
  right: false, 
  shoot: false, 

  keyListener: function(keyEvent) {
    let keyState = (keyEvent.type === "keydown")? true: false;

    if (keyEvent.keyCode === 32) {
      playerController.shoot = keyState;
      console.log("shoot");
    }

    switch (keyEvent.keyCode) {
      case 37:
      case 65:
        playerController.left = keyState;
        console.log("left");
        break;

      case 38:
      case 87:
        playerController.up = keyState;
        console.log("up");
        break;

      case 39:
      case 68:
        playerController.right = keyState;
        console.log("right");
        break;

      case 40:
      case 83:
        playerController.down = keyState;
        console.log("down");
        break;
    }

    if([32, 37, 38, 39, 40, 65, 68, 83, 87].indexOf(keyEvent.keyCode) != 1) {
        keyEvent.preventDefault();
    }
  }
}


// Function called everytime new frame is drawn
let gameLoop = function() {

  if (playerController.up) {
    player.velocity.y -= 0.25;
  }

  if (playerController.down) {
    player.velocity.y += 0.25;
  }

  if (playerController.left) {
    player.velocity.x -= 0.25;
  }

  if (playerController.right) {
    player.velocity.x += 0.25;
  }

  // Change player position
  player.position.x += player.velocity.x;
  player.position.y += player.velocity.y;
  // Apply friction to simulate effect of being in space
  player.velocity.x *= 0.95;
  player.velocity.y *= 0.95;


  // If player hits edge of game screen
  if (player.position.x < 0) {
    player.position.x = 0;
    player.velocity.x = 0;
  } else if (player.position.x + player.width > GAME_WIDTH) {
    player.position.x = GAME_WIDTH - player.width;
    player.velocity.x = 0;
  }

  if (player.position.y < 0) {
    player.position.y = 0;
    player.velocity.y = 0;
  } else if (player.position.y + player.height > GAME_HEIGHT) {
    player.position.y = GAME_HEIGHT - player.height;
    player.velocity.y = 0;
  }

  
  // Move player on the game screen
  playerDiv.style.left = player.position.x + "px";
  playerDiv.style.top = player.position.y + "px";



  // Create new shot
  if (playerController.shoot) {
    let newShot = new LaserShot();
    newShot.createShot();
    laserShots.push(newShot)

    newShot.velocity.x = 5;
    newShot.velocity.y = 0;
    playerController.shoot = false;
  }
  
  for (let i = laserShots.length - 1; i >= 0; i--) {
    // Change position of each shot
    laserShots[i].position.x += laserShots[i].velocity.x;
    laserShots[i].position.y += laserShots[i].velocity.y;

    // If shot hits edge of game screen, delete shot div
    if (laserShots[i].position.x < 0 || laserShots[i].position.x > GAME_WIDTH || laserShots[i].position.y < 0 || laserShots[i].position.y > GAME_HEIGHT) {
      gameScreen.removeChild(laserShotsDivs[i]);
      laserShots.splice(i, 1);
      laserShotsDivs.splice(i, 1);
    }
    
    // Move shot on screen
    else {
      laserShotsDivs[i].style.left = laserShots[i].position.x + "px";
      laserShotsDivs[i].style.top = laserShots[i].position.y + "px"; 
    }
  }

  window.requestAnimationFrame(gameLoop);
}


window.addEventListener("keydown", playerController.keyListener);
window.addEventListener("keyup", playerController.keyListener);

window.requestAnimationFrame(gameLoop);
