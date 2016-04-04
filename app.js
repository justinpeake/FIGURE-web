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

var performerCount = 0;
// var perfs = [];

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




// start listen with socket.io

    io.on('connection', function(socket){ //second iteration

      console.log(chalk.red(userName) + ' connected to ' + page);

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
                  imageArray = [];
                  videoArray = [];

                  audioArray = [];
                  audioNames = [];
                  
                  // filling fileArray[] with all the URL's from amazon
                  for (i = 0; i < folderLength; i++){
                     fileArray[i] = 'https://' + S3_BUCKET + '.s3.amazonaws.com/' + data.Contents[i].Key;
                     };

                    /*  
                        1) this is splitting the urls > 
                        2) looking at the last array element (which is 'most likely' the file extension)
                            ^ this could ultimately be buggy if the naming conventions change
                        3) checking to see whether the file extension matches any of the strings
                        4) putting them into appropriate 'file type' arrays to be sent to client w/ handlebars
                    */

                    for (i = 0; i < folderLength; i++){
                      if (fileArray[i].split(".")[4] == 'jpg'){
                        imageArray.push(fileArray[i]);  
                      } else if (fileArray[i].split(".")[4] == 'png'){
                        imageArray.push(fileArray[i]);    
                      }  else if (fileArray[i].split(".")[4] == 'mov'){
                        videoArray.push(fileArray[i]); 
                      } else if (fileArray[i].split(".")[4] == 'wav'){
                        audioArray.push(fileArray[i]);

                        //splitting url to extract the name of the file  
                        audioNames.push(fileArray[i].split("/")[4].split(".")[0]);
                      } else if (fileArray[i].split(".")[4] == 'mp3'){
                        audioArray.push(fileArray[i]);
                        audioNames.push(fileArray[i].split("/")[4].split(".")[0]);
                      }                 
                      
                    };  // end of file for loop

   //////////////// these are the arrays being served to client ////////////////    

                    console.log('IMAGES: ' + imageArray.length);
                    console.log(imageArray);

                    console.log('VIDEOS: ' + videoArray.length);
                    console.log(videoArray);

                    console.log('AUDIO: ' + audioArray.length);
                    console.log(audioArray);

                  });  // end of list objects         
              });  // end of 'gimme' function


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

            socket.on('switch', function(data) {
              console.log("Received: switch " + data);
              socket.broadcast.emit('switch', data);
            });

            socket.on('waveSketch', function(data) {
              console.log("Received: waveSketch " + data);
              socket.broadcast.emit('waveSketch', data);
            });

            // socket.on('perfAdd', function(data) {
            //   console.log("Received: new performer " + userName);              
            //   performerCount = performerCount + 1; 
            //   console.log('perfCount = ' + performerCount);            
            // });

            // socket.on('perfSub', function(data) {
            //   console.log("Received: new performer " + userName);     
            //   performerCount = performerCount - 1;              

            //   console.log( chalk.red(userName) + ' disconnected from ' + page);
            //   console.log('perfCount = ' + performerCount);
            // });

            socket.on('disconnect', function() {
              // if (page =='performer'){
              // performerCount = performerCount - 1;
            // }              
              console.log( chalk.red(userName) + ' disconnected from ' + page);
              // console.log('perfCount = ' + performerCount);
            });


        });


module.exports = app;
