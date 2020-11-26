// Controller class to hande player input
function Controller() {
  // Remember state of keys so holding down a key will repeat its function
  this.state = {
    up: false, 
    down: false,  
    left: false, 
    right: false,  
    shoot: false, 
    mouseX: 0, 
    mouseY: 0
  }

  // Updates key states
  this.keyListener = function(keyEvent) {
    let keyState = keyEvent.type === "keydown";
    
    switch (keyEvent.keyCode) {
      case 37:    // Left Arrow Key
      case 65:    // "A" Key
        this.state.left = keyState;
        break;

      case 38:    // Up Arrow Key
      case 87:    // "W" Key
        this.state.up = keyState;
        break;

      case 39:    // Right Arrow Key
      case 68:    // "D" Key
        this.state.right = keyState;
        break;

      case 40:    // Down Arrow Key
      case 83:    // "S" Key
        this.state.down = keyState;
        break;

      case 32:    // Spacebar
        this.state.shoot = keyState;
        break;
    }

    // Prevent default operations of control keys (page scrolling etc.)
    if([32, 37, 38, 39, 40, 65, 68, 83, 87].indexOf(keyEvent.keyCode) != 1) {
      keyEvent.preventDefault();
    }
  };

  // Gets mouse position relative to the map
  this.mouseListener = function(mouseEvent, camX, camY) {
    this.state.mouseX = mouseEvent.clientX + camX;
    this.state.mouseY = mouseEvent.clientY + camY;
  };
}
