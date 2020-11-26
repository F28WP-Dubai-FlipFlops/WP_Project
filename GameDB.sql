
CREATE TABLE IF NOT EXISTS accounts (
    username VARCHAR(10) NOT NULL, 
    password VARCHAR(255) NOT NULL, 
    PRIMARY KEY (username)
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS leaderboard (
    username VARCHAR(10) NOT NULL, 
    highscore INT NOT NULL, 
    PRIMARY KEY (username), 
    FOREIGN KEY (username) REFERENCES accounts(username)
) ENGINE=INNODB:

INSERT INTO accounts VALUES("Varun2312", "vs55");
INSERT INTO accounts VALUES("Andrew3214", "ap124");
INSERT INTO accounts VALUES("Navin9011", "ns125");
INSERT INTO accounts VALUES("Gem7653", "gd55");
INSERT INTO accounts VALUES("test", "test");

INSERT INTO leaderboard VALUES("Varun2312", 200);
INSERT INTO leaderboard VALUES("Andrew3214", 500);
INSERT INTO leaderboard VALUES("Navin9011", 175);
INSERT INTO leaderboard VALUES("Gem7653", 900);
INSERT INTO leaderboard VALUES("test", 1200);
