var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var env = require('node-env-file');
var socket_io = require('socket.io');   // second iteracton socket try
var app = express();  // first iteration socket try
var io = socket_io();   // second iteration

app.io = io;  //second iteration

// PASSPORT SHIT

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

app.configure(function() {
  app.use(express.static('public'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// END PASSPORT SHIT


// if in development mode, load .env variables
if (app.get("env") === "development") {
    env(__dirname + '/.env');
}

// connect to database
app.db = mongoose.connect(process.env.MONGOLAB_URI);

// view engine setup - this app uses Hogan-Express
// https://github.com/vol4ok/hogan-express
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set('layout','layout');
app.engine('html', require('hogan-express'));;

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// our routes will be contained in routes/index.js
var routes = require('./routes/index');
app.use('/', routes);

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
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});


      var performerCount = - 1;  // instantiate performer count

// start listen with socket.io
// app.io.on('connection', function(socket){  // first iteration

io.on('connection', function(socket){ //second iteration
  console.log('a user connected');

  performerCount = performerCount + 1;


    socket.broadcast.emit('performerCount', performerCount);

    // When this user emits, client side: socket.emit('otherevent',some data);
 

            socket.on('sendingTo', function(data) {
              console.log("Received: 'sendingTo' " + data);
              socket.broadcast.emit('sendingTo', data);
            });         

            socket.on('sendingAll', function(data) {
              console.log("Received: 'sendingAll' " + data);
              socket.broadcast.emit('sendingAll', data);
            });

              socket.on('videoFigure', function(data) {
              console.log("Received: 'videoFigure' " + data);
              socket.broadcast.emit('videoFigure', data);
            });

            socket.on('imageFigure', function(data) {
              console.log("Received: 'imageFigure' " + data);
              socket.broadcast.emit('imageFigure', data);
            });
  
            socket.on('disconnect', function() {
              performerCount = performerCount - 1;
              socket.broadcast.emit('performerCount', performerCount);
              console.log("Client has disconnected " + socket.id);
            });
});


module.exports = app;
