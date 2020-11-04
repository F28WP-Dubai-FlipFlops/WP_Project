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
    } else if (this.position.y + this.height > this.parent.offsetHeight) {
      this.position.y = this.parent.offsetHeight - this.height;
      this.velocity.y = 0;
    }
  };
  
  // Updates position of html divs holding the player and name tag
  this.updatePos = function() {
    // Move player on the game screen
    this.htmlElement.style.left = this.position.x + "px";
    this.htmlElement.style.top = this.position.y + "px";

    // Move name tag on the game screen
    this.nameTag.style.left = (this.position.x + (this.width / 2) - 
                               (this.nameTag.offsetWidth / 2)) + "px";
    this.nameTag.style.top = (this.position.y + this.height + 5) + "px";
  };

  // Calculate new position of player
  this.move = function(dx, dy) {
    // Increase velocity by 0.25 in the required direction
    this.velocity.x += dx * 0.25;
    this.velocity.y += dy * 0.25;

    // Change player position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    // Apply friction to simulate effect of being in space
    this.velocity.x *= 0.95;
    this.velocity.y *= 0.95;

    this.keepWithinBounds();
    this.updatePos();
  };

  // Create a new laser div
  this.shoot = function() {
    let shot = document.createElement("div");
    shot.setAttribute("class", "laser");
    gameScreen.appendChild(shot);

    laserShots.push(new Laser(this, shot));
  };
}

// Create a new div to represent player object
let createPlayer = function(x, y) {
  let player = document.createElement("div");
  player.setAttribute("class", "player");
  
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
  nameTag.style.left = (player.offsetLeft + (player.offsetWidth / 2) - 
                        (nameTag.offsetWidth / 2)) + "px";
  nameTag.style.top = (player.offsetTop + player.offsetHeight + 5) + "px";
  gameScreen.appendChild(nameTag);

  return nameTag;
};
