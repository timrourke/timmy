// "use strict";

var socket = io(window.location.host);
$('#chatForm').submit(function() {
	socket.emit('chat message', $('#m').val());
	$('#m').val('');
	return false;
});
socket.on('connect', function() {

});

socket.on('join message', function(msg) {
  $('#messages').append($('<li class="chatMessage">').html('<span class="systemMessage"><em>' + msg.name + ' has joined ' + msg.room + '</span>'));
});

socket.on('chat message', function(msg) {
	$('#messages').append($('<li class="chatMessage">').html('<span class="chatUser">' + msg.name + ':</span>' + msg.message));
});

socket.on('user connected', function(msg) {
  $('#messages').append($('<li class="chatMessage">').html('<span class="systemMessage"><em>User connected: </em>' + msg.name + '</span>'));
});

socket.on('user disconnected', function(msg) {
  $('#messages').append($('<li class="chatMessage">').html('<span class="systemMessage"><em>User disconnected: </em>' + msg.name + '</span>'));
});

socket.on('user list', function(users) {
  console.log(users);
  $('#users').html('');
  for (var user in users) {
    $('#users').append($('<li>').text(users[user]));
  }
});