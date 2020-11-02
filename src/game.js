
const gameScreen = document.getElementById("gameScreen");

const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;

const playerDiv = document.getElementById("player");

const userName = document.getElementById("user_name");


// Player object to keep track of player within javascript
let player = {
  width: 30, 
  height: 30, 
  
  // Player at centre of game screen
  position: {
    x: 0, 
    y: 0
  }, 
  
  velocity: {
    x: 0, 
    y: 0
  }
}


// Controller class to hande player input
playerController = {
  up: false, 
  down: false, 
  left: false, 
  right: false, 

  keyListener: function(keyEvent) {
    let keyState = (keyEvent.type == "keydown")? true: false;

    switch (keyEvent.keyCode) {
      case 37:
        playerController.left = keyState;
        console.log("left");
        break;
      case 38:
        playerController.up = keyState;
        console.log("up");
        break;
      case 39:
        playerController.right = keyState;
        console.log("right");
        break;
      case 40:
        playerController.down = keyState;
        console.log("down");
        break;
    }

    if([37, 38, 39, 40].indexOf(keyEvent.keyCode) != 1) {
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
  // For User name to follow the user
  userName.style.left = player.position.x + "px";
  userName.style.top = (player.position.y + 5) + "px";
  window.requestAnimationFrame(gameLoop);
}


window.addEventListener("keydown", playerController.keyListener);
window.addEventListener("keyup", playerController.keyListener);

window.requestAnimationFrame(gameLoop);
