
var express = require('express');
var path = require('path'); 
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser'); 
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var env = require('node-env-file');
var socket_io = require('socket.io');  
var app = express();  
var io = socket_io();   



//added 6/7/16

if (process.env.REDISTOGO_URL) {
  var rtg = require('url').parse(process.env.REDISTOGO_URL);
  var redis = require('redis').createClient(rtg.port, rtg.hostname);

  redis.auth(rtg.auth.spli(':')[1]);

} else {
var redis = require("redis").createClient();
}

var passport = require('passport');

var session = require('express-session')

var RedisStore = require('connect-redis')(session);

var socketioRedis = require("passport-socketio-redis");

var sessionStore = new RedisStore({ host: rtg, port: redis, client: redis});

var passportSocketIo = require("passport.socketio");

//


var aws = require('aws-sdk'); 
var router = express.Router(); 
var LocalStrategy = require('passport-local').Strategy;
var routes = require('./routes/index.js');
var users = require('./routes/users.js');

var path = require('path');
var http = require('http');  
var chalk = require('chalk'); 

//var userID;
 
var performerCount = 0;

app.io = io;  //second iteration


// newly added heroku redis stuff


// cookie stuff 
app.use(session({
    key: 'express.sid',
    store: sessionStore,
    secret: 'keyboard horse',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//added 6/7/16
    io.use(socketioRedis.authorize({
      passport:passport,
      cookieParser: cookieParser,       // the same middleware you register in express
      key:          'express.sid',       // the name of the cookie where express/connect stores its session_id
      secret:       'keyboard horse',    // the session_secret to parse the cookie
      store:        sessionStore,        // we NEED to use a sessionstore. no memorystore please
      success:      onAuthorizeSuccess,  // *optional* callback on success - read more below
       fail:         onAuthorizeFail,     // *optional* callback on fail/error - read more below
    }));
//


function onAuthorizeSuccess(data, accept)
{
    console.log('Authorized success');
    accept();    
}
 
function onAuthorizeFail(data, message, error, accept)
{
    if(error)
        accept(new Error(message));
}
 
// if in development mode, load .env variables
// !!!! Declare .env variables AFTER THIS

if (app.get("env") === "development") {
    env(__dirname + '/.env');
}

// connect to database
app.db = mongoose.connect(process.env.MONGOLAB_URI);

var S3_BUCKET = process.env.S3_BUCKET;

// fixes clock skew issues
aws.config.update({correctClockSkew: true});    

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
// var routes = require('./routes/index');

app.use('/', routes);

var Account = require('./models/account.js');

console.log(process.env.RUNNING);  // hello world


  // maybe need to send some of these through client to avoid global

  passport.use(new LocalStrategy(Account.authenticate()));

      passport.serializeUser(function(user, done) {

         done(null, user.username);   // this affects what shows up in socket.request.user
        
         // userID = req.user.username;
         

      });

      passport.deserializeUser(function(id, done) {
        
         done(null, id);

      });

app.post('/login', passport.authenticate('local', {session:true}), function(req, res) {

       console.log(chalk.white(req.user.username) + " logged in");

      res.render("dashboard.html", {
          user: req.user.username, 
          images: imageArray, 
          videos: videoArray, 
          audio: audioArray, 
          audionames: audioNames,
          length: folderLength,
          pcount: performerCount
          });
      });

app.get('/dashboard', function(req,res){

        if(req.user) {
        res.render('dashboard.html', {user: req.user.username});     
        page = 'dashboard';   
        }else{        
        res.render('index.html')       
        }
   });

app.get('/conductor', function(req,res){

  console.log(req.user);

        if(req.user) {
        res.render('conductor.html', {
          
          user: req.user, 
          images: imageArray, 
          videos: videoArray, 
          audio: audioArray, 
          audionames: audioNames,
          length: folderLength,
          pcount: performerCount

        });     

        page = 'conductor';   
        }else{        
        res.render('index.html')       
        }
   });



// >>>>>>>>>>>>>>>>>>>>>>> AWS S3 SHIZ

        app.get('/sign_s3', function(req, res){

            console.log('hiiiiiiii');
            // this is against AWS recommendation

            aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
            var s3 = new aws.S3();

            // name the new AWS folder
            var folder = userID + "/";  // changed from userName

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

    io.on('connection', function(socket){ 

                  var userID = socket.request.user;

                  console.log(chalk.red(userID) + ' connected to ' + page);

                  console.log(chalk.red(socket.request.user) + ' HAS ARRIVED @ ' + page);

                 
if ( socket.request.user.logged_in == true){
console.log(TRUE);
};

               
      
            // When this user emits, client side: socket.emit('otherevent',some data);

            socket.on('gimme', function(err){  // added "user to function argument"

              //polling aws based on user and listing assets

            //  aws.config.update({accessKeyId: 'AKIAIUWEBSZCZK4Y6HFQ', secretAccessKey: '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'});

             
              var s3 = new aws.S3();
              // name the new AWS folder
              var folder = userID + "/";

              console.log(folder);
              var s3_params = {
                  Bucket: 'justinpeakefigures',  

                  Key: folder, 

                  Expires: 60,
                  ACL: 'public-read'  
              };

              s3.listObjects({Bucket: S3_BUCKET, Delimiter: '/', Prefix: folder}, function(err, data){

                  // console.log(err);
                  // console.log(data.Contents);

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

              });  // end of 'gimme' 


            socket.on('sendingTo', function(data) {
              console.log("Received: 'sendingTo' " + data);
              socket.broadcast.emit('sendingTo', data);
            });         

            socket.on('sendingAll', function(data) {
              console.log("Received: 'sendingAll' " + data);
              socket.broadcast.emit('sendingAll', data);
            });

            socket.on('toGroup', function(data) {
              console.log("Received: 'toGroup' " + data);
              socket.broadcast.emit('toGroup', data);
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

            socket.on('perfCount', function(data) {
              performerCount = data;
              socket.broadcast.emit('perfCount', data);                   
              console.log('perfCount = ' + performerCount);            
            });


            socket.on('gimmePerfCount', function(data) {
              socket.emit('givenPerfCount', performerCount);                   
              console.log('gimmePerfCount = ' + performerCount);            
            });

            socket.on('disconnect', function() {
                      
              console.log( chalk.red(userID) + ' disconnected from ' + page);
             
            });


        });


module.exports = app;
