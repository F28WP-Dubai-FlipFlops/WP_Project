// Constants for player size
const playerWidth = 80;
const playerHeight = 80;

// Constant for max velocity
const vMax = 2;

// Class to represent player in javascript
function Player(state) {
  this.id = state.id;
  this.username = state.username;
  
  this.position = {
    x: state.pos.x, 
    y: state.pos.y
  };
  
  this.velocity = {
    x: state.vel.x, 
    y: state.vel.y
  };

  this.aimAngle = state.aimAngle;
  this.canShoot = state.canShoot;
  this.hp = state.hp;
  this.points = state.points;

  
  // Returns a state object for the player
  this.getState = function() {
    return {
      id: this.id, 
      username: this.username, 
      pos: {x: this.position.x, y: this.position.y}, 
      vel: {x: this.velocity.x, y: this.velocity.y}, 
      aimAngle: this.aimAngle, 
      canShoot: this.canShoot, 
      hp: this.hp, 
      points: this.points
    }
  };

  // Sets the state of the player
  this.setState = function(state) {
    this.id = state.id;
    this.username = state.username;
    
    this.position.x = state.pos.x; 
    this.position.y = state.pos.y;
    
    this.velocity.x = state.vel.x; 
    this.velocity.y = state.vel.y;

    this.aimAngle = state.aimAngle;
    this.canShoot = state.canShoot;
    this.hp = state.hp;
    this.points = state.points;
  }

  // Gets x value of centre of player div
  this.getCentreX = function() {
    return this.position.x + playerWidth / 2;
  };

  // Gets y value of centre of player div
  this.getCentreY = function() {
    return this.position.y + playerHeight / 2;
  };

  // Ensures player stays within edges of the screen
  this.keepWithinBounds = function() {
    // If player hits left or right edge of screen
    if (this.position.x < 0) {
      this.position.x = 0;
      this.velocity.x = 0;
    } else if (this.position.x + playerWidth > mapWidth) {
      this.position.x = mapWidth - playerWidth;
      this.velocity.x = 0;
    }

    // If player hits top or bottom edge of screen
    if (this.position.y < 0) {
      this.position.y = 0;
      this.velocity.y = 0;
    } else if (this.position.y + playerHeight + 20 > mapHeight) {
      this.position.y = mapHeight - playerHeight - 20;
      this.velocity.y = 0;
    }
  };

  // Calculates the aim angle of player
  this.setAimAngle = function(mouseX, mouseY) {
    // Calculate x and y componenets of vector from player to mouse
    let vectorX = mouseX - this.getCentreX();
    let vectorY = mouseY - this.getCentreY();
    
    // Calculate angle between mouse and right x-axis passing through player
    // Angle will be -0 to -pi rad if mouse above (counter-clockwise)
    //               +0 to +pi rad if mouse below (clockwise)
    let angle_rad = Math.atan2(vectorY, vectorX);

    // Get angle between mouse and upper y-axis through player
    angle_rad += Math.PI / 2;

    // Convert angle to be between 0 to 2pi rad clockwise 
    // 3 o'clock -> +pi/2; 9 o'clock -> +3pi/2
    if (angle_rad < 0) {
      angle_rad += Math.PI * 2;
    }
    
    this.aimAngle = angle_rad;
  };

  // Calculate new position of player
  this.move = function(controllerState, deltaTime) {
    // Apply controls on player
    let dx = 0;
    let dy = 0;
    
    // Calculate change in velocity based on key presses
    if (controllerState.left) dx += -1 * deltaTime;
    if (controllerState.right) dx += 1 * deltaTime;
    
    if (controllerState.up) dy += -1 * deltaTime;
    if (controllerState.down) dy += 1 * deltaTime;

    // Increase velocity of velocity is less than vMax   
    if (Math.sqrt((this.velocity.x ** 2) + (this.velocity.y ** 2)) <= vMax) {
      this.velocity.x += dx * 0.15;
      this.velocity.y += dy * 0.15;
    }

    // Change player position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    // Apply friction to simulate effect of being in space
    this.velocity.x *= 0.98;
    this.velocity.y *= 0.98;

    this.keepWithinBounds();
  };

  // Applies a shoot cooldown on the player
  this.applyShootCooldown = function() {
    this.canShoot = false;

    setTimeout(() => {
      this.canShoot = true;
    }, 1500);
  };
}
