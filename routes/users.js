var express = require('express');
var router = express.Router();
var Account = require('../models/account.js');
var passport = require('passport');
var aws = require('aws-sdk');
var app = express();
var env = require('node-env-file');
var performerCount = 0;

if (app.get("env") === "development") {
  env('./.env');
}
var S3_BUCKET = process.env.S3_BUCKET;

router.get('/register', function(req, res) {
    res.render('register.html', {});
  });


router.post('/register', function(req, res) {

    Account.register(new Account({ username : req.body.username, publicPracticeEnabled : ' ' }), req.body.password, function(err, account) {
        if (err) {
          return res.render("register.html", {err: true, message: "Sorry. That username already exists. Try again."});
        }
        passport.authenticate('local')(req, res, function () {
           // res.redirect('/');
  
            res.render("login.html");  // direct to login
        });
    });
});


router.get('/login', function(req, res) {
    page = 'login';
      res.render('login.html', { });
    });

// changing
    router.get('/dashboard', function(req, res) {
      page = 'login';

    var s3 = new aws.S3();
    var folder = req.user + "/";
  
    console.log("Req.user from users.js = " + req.user);
  
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
          user: req.user.username,
          id: req.user,
          images: imageArray,
          videos: videoArray,
          audio: audioArray,
          audionames: audioNames,
          length: folderLength,
          pcount: performerCount 
        });
      });
  

router.post('/login', passport.authenticate('local', {session:true}), function(req, res) {

    // var s3 = new aws.S3();
    // var folder = req.user + "/";
  
    // console.log("Req.user from users.js = " + req.user);
  
    // var s3_params = {
    //     Bucket: S3_BUCKET,
    //     Key: folder,
    //     Expires: 60,
    //     ACL: 'public-read'
    // };
    // var folderLength;
    // var fileArray = [];
    // var imageArray = [];
    // var videoArray = [];
    // var audioArray = [];
    // var audioNames = [];
  
    // s3.listObjects({Bucket: S3_BUCKET, Delimiter: '/', Prefix: folder}, function(err, data){
  
    //   var folderLength = data.Contents.length;
  
    //   // filling fileArray[] with all the URL's from amazon
    //   for (i = 0; i < folderLength; i++){
    //       fileArray[i] = 'https://' + S3_BUCKET + '.s3.amazonaws.com/' + data.Contents[i].Key;
    //       };
  
    //     /*
    //         1) this is splitting the urls >
    //         2) looking at the last array element (which is 'most likely' the file extension)
    //             ^ this could ultimately be buggy if the naming conventions change
    //         3) checking to see whether the file extension matches any of the strings
    //         4) putting them into appropriate 'file type' arrays to be sent to client w/ handlebars
    //     */
  
    //     for (i = 0; i < folderLength; i++){
    //       if (fileArray[i].split(".")[4] == 'jpg'){
    //         imageArray.push(fileArray[i]);
    //       } else if (fileArray[i].split(".")[4] == 'png'){
    //         imageArray.push(fileArray[i]);
    //       }  else if (fileArray[i].split(".")[4] == 'mov'){
    //         videoArray.push(fileArray[i]);
    //       } else if (fileArray[i].split(".")[4] == 'wav'){
    //         audioArray.push(fileArray[i]);
  
    //         //splitting url to extract the name of the file
    //         audioNames.push(fileArray[i].split("/")[4].split(".")[0]);
    //       } else if (fileArray[i].split(".")[4] == 'mp3'){
    //         audioArray.push(fileArray[i]);
    //         audioNames.push(fileArray[i].split("/")[4].split(".")[0]);
    //       }
  
    //     };  // end of file for loop
  
    //     console.log('IMAGES: ' + imageArray.length);
    //     console.log('VIDEOS: ' + videoArray.length);
    //     console.log('AUDIO: ' + audioArray.length);
  
    //   });
  
        // res.render('dashboard.html', {
        //     user: req.user.username,
        //     id: req.user,
        //     images: imageArray,
        //     videos: videoArray,
        //     audio: audioArray,
        //     audionames: audioNames,
        //     length: folderLength,
        //     pcount: performerCount
        //     });
   
         res.redirect('/dashboard');
           
    });


module.exports = router;