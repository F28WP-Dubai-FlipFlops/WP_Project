const express = require("express");
const app = express();
const session = require("express-session");
const mysql = require("mysql");
const SQL = require("sql-template-strings");
const bodyParser = require("body-parser"); 
const bcrypt = require("bcrypt");
const saltRounds = 10;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/login-page.html");
});

app.get("/play", (req, res) => {
    res.sendFile(__dirname + "/leaderboard.html");
})

app.use(session({
    secret: "secret", 
    resave: false, 
    saveUninitialized: false
}));

app.listen(3000);


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
                    req.session.loggedIn = true;
                    req.session.username = username;
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
                
                console.log("New accound created");
                // Redirect to game page
                req.session.loggedIn = true;
                req.session.username = username;
                res.redirect("/play");
            });
        }
    });
});
