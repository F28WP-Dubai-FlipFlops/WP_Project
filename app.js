const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000;


// Serve html file when user first connects to server
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/src/game.html");
})

// Serve static files in the 'src' folder
app.use(express.static("${__dirname}/../src"));


let players = {};

// Handle server connections
io.on("connection", (socket) => {
  console.log("A new user has connected");

  socket.on("login", (username) => {
    handleLogin(socket, username);
  });

  socket.on("disconnect", () => {
    io.emit("playerDisconnected", socket.id);
    console.log("A user has disconnected");
  });
});


server.listen(port, () => {
  console.log("Server is listening on port " + port);
});


function handleLogin(socket, username) {
  const posX = Math.floor(Math.random() * 3000);
  const posY = Math.floor(Math.random() * 2000);  
    
  let state = {
    id: socket.id, 
    username: username, 
    x: posX, 
    y: posY, 
    angle: 0
  };

  players[socket.id] = state;

  socket.emit("loggedIn", state);
  socket.emit("connectedPlayers", players);
  socket.broadcast.emit("newPlayer", state);
}

