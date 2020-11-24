create database GAME;
use GAME;
create table leaderboard (name varchar(20),score int);
create table login (username varchar(10),password varchar(20));
show tables;

insert into login values ("Varun2312","vs55");
insert into login values ("Andrew3214","ap124");
insert into login values ("Navin9011","ns125");
insert into login values ("Gem7653","gd55");

insert into leaderboard values ("Varun",200);
insert into leaderboard values ("Andrew",500);
insert into leaderboard values ("Navin", 175);
insert into leaderboard values ("Gem",900);
