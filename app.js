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

var router = express.Router(); 
var passport = require('passport');


var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');

var routes = require('./routes/index.js');
var users = require('./routes/users.js');

var aws = require('aws-sdk'); 
var path = require('path');
var http = require('http'); 
var chalk = require('chalk'); 
var userID;

app.io = io;  //second iteration
 
// if in development mode, load .env variables

// !!!! Declare .env variables AFTER THIS

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

var Account = require('./models/account.js');

passport.use(new LocalStrategy(Account.authenticate()));
    passport.serializeUser(function(user, done) {
       done(null, user.id);
       userID = user.id;
    });
    passport.deserializeUser(function(obj, done) {
       done(null, obj);
    });


// >>>>>>>>>>>>>>>>>>>>>>> AWS S3 SHIZ

        app.get('/sign_s3', function(req, res){

            console.log('hiiiiiiii');
            // this is against AWS recommendation

            aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
            var s3 = new aws.S3();

            // name the new AWS folder
            var folder = userName + "/";

            var s3_params = {
                Bucket: S3_BUCKET,
                Key: folder + req.query.file_name, 
                Expires: 60,
                ContentType: req.query.file_type,
                ACL: 'public-read' 
            };

            // if someone is signed in, then make folder with their name, 
            // otherwise, place in public folder
            
            s3.getSignedUrl('putObject', s3_params, function(err, data){
                if(err){
                    console.log(err);            
               }
                else {
                    var return_data = {
                        signed_request: data,
                        url: 'https://'+S3_BUCKET+'.s3.amazonaws.com/'+ folder + req.query.file_name
                    };

                  //  console.log("string" + JSON.stringify(return_data));

                    res.write(JSON.stringify(return_data));
                    res.end();
                }
            });

              //polling aws based on user and listing assets
             
             s3.listObjects({Bucket: S3_BUCKET, Delimiter: '/', Prefix: folder}, function(err, data){
              var folderLength = data.Contents.length;
              
                for (i = 0; i < folderLength; i++){
                  fileArray[i] = 'https://' + S3_BUCKET + '.s3.amazonaws.com/' + data.Contents[i].Key;
                };

               //   console.log(fileArray);

              });

            });

// >>>>>>>>>>>>>>>>>>>>>>> END AWS S3 SHIZ


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
var performerCount = 0;

// start listen with socket.io

    io.on('connection', function(socket){ //second iteration

      console.log(chalk.red(userName) + ' connected to ' + page);

              socket.on('perfAdd', function(data) {
              performerCount = performerCount + 1;
              // socket.broadcast.emit('performerCount', performerCount);
              });

              // if(page == 'performer'){
              // performerCount = performerCount + 1;
              // };

          
            // When this user emits, client side: socket.emit('otherevent',some data);


            socket.on('gimme', function(){

              //polling aws based on user and listing assets

              aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
              var s3 = new aws.S3();
              // name the new AWS folder
              var folder = userName + "/";
              var s3_params = {
                  Bucket: S3_BUCKET,  

                  Key: folder, //+ req.query.file_name,   

                  Expires: 60,
                  ACL: 'public-read' 
              };

              s3.listObjects({Bucket: S3_BUCKET, Delimiter: '/', Prefix: folder}, function(err, data){

                  var folderLength = data.Contents.length;

                  fileArray = [];
  
                  for (i = 0; i < folderLength; i++){
                     fileArray[i] = 'https://' + S3_BUCKET + '.s3.amazonaws.com/' + data.Contents[i].Key;
                      //console.log(fileArray[i].split("."));
                   };
                      console.log(folderLength);  //use this in html button rendering
                      console.log(fileArray);
                  });
              });


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

            socket.on('sketchFigure', function(data) {
              console.log("Received: 'sketch' " + data);
              socket.broadcast.emit('sketchFigure', data);
            });

            socket.on('disconnect', function() {
              if (page =='performer'){
              performerCount = performerCount - 1;
              // socket.broadcast.emit('performerCount', performerCount);   
            }              
              console.log( chalk.red(userName) + ' disconnected from ' + page);
              console.log('performerCount = ' + performerCount);

            });
        });


module.exports = app;
