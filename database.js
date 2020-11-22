var mysql = require('mysql');

var con = mysql.createConnection ({
    host : 'localhost',
    username : 'root',
    password : ''
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected");
});