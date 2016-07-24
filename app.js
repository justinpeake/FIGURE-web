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

    if (process.env.REDISTOGO_URL) {
      var rtg = require('url').parse(process.env.REDISTOGO_URL);
      var redis = require('redis').createClient(rtg.port, rtg.hostname);

    redis.auth(rtg.auth.split(':')[1]);
    } else {
    var redis = require("redis").createClient();
    };

var passport = require('passport');
var session = require('express-session')
var RedisStore = require('connect-redis')(session);
var socketioRedis = require("passport-socketio-redis");
var sessionStore = new RedisStore({ host: rtg, port: redis, client: redis});
var passportSocketIo = require("passport.socketio");
var aws = require('aws-sdk'); 
var router = express.Router(); 
var LocalStrategy = require('passport-local').Strategy;
var routes = require('./routes/index.js');
var users = require('./routes/users.js');
var path = require('path');
var http = require('http');  
var chalk = require('chalk'); 
var Account = require('./models/account.js');

var performerCount = 0;

app.io = io;  //second iteration

// if in development mode, load .env variables
// !!!! Declare .env variables AFTER THIS
if (app.get("env") === "development") {
    env(__dirname + '/.env');
}

var S3_BUCKET = process.env.S3_BUCKET;



// Passport, Session, Redis, Cookie stuff --------------

      app.use(session({
          key: 'express.sid',
          store: sessionStore,
          secret: 'keyboard horse',
          resave: false,
          saveUninitialized: false
      }));
      app.use(passport.initialize());
      app.use(passport.session());
      io.use(socketioRedis.authorize({
          passport:passport,
          cookieParser: cookieParser,        // the same middleware you register in express
          key:          'express.sid',       // the name of the cookie where express/connect stores its session_id
          secret:       'keyboard horse',    // the session_secret to parse the cookie
          store:        sessionStore,        // we NEED to use a sessionstore. no memorystore please
          success:      onAuthorizeSuccess,  // *optional* callback on success - read more below
          fail:         onAuthorizeFail,    // *optional* callback on fail/error - read more below
      }));

  function onAuthorizeSuccess(data, accept) {
    console.log('Authorized success');
    accept();    
  }
 
  function onAuthorizeFail(data, message, error, accept){
    if(error)
        accept(new Error(message));
  }

//------------------------------------------------------
 
// connect to mLab database-----------------------------

app.db = mongoose.connect(process.env.MONGOLAB_URI);

//------------------------------------------------------

// mlab API query stuff --------------------------------
// 'mongolab-data-api' has it's own requirements for query

var MLABDB = process.env.MLABDB;  // keep this secure in .env
var MLABKEY = process.env.MLABKEY;  // keep this secure in .env
var mLab = require('mongolab-data-api')(MLABKEY);

var options = {
  database: MLABDB,
  collectionName: 'accounts',
  setOfFields: '{"salt": 0, "hash":0, "_id":0, "__v":0}'  //"0" means "false" or " "dont return those"
};

mLab.listDocuments(options, function (err, data) {
  for(i = 0; i < data.length; i++){
  console.log(data[i].username); // strips username from JSON
}
}); 

//-------------------------------------------------------


// fixes clock skew issues with AWS-SDK ----------- 6/17/16

aws.config.update({correctClockSkew: true});    

//-------------------------------------------------------


// this app uses Hogan-Express
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
app.use('/', routes);

// var Account = require('./models/account.js');

console.log(process.env.RUNNING);  // hello world


// Passport Auth ----------------------------------------

  passport.use(new LocalStrategy(Account.authenticate()));

      passport.serializeUser(function(user, done) {
         done(null, user.username);   // this affects what shows up in socket.request.user
      });

      passport.deserializeUser(function(id, done) {        
         done(null, id);
      });

//--------------------------------------------------------

// Page Rendering ----------------------------------------

          app.post('/login', passport.authenticate('local', {session:true}), function(req, res) {

            var s3 = new aws.S3();            
            var folder = req.user + "/";
            var s3_params = {
                Bucket: S3_BUCKET,  
                Key: folder, 
                Expires: 60,
                ACL: 'public-read'  
            };
            var folderLength;
            var fileArray = [];
            var imageArray = [];
            var videoArray = [];
            var audioArray = [];
            var audioNames = [];


          s3.listObjects({Bucket: S3_BUCKET, Delimiter: '/', Prefix: folder}, function(err, data){

                  var folderLength = data.Contents.length;
                  
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

                    console.log('IMAGES: ' + imageArray.length);                    
                    console.log('VIDEOS: ' + videoArray.length);                    
                    console.log('AUDIO: ' + audioArray.length);
                  
                  });
                 
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

// Render Dashboard Page --------------------------------------

          app.get('/dashboard', function(req,res){
                  if(req.user) {

                    var s3 = new aws.S3();            
            var folder = req.user + "/";
            var s3_params = {
                Bucket: S3_BUCKET,  
                Key: folder, 
                Expires: 60,
                ACL: 'public-read'  
            };
            var folderLength;
            var fileArray = [];
            var imageArray = [];
            var videoArray = [];
            var audioArray = [];
            var audioNames = [];


          s3.listObjects({Bucket: S3_BUCKET, Delimiter: '/', Prefix: folder}, function(err, data){

                  var folderLength = data.Contents.length;
                  
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

                    console.log('IMAGES: ' + imageArray.length);                    
                    console.log('VIDEOS: ' + videoArray.length);                    
                    console.log('AUDIO: ' + audioArray.length);
                  
                  });

                res.render('dashboard.html', {
                    user: req.user, 
                    images: imageArray, 
                    videos: videoArray, 
                    audio: audioArray, 
                    audionames: audioNames,
                    length: folderLength,
                    pcount: performerCount
                  });     
                  page = 'dashboard';   
                  }else{        
                  res.render('index.html')       
                  }
             });


// Render Performer Page ----------------------------------------

          app.get('/performer', function(req,res){

                //uncommenting this will make performer page avail only to auth'd users

                // if(req.user) {   
                //   res.render('performer.html', {user: userName});  
                //   page = 'performer';        
                //   }else{        
                //   res.render('index.html')        
                //   }

                res.render('performer.html');
                page = 'performer';
            });


// Render Conductor Page ----------------------------------------

          app.get('/conductor', function(req,res){
        
              if(req.user) {

                  var s3 = new aws.S3();            
                  var folder = req.user + "/";
              
                  var s3_params = {
                      Bucket: S3_BUCKET,  
                      Key: folder, 
                      Expires: 60,
                      ACL: 'public-read'  
                  };
                  var folderLength;
                  var fileArray = [];
                  var imageArray = [];
                  var videoArray = [];
                  var audioArray = [];
                  var audioNames = [];

          s3.listObjects({Bucket: S3_BUCKET, Delimiter: '/', Prefix: folder}, function(err, data){

              var folderLength = data.Contents.length;
              
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
                  
                };   // end of file for loop

                console.log('IMAGES: ' + imageArray.length);            
                console.log('VIDEOS: ' + videoArray.length);
                console.log('AUDIO: ' + audioArray.length);
                                 
                     // end of list objects    

          res.render('conductor.html', {
                    user: req.user, // staying still
                    images: imageArray, 
                    videos: videoArray, 
                    audio: audioArray, 
                    audionames: audioNames,
                    length: folderLength,
                    pcount: performerCount
                  });   

                  page = 'conductor';  

             });

                  }else{        
                  res.render('index.html')       
                  }
             });

// Render Compose Page ----------------------------------------

          app.get('/compose', function(req, res) {
              
                       
                if(req.user) {

                      var s3 = new aws.S3();            
                      var folder = req.user + "/";
                     // console.log(folder);
                      var s3_params = {
                          Bucket: S3_BUCKET,  
                          Key: folder, 
                          Expires: 60,
                          ACL: 'public-read'  
                      };
                      var folderLength;
                      var fileArray = [];
                      var imageArray = [];
                      var videoArray = [];
                      var audioArray = [];
                      var audioNames = [];


          s3.listObjects({Bucket: S3_BUCKET, Delimiter: '/', Prefix: folder}, function(err, data){

                  var folderLength = data.Contents.length;
                  
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
                    // console.log(imageArray);

                    console.log('VIDEOS: ' + videoArray.length);
                    // console.log(videoArray);

                    console.log('AUDIO: ' + audioArray.length);
                    // console.log(audioArray);
                 
                     // end of list objects    
 
          res.render('compose.html', {
                    user: req.user, 
                    images: imageArray, 
                    videos: videoArray, 
                    audio: audioArray, 
                    audionames: audioNames,
                    length: folderLength
                  }); 
                });
                  page = 'compose';      
                  }else{        
                  res.render('index.html')        
                  }
              });

// End Page Rendering ---------------------------------------






// Image Uploads from Compose -------------------------------

          app.get('/sign_s3', function(req, res){

              console.log('hiiiiiiii');
              var s3 = new aws.S3();
              
              var folder = req.user + "/";  
              var s3_params = {
                  Bucket: S3_BUCKET,
                  Key: folder + req.query.file_name, 
                  Expires: 60,
                  ContentType: req.query.file_type,
                  ACL: 'public-read' 
              };
              var folderLength;
              var fileArray = [];
              var imageArray = [];
              var videoArray = [];
              var audioArray = [];
              var audioNames = [];

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

//-------------------------------------------------------------------

// Error Handlers ---------------------------------------------------

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


 // Socket Connections ----------------------------------------------

    io.on('connection', function(socket){ 

        // socket.on('gimme', function(){  // added "user to function argument"
        //     });  // end of 'gimme' 

            socket.on(socket.request.user + ' sendingTo', function(data) {
              console.log("Received:" + socket.request.user + "' sendingTo' " + data);
              socket.broadcast.emit(socket.request.user + ' sendingTo', data);
            });         

            socket.on(socket.request.user + ' sendingAll', function(data) {
              console.log("Received: 'sendingAll' " + data);
              socket.broadcast.emit(socket.request.user + ' sendingAll', data);
            });

            socket.on(socket.request.user + ' toGroup', function(data) {
              console.log("Received: 'toGroup' " + data);
              socket.broadcast.emit(socket.request.user + ' toGroup', data);
            });

              socket.on(socket.request.user + ' videoFigure', function(data) {
              console.log("Received: 'videoFigure' " + data);
              socket.broadcast.emit(socket.request.user + ' videoFigure', data);
            });

            socket.on(socket.request.user + ' imageFigure', function(data) {
              console.log("Received: 'imageFigure' " + data);
              socket.broadcast.emit(socket.request.user + ' imageFigure', data);
            });

            socket.on(socket.request.user + ' switch', function(data) {
              console.log("Received: switch " + data);
              socket.broadcast.emit(socket.request.user + ' switch', data);
            });

            socket.on(socket.request.user + ' waveSketch', function(data) {
              console.log("Received: waveSketch " + data);
              socket.broadcast.emit(socket.request.user + ' waveSketch', data);
            });

            socket.on(socket.request.user + ' perfCount', function(data) {

              performerCount = data;  // this may be deprecated
              
                console.log("socket.request.user is " + socket.request.user);
              socket.broadcast.emit(socket.request.user + ' perfCount', data);                   
                console.log('perfCount = ' + performerCount);            
            });

            // socket.on('gimmePerfCount', function(data) {
            //   socket.emit('givenPerfCount', performerCount);                   
            //   console.log('gimmePerfCount = ' + performerCount);            
            // });
        });

module.exports = app;
