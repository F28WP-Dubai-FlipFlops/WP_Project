// Class to represent a laser shot by the player
function Laser(player, shot) {
  this.player = player;               // Player object that shot this laser
  this.htmlElement = shot;
  this.parent = this.htmlElement.parentElement;
  this.width = this.htmlElement.offsetWidth;
  this.height = this.htmlElement.offsetHeight;

  // Initially set position at the centre of player div
  this.position = {
    x: this.player.position.x + this.player.width - this.width/2, 
    y: this.player.position.y + this.player.height/2 - this.height/2
  };

  this.velocity = {
    x: 5, 
    y: 0
  };

  // Checks if laser is out of bounds and destroys it if it is
  // Returns true if laser is destroyed, false otherwise
  this.outOfBounds = function() {
    // If laser goes off the screen, destroy the laser
    if (this.position.x + this.width < 0 
            || this.position.x > this.parent.offsetWidth 
            || this.position.y + this.height < 0 
            || this.position.y > this.parent.offsetHeight) {
      gameScreen.removeChild(this.htmlElement);
      laserShots.splice(laserShots.indexOf(this), 1);
      return true;
    }
    
    // If laser is still within bounds
    return false;
  }
  
  // Moves laser on game screen
  this.updatePos = function() {
    // Change laser position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (!this.outOfBounds()) {
      this.htmlElement.style.left = this.position.x + "px";
      this.htmlElement.style.top = this.position.y + "px"; 
    }
  };
}