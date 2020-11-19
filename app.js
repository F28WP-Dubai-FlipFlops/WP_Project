let express = require("express");
let app = express();

let http = require("http");
let server = http.createServer(app);

let io = require("socket.io")(server);


// Serve html file when user first connects to server
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/src/game.html");
})

// Serve static files in the 'src' folder
app.use(express.static('${__dirname}/../src'));


// Handle server connections
io.on("connection", (socket) => {
  console.log("A new user has connected");

  socket.on("disconnect", () => {
    console.log("A user has disconnected");
  })
})


server.listen(3090, () => {
  console.log("Server is listening on port 3090");
});
