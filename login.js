var socket = io();

$('$register').submit(function(){
    socket.emit('player_details',$('#username').val(),$('#password').val());
})

// On sign up, user details are sent