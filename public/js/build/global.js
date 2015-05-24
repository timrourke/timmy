WebFontConfig = {
    google: { families: [ 'Roboto:400,300,300italic,400italic,700,700italic,900,900italic:latin' ] }
  };
  (function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
  })(); 
// "use strict";

var socket = io(window.location.host);

$('#chatForm').submit(function() {
  if ( $('#m').val() ) {
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
  }
	return false;
});

socket.on('connect', function() {

});

function appendMessage(item) {
  $('#messages').append(item);
  $('.right').animate({
    scrollTop: $('.right').height()
  }, 'slow');
  return false;
}

socket.on('join message', function(msg) {
  var item = $('<li class="chatMessage">').html('<span class="systemMessage"><em>' + msg.name + ' has joined ' + msg.room + '</span>');
  appendMessage(item);
});

socket.on('chat message', function(msg) {
  var item = $('<li class="chatMessage">').html('<span class="chatUser">' + msg.name + ':</span>' + msg.message);
  appendMessage(item);
});

socket.on('user connected', function(msg) {
  var item = $('<li class="chatMessage">').html('<span class="systemMessage"><em>User connected: </em>' + msg.name + '</span>');
  appendMessage(item);
});

socket.on('user disconnected', function(msg) {
  var item = $('<li class="chatMessage">').html('<span class="systemMessage"><em>User disconnected: </em>' + msg.name + '</span>');
  appendMessage(item);
});

socket.on('user list', function(users) {
  console.log(users);
  $('#users').html('');
  for (var user in users) {
    $('#users').append($('<li>').text(users[user]));
  }
});

