var express = require('express');
var passport = require('passport');
var router = express.Router();
var mongoose = require('mongoose');  

// our db models
var Figure = require("../models/figure.js");
var Account = require('../models/account.js');

var chalk = require('chalk');

page = '';

fileList = '';
fileArray = [];
folderLength = '';

imageArray = [];
videoArray = [];

audioArray = [];
audioNames = [];

perfs = [];
performerCount = 0;


//////////////////////////////////////////

    // index

    router.get('/', function (req, res) {
        res.render('index.html', {});
    });


    //PASSPORT SHIZ  

    // router.post('/login', passport.authenticate('local', {session:true}), function(req, res) {

    //    //declared globally
    //    //userName = socket.request.user;
    //    // ^^^^^^^^^^^^^^^^^^^^^^^^^
    //    // is this req.user.username actually being returned from serialize?
    //    // TRY putting serialize here? vvvvv

    //    console.log(chalk.white(req.user.username) + " logged in");

    //   res.render("dashboard.html", {
    //       user: userID, 
    //       images: imageArray, 
    //       videos: videoArray, 
    //       audio: audioArray, 
    //       audionames: audioNames,
    //       length: folderLength,
    //       pcount: performerCount
    //       });
    //   });


    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
      });

    router.get('/register', function(req, res) {
        res.render('register.html', {});
      });

    router.get('/login', function(req, res) {
      page = 'login'; 
        res.render('login.html', { });
      });

    router.get('/about', function(req, res) {
      page = 'about'; 
        res.render('about.html', { });
      });

// the five main pages beyond userAuth

// router.get('/dashboard', function(req,res){

//         if(req.user) {
//         res.render('dashboard.html', {user: userID});     
//         page = 'dashboard';   
//         }else{        
//         res.render('index.html')       
//         }
//    }); 


// router.get('/conductor', function(req,res){

//   console.log(req.user);

//         if(req.user) {
//         res.render('conductor.html', {
          
//           user: userID, 
//           images: imageArray, 
//           videos: videoArray, 
//           audio: audioArray, 
//           audionames: audioNames,
//           length: folderLength,
//           pcount: performerCount

//         });     

//         page = 'conductor';   
//         }else{        
//         res.render('index.html')       
//         }
//    });



router.get('/performer', function(req,res){

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


// router.get('/compose', function(req, res) {
    
//       if(req.user) {          
//         res.render('compose.html', {

//           user: userID, 
//           images: imageArray, 
//           videos: videoArray, 
//           audio: audioArray, 
//           audionames: audioNames,
//           length: folderLength

//         }); 

//         page = 'compose';        
//         }else{        
//         res.render('index.html')        
//         }
//     });


router.post('/register', function(req, res) {

        Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
            if (err) {          
              return res.render("register.html", {err: true, message: "Sorry. That username already exists. Try again."});        
            }
            passport.authenticate('local')(req, res, function () {
               // res.redirect('/');
                res.render("login.html");  // direct to login
            });
        });
    });

 router.post('/submit_form', function(req, res){

    

    var figureName = req.body.figurename;    // pull out the information from the req.body
    var keySig = req.body.keysig;
    var owner = req.user;
    //var keySig = req.body.keysig;

   

    var figureObj = {                        // hold all this data in an object
      figureName: figureName,                // this object should be structured the same way as your db model
      keySig: keySig,
      owner: owner
      };
     
    var figure = new Figure(figureObj);     // create a new figure model instance, passing in the object

    figure.save(function(err,data){         // now, save that instance to the database    // mongoose method, see http://mongoosejs.com/docs/api.html#model_Model-save   
         
          if (err){                         // if err saving, respond back with error

            var error = {status:'ERROR', message: 'Error saving figure'};
            return res.json(error);
          }

         // console.log('SAVED A NEW FIGURE!');
          console.log(chalk.white("TO MONGO:") + chalk.yellow(data));

          // now return the json data of the new animal
          var jsonData = {
            status: 'OK',
            animal: data
          }
      return res.json(jsonData);
    })  
});



module.exports = router;