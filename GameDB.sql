create database GAME;
use GAME;
create table leaderboard (name varchar(20),username varchar(20),score int);
create table login (username varchar(10),password varchar(20));
show tables;

alter table leaderboard add primary key(username);
alter table login add primary key (username);
alter table leaderboard add foreign key(username) references login(username);

insert into login values ("Varun2312","vs55");
insert into login values ("Andrew3214","ap124");
insert into login values ("Navin9011","ns125");
insert into login values ("Gem7653","gd55");

insert into leaderboard values ("Varun","Varun2312",200);
insert into leaderboard values ("Andrew","Andrew3214",500);
insert into leaderboard values ("Navin","Navin9011", 175);
insert into leaderboard values ("Gem","Gem7653",900);

select * from leaderboard;
