const laserWidth = 12;
const laserHeight = 12;

// Class to represent a laser shot by the player
function Laser(id, playerId, playerX, playerY, angle) {
  this.id = id;
  this.playerId = playerId;

  // Initially set position at the centre of player div
  this.position = {
    x: playerX - laserWidth / 2, 
    y: playerY - laserHeight / 2
  };

  // Calculate x and y components of velocity using angle
  this.velocity = {
    x: Math.cos(angle - Math.PI / 2) * 8, 
    y: Math.sin(angle - Math.PI / 2) * 8
  };

  // Gets x value of centre of laser div
  this.getCentreX = function() {
    return this.position.x + laserWidth / 2;
  }

  // Gets y value of centre of laser div
  this.getCentreY = function() {
    return this.position.y + laserHeight / 2;
  }

  // Checks if laser is out of bounds; returns true if it is
  this.isOutOfBounds = function() {
    // If laser hits edge of map, return true
    if (this.position.x < 0 
            || this.position.x + laserWidth > mapWidth 
            || this.position.y < 0 
            || this.position.y + laserHeight > mapHeight) {
      return true;
    }
    
    // If laser is still within bounds
    return false;
  };
  
  // Calculates new position of laser
  this.move = function(deltaTime) {
    // Change laser position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  };
}
