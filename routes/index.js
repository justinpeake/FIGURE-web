var express = require('express');
var router = express.Router();

// var mongoose = require('mongoose');

// our db models
// var Figure = require("../models/figure.js");
var Account = require('../models/account.js');

var chalk = require('chalk');

page = '';
fileList = '';
perfs = [];
//performerCount = 0;

// var app = express();
// var env = require('node-env-file');

// if (app.get("env") === "development") {
//   env('./.env');
// }
// var S3_BUCKET = process.env.S3_BUCKET;
// // console.log("IS THIS WORKING? " + S3_BUCKET);

//////////////////////////////////////////

    // index

    router.get('/', function (req, res) {
        res.render('index.html', {});
    });

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

      router.get('/help', function(req, res) {
        page = 'help';
          res.render('help.html', { 
            user: req.user.username,
            id: req.user,
          });
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

//  router.post('/submit_form', function(req, res){

//     var figureName = req.body.figurename;    // pull out the information from the req.body
//     var keySig = req.body.keysig;
//     var owner = req.user;
//     //var keySig = req.body.keysig;
//     var figureObj = {                        // hold all this data in an object
//       figureName: figureName,                // this object should be structured the same way as your db model
//       keySig: keySig,
//       owner: owner
//       };

//     var figure = new Figure(figureObj);     // create a new figure model instance, passing in the object

//     figure.save(function(err,data){         // now, save that instance to the database    // mongoose method, see http://mongoosejs.com/docs/api.html#model_Model-save

//           if (err){                         // if err saving, respond back with error

//             var error = {status:'ERROR', message: 'Error saving figure'};
//             return res.json(error);
//           }

//          // console.log('SAVED A NEW FIGURE!');
//           console.log(chalk.white("TO MONGO:") + chalk.yellow(data));

//           // now return the json data of the new animal
//           var jsonData = {
//             status: 'OK',
//             animal: data
//           }
//       return res.json(jsonData);
//     })
// });



module.exports = router;
