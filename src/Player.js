// Class to represent player in javascript
function Player(x, y) {
  this.width = 30;
  this.height = 30; 
  
  this.position = {
    x: x, 
    y: y
  };
  
  this.velocity = {
    x: 0, 
    y: 0
  };

  this.updatePos = function() {
    // Change player position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    // Apply friction to simulate effect of being in space
    this.velocity.x *= 0.95;
    this.velocity.y *= 0.95;


    // If player hits edge of game screen
    if (this.position.x < 0) {
      this.position.x = 0;
      this.velocity.x = 0;
    } else if (this.position.x + this.width > GAME_WIDTH) {
      this.position.x = GAME_WIDTH - this.width;
      this.velocity.x = 0;
    }

    if (this.position.y < 0) {
      this.position.y = 0;
      this.velocity.y = 0;
    } else if (this.position.y + this.height > GAME_HEIGHT) {
      this.position.y = GAME_HEIGHT - this.height;
      this.velocity.y = 0;
    }
  };

  this.shoot = function() {
    laserShots.push(new LaserShot(this));

    let shot = document.createElement('div');
    shot.setAttribute('class', 'laser');
    gameScreen.appendChild(shot);
    laserShotsDivs.push(shot);
  };
}