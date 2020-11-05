
const gameScreen = document.getElementById("gameScreen");

// Arrays to store all Player and Laser objects
let players = [];
let laserShots = [];

// (Temp.) Add two players
players.push(new Player("Player1", 0, 0));
players.push(new Player("Player2", 1200, 600));


const controller = new Controller();


// Function called every time new frame is drawn
let gameLoop = function() {
  
  // Controls affect all players the same for now; used for testing
  for (let i = 0; i < players.length; i++) {
    let dx = 0;
    let dy = 0;
    
    // Calculate change in velocity based on key presses
    if (controller.left) dx += -1;
    if (controller.right) dx += 1;
    
    if (controller.up) dy += -1;
    if (controller.down) dy += 1;

    players[i].move(dx, dy, controller.mouseX, controller.mouseY);

    if (controller.shoot) {
      players[i].shoot();
    }
  }

  // Reset shoot state once all lasers are shot
  controller.shoot = false;

  for (let i = laserShots.length - 1; i >= 0; i--) {
    laserShots[i].updatePos();
  }

  
  window.requestAnimationFrame(gameLoop);
}


window.addEventListener("keydown", (e) => controller.keyListener(e));
window.addEventListener("keyup", (e) => controller.keyListener(e));
window.addEventListener("mousemove", (e) => controller.mouseListener(e));

// Start game loop
window.requestAnimationFrame(gameLoop);
