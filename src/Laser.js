// Class to represent a laser shot by the player
function Laser(player, shot) {
  this.player = player;               // Player object that shot this laser
  this.htmlElement = shot;
  this.parent = this.htmlElement.parentElement;
  this.width = this.htmlElement.offsetWidth;
  this.height = this.htmlElement.offsetHeight;

  // Initially set position at the centre of player div
  this.position = {
    x: this.player.getCentreX() - this.width / 2, 
    y: this.player.getCentreY() - this.height / 2
  };

  // Calculate x and y components of velocity using angle
  this.velocity = {
    x: Math.cos(this.player.aimAngle - Math.PI / 2) * 8, 
    y: Math.sin(this.player.aimAngle - Math.PI / 2) * 8
  };

  // Gets x value of centre of laser div
  this.getCentreX = function() {
    return this.position.x + this.width / 2;
  }

  // Gets y value of centre of laser div
  this.getCentreY = function() {
    return this.position.y + this.height / 2;
  }

  // Removes this laser from the game screen
  this.removeLaser = function() {
    gameScreen.removeChild(this.htmlElement);
    laserShots.splice(laserShots.indexOf(this), 1);
  }

  // Checks if laser is out of bounds; returns true if it is
  this.outOfBounds = function() {
    // If laser hits edge of map, return true
    if (this.position.x < 0 
            || this.position.x + this.width > this.parent.offsetWidth 
            || this.position.y < 0 
            || this.position.y + this.height > this.parent.offsetHeight) {
      return true;
    }
    
    // If laser is still within bounds
    return false;
  };
  
  // Moves laser on game screen
  this.updatePos = function() {
    // Change laser position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (!this.outOfBounds()) {
      this.htmlElement.style.left = this.position.x + "px";
      this.htmlElement.style.top = this.position.y + "px"; 
    }
    
    // Destroy laser if it is out of bounds
    else {
      this.removeLaser();
    }
  };

  // Checks if this laser hit a player
  // Returns true if hit, false otherwise
  this.hitPlayer = function(player) {
    if (player !== this.player) {
      // Constants for centre x and y positions and radius of player and laser
      const playerX = player.getCentreX();
      const playerY = player.getCentreY();
      const laserX = this.getCentreX();
      const laserY = this.getCentreY();
      const laserR = this.width / 2;
      const playerR = player.width / 2;

      // Calculate distance between player and laser
      const distance = Math.sqrt(((playerX - laserX) ** 2) 
                     + ((playerY - laserY) ** 2));
      
      // If the distance is less then the sum of their of radii, the laser 
      // hit the player
      if (distance < playerR + laserR) {
        return true;
      }
    }

    // If the laser did not hit the other player
    return false;
  };
}
