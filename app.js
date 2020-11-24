// Constants for importing libraries and setting up server and sockets
const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000;


// Serve static files in the 'src' folder
app.use(express.static("src"));

// Serve html file when user first connects to server
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/src/game.html"));
});


server.listen(port, () => {
  console.log("Server is listening on port " + port);
});


// Object to hold all player states
let players = {};

// Handle server connections
io.on("connection", (socket) => {
  const id = socket.id;
  console.log("A new user has connected (" + id + ")");

  // If a new player joins the game
  socket.on("playerJoin", (username) => {
    handlePlayerJoin(username, socket);
  });

  // If a player sends their state, update the players object
  socket.on("playerInput", (playerState) => {
    players[socket.id] = playerState;
  });

  // If a laser is shot, emit the state of the laser to all other players
  socket.on("shotLaser", (laserState) => {
    socket.broadcast.emit("newLaser", laserState);
  });

  // If a player is hit
  socket.on("playerHit", (playerId, laserId) => {
    handlePlayerHit(playerId, laserId, socket);
  });

  // If a player disconnects
  socket.on("disconnect", () => {
    console.log("A user has disconnected (" + id + ")");
    delete players[id];
  });
});


// Handles the playerJoin event
function handlePlayerJoin(username, socket) {
  // Calculate a random position for the player
  const posX = Math.floor(Math.random() * 2800) + 100;
  const posY = Math.floor(Math.random() * 1800) + 100;  
    
  const state = {
    id: socket.id, 
    username: username, 
    pos: {x: posX, y: posY}, 
    vel: {x: 0, y: 0},
    aimAngle: 0,
    canShoot: true,  
    hp: 100
  };

  // Set the player state and emit state to all players
  players[socket.id] = state;
  socket.emit("clientState", state);
  socket.broadcast.emit("playerStates", players);

  // If this is the first player in the game, start interval to emit states
  if (Object.keys(players).length === 1) {
    sendStates();
  }
}

// Emits all player states every 100ms
function sendStates() {
  const emitInterval = setInterval(() => {
    io.emit("playerStates", players);
  }, 100);

  // If there are no players left in the game, stop emitting
  if (Object.keys(players).length === 0) {
    clearInterval(emitInterval);
  }
}

// Handles playerHit event
function handlePlayerHit(playerId, laserId, socket) {
  // Apply damage to player in all local states
  io.emit("takeDamage", playerId, laserId);

  // If a player has 0 health
  if (players[playerId].hp <= 0) {
    socket.broadcast.emit("playerDead", playerId);
    delete players[playerId];
  }
}
