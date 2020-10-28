// Class to represent a laser shot by the player
function LaserShot(player) {
    this.width = 8;
    this.height = 8;
    this.player = player;
  
    this.position = {
      x: this.player.position.x + this.player.width - this.width/2, 
      y: this.player.position.y + this.player.height/2 - this.height/2
    };
  
    this.velocity = {
      x: 5, 
      y: 0
    };
  
    this.updatePos = function() {
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    };
  }