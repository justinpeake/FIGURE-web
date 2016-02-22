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

var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');

var routes = require('./routes/index.js');
var users = require('./routes/users.js');

var aws = require('aws-sdk');
var path = require('path');
var http = require('http');

var chalk = require('chalk'); 

app.io = io;  //second iteration

// if in development mode, load .env variables
//Declare .env variables AFTER THIS

if (app.get("env") === "development") {
    env(__dirname + '/.env');
}

// connect to database
app.db = mongoose.connect(process.env.MONGOLAB_URI);

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;

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


// cookie stuff 
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


app.use(express.static(path.join(__dirname, 'public')));

// our routes will be contained in routes/index.js
// var routes = require('./routes/index');

app.use('/', routes);


var UserID;

var Account = require('./models/account.js');

passport.use(new LocalStrategy(Account.authenticate()));

    passport.serializeUser(function(user, done) {

       done(null, user.id);

       UserID = user.id;

    });

    passport.deserializeUser(function(obj, done) {

       done(null, obj);

    });


//other shiz
// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });


//AWS S3 SHIZ

app.get('/compose', function(req, res) {
    res.render('compose.html', { user : req.user });
});



app.get('/sign_s3', function(req, res){

    console.log('hiiiiiiii');
  
    aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});

    var s3 = new aws.S3();
    var s3_params = {

        Bucket: S3_BUCKET,
        Key: req.query.file_name,
        Expires: 60,
        ContentType: req.query.file_type,
        ACL: 'public-read'
        
    };

    s3.getSignedUrl('putObject', s3_params, function(err, data){

        if(err){
            console.log(err);
        }
        else{
          
            var return_data = {

                signed_request: data,

                url: 'https://'+S3_BUCKET+'.s3.amazonaws.com/'+req.query.file_name

            };

            console.log('end server stack ' + return_data.url);

            res.write(JSON.stringify(return_data));

            res.end();

        }
    });
});


// app.post('/submit_form', function(req, res){
//     username = req.body.username;
//     full_name = req.body.full_name;
//     avatar_url = req.body.avatar_url;

//     // DEFINE THIS??
//     // update_account(username, full_name, avatar_url); 
//     // TODO: create this function
//     // TODO: Return something useful or redirect

// });


// END AWS S3 SHIZ

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


//DO NOT ERASE THIS
var performerCount = -1;

// start listen with socket.io

io.on('connection', function(socket){ //second iteration

  console.log(chalk.red(UserID) + ' connected');

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
             // console.log("Client has disconnected " + socket.id);


              console.log( chalk.red(UserID) + ' disconnected');

            });
});


module.exports = app;
