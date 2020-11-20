// Class to represent player in javascript
function Player(username, x, y) {
  this.htmlElement = createPlayer(x, y);
  this.nameTag = createNameTag(username, this.htmlElement);
  this.parent = this.htmlElement.parentElement;
  this.width = this.htmlElement.offsetWidth;
  this.height = this.htmlElement.offsetHeight; 
  
  this.position = {
    x: x, 
    y: y
  };
  
  this.velocity = {
    x: 0, 
    y: 0
  };

  this.vMax = 2;
  this.aimAngle = 0;
  this.canShoot = true;

  // Gets x value of centre of player div
  this.getCentreX = function() {
    return this.position.x + this.width / 2;
  }

  // Gets y value of centre of player div
  this.getCentreY = function() {
    return this.position.y + this.height / 2;
  }

  // Ensures player stays within edges of the screen
  this.keepWithinBounds = function() {
    // If player hits left or right edge of screen
    if (this.position.x < 0) {
      this.position.x = 0;
      this.velocity.x = 0;
    } else if (this.position.x + this.width > this.parent.offsetWidth) {
      this.position.x = this.parent.offsetWidth - this.width;
      this.velocity.x = 0;
    }

    // If player hits top or bottom edge of screen
    if (this.position.y < 0) {
      this.position.y = 0;
      this.velocity.y = 0;
    } else if (this.position.y + this.height + 20 > this.parent.offsetHeight) {
      this.position.y = this.parent.offsetHeight - this.height - 20;
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
  
  // Updates position of html divs holding the player and name tag
  this.updatePos = function() {
    // Move player on the game screen
    this.htmlElement.style.left = this.position.x + "px";
    this.htmlElement.style.top = this.position.y + "px";

    // Rotate player
    this.htmlElement.style.transform = "rotate(" + this.aimAngle + "rad)";

    // Move name tag on the game screen
    this.nameTag.style.left = (this.getCentreX() 
                              - (this.nameTag.offsetWidth / 2)) + "px";
    this.nameTag.style.top = (this.position.y + this.height) + "px";
  };

  // Calculate new position of player
  this.move = function(dx, dy) {
    // Increase velocity of velocity is less than vMax   
    if (Math.sqrt((this.velocity.x ** 2) + (this.velocity.y ** 2)) <= this.vMax) {
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
    this.updatePos();
  };

  // Create a new laser div
  this.shoot = function() {
    // Shoot a laser if cooldown is off
    if (this.canShoot) {
      let shot = document.createElement("div");
      shot.setAttribute("class", "laser");
      shot.style.transform = "rotate(" + this.aimAngle + "rad)";
      gameScreen.appendChild(shot);

      laserShots.push(new Laser(this, shot));

      // Reset cooldown
      this.canShoot = false;
      setTimeout(() => {
        this.canShoot = true;
      }, 1000);
    }
  };

  // Calculates player health and points when hit
  this.takeDamage = function() {
    // Play an animation by adding a class to player div
    this.htmlElement.setAttribute("class", "player damage");

    // Remove the animation class after animation is over
    setTimeout(() => {
      this.htmlElement.setAttribute("class", "player");
    }, 300);
  };
}


// Create a new div to represent player object
let createPlayer = function(x, y) {
  let player = document.createElement("div");
  player.setAttribute("class", "player");

  // (Temp.) Set player image randomly
  let imgColor = Math.floor(Math.random() * 8);
  player.style.backgroundImage = "url(/images/spaceship" + imgColor + ".png)";
  
  // Set position of player div and add to html
  player.style.left = x + "px";
  player.style.top = y + "px";
  gameScreen.appendChild(player);

  return player;
};

// Create a new div to hold player's name tag
let createNameTag = function(username, player) {
  let nameTag = document.createElement("div");
  nameTag.setAttribute("class", "username");
  nameTag.innerHTML = username;

  // Centre name tag and set its position 5px below player
  nameTag.style.left = (player.offsetLeft + (player.offsetWidth / 2) 
                        - (nameTag.offsetWidth / 2)) + "px";
  nameTag.style.top = (player.offsetTop + player.offsetHeight) + "px";
  gameScreen.appendChild(nameTag);

  return nameTag;
};
