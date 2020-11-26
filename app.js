// Constants for importing libraries and setting up server, database and sockets

// Express server
const express = require("express");
const app = express();
const path = require("path");

// Socket.io
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000;

// Database
const mysql = require("mysql");
const SQL = require("sql-template-strings");
const bodyParser = require("body-parser"); 

// Password hashing
const bcrypt = require("bcrypt");
const saltRounds = 10;


// Serve static files
app.use(express.static(__dirname + "/client"));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/client/views/index.html"));
});

app.get("/play", (req, res) => {
  res.sendFile(path.join(__dirname, "/client/views/game.html"));
});


server.listen(port, () => {
  console.log("Server is listening on port " + port);
});



//Creating a database connection
const con = mysql.createConnection ({
  host : 'sql12.freemysqlhosting.net',
  user : 'sql12378281',
  password : '7nS8iX9Bav',
  database : 'sql12378281'
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Database connected");
});

// Body parser to read data from forms
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


// Login/Register
// References: 
// [1] https://codeshack.io/basic-login-system-nodejs-express-mysql/
// [2] https://medium.com/technoetics/handling-user-login-and-registration-using-nodejs-and-mysql-81b146e37419
app.post('/login', function(req, res){
  let username = req.body.username;
  const password = req.body.password;

  // Remove special characters from username
  invalidChars = ";!#$%^&*()@={}<>:";
  for (let i = 0; i < invalidChars.length; i++) {
    username = username.replace(invalidChars[i] + "", "");
  }

  // Check if account exists
  const usernameExists = (SQL `SELECT username from accounts WHERE username=${username};`);
  con.query(usernameExists, async function(err, result){
    if (err) throw err;

    // If the account already exists, check password and login
    if (result.length) {
      // Get the stored password for the account
      const getPassword = (SQL `SELECT * from accounts WHERE username=${username};`);
      
      con.query(getPassword, async function(err, result){
        if (err) throw err;
          
        // Compare password hashes
        const comparePasswords = await bcrypt.compare(password, result[0].password);

        // If password was correct
        if (comparePasswords) {
          console.log("Logged in");
          res.redirect("/play");
        }
        // Reload the page if the password was incorrect
        else {
          console.log("Wrong password");
          res.redirect("/");
        }
      });
    }

    // If the account does not exist, create a new account
    else {
      // Hash password
      const encryptedPassword = await bcrypt.hash(password, saltRounds);

      //A new user is added to the table
      const newUser = (SQL `INSERT INTO accounts VALUES(${username}, ${encryptedPassword});`);
      con.query(newUser, function (err, result) {
        if (err) throw err;

        // Insert initial score in leaderboard table
        const setInitialScore = (SQL `INSERT INTO leaderboard VALUES(${username}, 0);`);
        con.query(setInitialScore, function(err, result) {
            if (err) throw err;
        });
        
        console.log("New account created");
        // Redirect to game page
        res.redirect("/play");
      });
    }
  });
});


app.post("/loadScores", function(req, res) {
  const getScores = (SQL `SELECT * FROM leaderboard ORDER BY highscore DESC LIMIT 5;`);
  con.query(getScores, function(err, result) {
    if (err) throw err;
    res.send(result);
  })
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
    hp: 100, 
    points: 0
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
  }, 1000 / 30);

  // If there are no players left in the game, stop emitting
  if (Object.keys(players).length === 0) {
    clearInterval(emitInterval);
  }
}

// Handles playerHit event
function handlePlayerHit(playerId, laserId, socket) {
  players[playerId].hp -= 5;
  
  // Apply damage to player in all local states
  io.emit("applyDamage", playerId, laserId);
  players[socket.id].points += 5;

  
  // If the hurt player is dead now
  if (players[playerId].hp <= 0) {
    io.to(playerId).emit("gameOver");
    setHighScore(playerId);

    players[socket.id].points += 250;
  }

  // Update client's points
  socket.emit("pointsUpdate", players[socket.id].points);
  // Update player states
  io.emit("playerStates", players);
}

// Updates highscore of player if it is higher than last highscore
function setHighScore(playerId) {
  // Get current highscore
  const getScore = (SQL `SELECT * FROM leaderboard WHERE username=${players[playerId].username};`);
  con.query(getScore, function(err, result) {
    if (!err) {
      // If the current score is greater than the highscore, set it as the new highscore
      if (players[playerId].score > result[0].highscore) {
        const setScore = (SQL `UPDATE leaderboard 
                           SET highscore=${players[playerId].score} 
                           WHERE username=${players[playerId].username};`);
        con.query(setScore, function(err, result) {});
      }
    }
  });

  delete players[playerId];
}
