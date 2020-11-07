// Class to handle camera movement
function Camera(cameraDiv, map, player) {
  this.camera = cameraDiv;
  this.width = this.camera.offsetWidth;
  this.height = this.camera.offsetHeight;
  this.map = map;
  this.player = player;

  this.position = {
    x: 0, 
    y: 0
  };

  // Calculates x coordinate of the camera (centred on player)
  this.getCamX = function() {
    return this.player.position.x + (this.player.width / 2) - (this.width / 2);
  };

  // Calculates y coordinate of the camera (centred on player)
  this.getCamY = function() {
    return this.player.position.y + (this.player.height / 2) - (this.height / 2);
  };
  
  // Moves the camera
  this.moveCamera = function() {
    // Get new camera position
    this.position.x = this.getCamX();
    this.position.y = this.getCamY();

    // The camera works off an illusion, it is simply a div that shows a 
    // part of the map at a time. The camera div is fixed in position and the 
    // map is shifted such that the player always remains at the centre of the 
    // camera div.
    // The map is shifted in the direction opposite to the player movement, 
    // hence the '-' before 'this.pos ...'
    map.style.transform = "translate(" + -this.position.x + "px, " 
                          + -this.position.y + "px)";
  };
}
