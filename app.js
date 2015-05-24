// Typical express deps
var express = require('express');
var socket_io = require('socket.io');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var csrf = require('csurf');
var nodemailer = require('nodemailer');
var crypto = require('crypto');

//express
var app = express();

// security stuff
app.disable('x-powered-by');

// pull in our configuration for mongoose
var configDB = require('./config/database.js');
mongoose.connect(configDB.url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log('Connected to DB');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Passport deps
var passport = require('passport');
var passportSocketIo = require('passport.socketio'); // hopefully this secures socket traffic, piggybacking on passport's user object

// pull in out passport configuration
require('./config/passport')(passport);
var sessionStore = new MongoStore({ mongooseConnection: mongoose.connection });

// initialize session and passport. keep in this order.
app.use(session({ 
  secret: 'd924nWRY324F$%g2D-[e1$3slSb4(fK`',
  key: 'sessionId',
  resave: true,
  saveUninitialized: true,
  store: sessionStore
}));
app.use(passport.initialize());
app.use(passport.session());

// methodOverride
app.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

// csurf
app.use(csrf());
app.use(function(req, res, next) {
  res.locals.csrftoken = req.csrfToken();
  next();
});
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

//socket.io
var io = socket_io();
app.io = io;

//config socket.io with passport.socketio auth info
io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  key: 'sessionId',
  secret: 'd924nWRY324F$%g2D-[e1$3slSb4(fK`',
  store: sessionStore,
  success: onAuthorizeSuccess,
  fail: onAuthorizeFail
}));

function onAuthorizeSuccess(data, accept){
  console.log('successful connection to socket.io');
  accept();
}

function onAuthorizeFail(data, message, error, accept){
  if(error)
    throw new Error(message);
  console.log('failed connection to socket.io:', message);

  // If you use socket.io@1.X the callback looks different
  // If you don't want to accept the connection
  if(error)
    accept(new Error(message));
  // this error will be sent to the user as a special error-package
  // see: http://socket.io/docs/client-api/#socket > error-object
}

// Chatroom tracking vars
var clients = {};
var rooms = {};
var currentRoom = {};

function getUsersInRoom(socket, room) {
  var res = [];
  for (var socketId in io.nsps['/'].adapter.rooms[room]) {
    res.push(clients[socketId].clientdata.name);
  }
  io.to(room).emit('user list', res);
  console.log(room + ' now contains: ' + res);
}

function joinRoom(socket, room) {
  var socketId = socket.id;
  socket.join(room);
  clients[socketId].clientdata.room.push(room);
  
  socket.broadcast.to(room).emit('join message', { 
    name: clients[socketId].clientdata.name, 
    room: room 
  });

  getUsersInRoom(socket, room);
}

function leaveRoom(socket, room) {
  socket.leave(room, function(){
      getUsersInRoom(socket, room);
  });
}

function addRoomToRoomList(socket, room) {
  if (!rooms[room]) {
    rooms[room] = [];
  }
}

io.on('connection', function(socket) {
  var socketId = socket.id;
  var clientdata = {
    name: socket.request.user.username,
    room: []
  }
  socket.clientdata = clientdata;

  if (!clients[socketId]) {
    clients[socketId] = {};
    clients[socketId]['clientdata'] = socket.clientdata;
  }
  
  console.log('user connected to socket: ' + clients[socketId].clientdata.name);

  joinRoom(socket, 'Lobby');
  addRoomToRoomList(socket, 'Lobby');

  socket.on('chat message', function(msg){
    io.emit('chat message', {message: msg, name: socket.clientdata.name});
  });

  socket.on('disconnect', function() {
    if (clients[socketId]) {
      var socketRooms = clients[socketId].clientdata.room;
      for (var room in socketRooms) {
        getUsersInRoom(socket, socketRooms[room]);
      }
      delete clients[socketId];
      
      console.log('Client disconnected: ' + socket.request.user.username);
    }
  });
});

// define routes
var routes = require('./routes/index')(express, passport);
var users = require('./routes/users')(express, passport);
var chat = require('./routes/chat')(express, passport);

app.use('/', routes);
app.use('/users', users);
app.use('/chat', chat);

app.get('/logout', function(req, res) {
  io.emit('user disconnected', {name: req.user.username});

  req.logout();
  res.redirect('/');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      title: {}
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
    title: {}
  });
});


module.exports = app;
