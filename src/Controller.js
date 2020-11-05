// Controller class to hande player input
function Controller() {
  // Remember state of keys so holding down a key will repeat its function
  this.up = false; 
  this.down = false; 
  this.left = false;
  this.right = false; 
  this.shoot = false; 
  this.mouseX = 0;
  this.mouseY = 0;

  // Updates key states
  this.keyListener = function(keyEvent) {
    let keyState = keyEvent.type === "keydown";
    
    switch (keyEvent.keyCode) {
      case 37:    // Left Arrow Key
      case 65:    // "A" Key
        this.left = keyState;
        console.log("left");
        break;

      case 38:    // Up Arrow Key
      case 87:    // "W" Key
        this.up = keyState;
        console.log("up");
        break;

      case 39:    // Right Arrow Key
      case 68:    // "D" Key
        this.right = keyState;
        console.log("right");
        break;

      case 40:    // Down Arrow Key
      case 83:    // "S" Key
        this.down = keyState;
        console.log("down");
        break;

      case 32:    // Spacebar
        this.shoot = keyState;
        console.log("shoot");
        break;
    }

    // Prevent default operations of control keys (page scrolling etc.)
    if([32, 37, 38, 39, 40, 65, 68, 83, 87].indexOf(keyEvent.keyCode) != 1) {
      keyEvent.preventDefault();
    }
  };

  // Gets mouse position
  this.mouseListener = function(mouseEvent) {
    this.mouseX = mouseEvent.clientX;
    this.mouseY = mouseEvent.clientY;
  };
}
