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
var csrf = require('csurf');
var nodemailer = require('nodemailer');
var crypto = require('crypto');

//express
var app = express();

//socket.io
var io = socket_io();
app.io = io;

io.on('connection', function(socket) {
  console.log('user connected to socket');
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
});


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

// pull in out passport configuration
require('./config/passport')(passport);

// initialize session and passport. keep in this order.
app.use(session({ 
  secret: 'd924nWRY324F$%g2D-[e1$3slSb4(fK`',
  key: 'sessionId',
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(csrf());
app.use(function(req, res, next) {
  res.locals.csrftoken = req.csrfToken();
  next();
});
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

var routes = require('./routes/index');
var users = require('./routes/users');
var chat = require('./routes/chat');

app.use('/', routes);
app.use('/users', users);
app.use('/chat', chat);

// io.on('connection', function(socket) {
//   console.log('a user connected');
// });

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
