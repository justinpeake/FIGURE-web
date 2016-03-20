var express = require('express');
var passport = require('passport');
var router = express.Router();
var mongoose = require('mongoose');  

// our db models
var Figure = require("../models/figure.js");
var Account = require('../models/account.js');

var chalk = require('chalk');

userName = '';  //declared globally to go to app.js
page = '';
fileList = '';
fileArray = [];
folderLength = '';

//////////////////////////////////////////

    // index

    router.get('/', function (req, res) {
        res.render('index.html', {});
    });


    //PASSPORT SHIZ  ... NOTE: this router.post WAS above the submit-form

    

    router.post('/login', passport.authenticate('local'), function(req, res) {

       //declared globally
       userName = req.user.username;

       console.log(chalk.white(req.user.username) + " logged in");
       res.render("dashboard.html", {user: userName, files: fileArray, length: folderLength});

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

    // router.get('/ping', function(req, res){
    //     res.status(200).send("pong!");
    // });




// the five main pages beyond userAuth
router.get('/dashboard', function(req,res){

        if(req.user) {
        res.render('dashboard.html', {user: userName});     
        page = 'dashboard';   
        }else{        
        res.render('index.html')       
        }
   });


router.get('/conductor', function(req,res){

        if(req.user) {
        res.render('conductor.html', {user: userName, files: fileArray, length: folderLength});     
        page = 'conductor';   
        }else{        
        res.render('index.html')       
        }
   });



router.get('/performer', function(req,res){

      //uncommenting this willmake performer page avail only to auth'd users

      // if(req.user) {   
      //   res.render('performer.html', {user: userName});  
      //   page = 'performer';        
      //   }else{        
      //   res.render('index.html')        
      //   }

        res.render('performer.html');
        page = 'performer';

    });


router.get('/compose', function(req, res) {
    
      if(req.user) {          
        res.render('compose.html', {user: userName, files: fileArray, length: folderLength}); 
        page = 'compose';        
        }else{        
        res.render('index.html')        
        }
    });


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
     
    var figure = new Figure(figureObj);     // create a new figre model instance, passing in the object

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



// router.get('/api/get/:id', function(req, res){

//   var requestedId = req.param('id');

//   // mongoose method, see http://mongoosejs.com/docs/api.html#model_Model.findById
//   Animal.findById(requestedId, function(err,data){

//     // if err or no user found, respond with error 
//     if(err || data == null){
//       var error = {status:'ERROR', message: 'Could not find that animal'};
//        return res.json(error);
//     }

//     // otherwise respond with JSON data of the animal
//     var jsonData = {
//       status: 'OK',
//       animal: data
//     }

//     return res.json(jsonData);
  
//   })
// })

// router.get('/api/get', function(req, res){

//   // mongoose method to find all, see http://mongoosejs.com/docs/api.html#model_Model.find
//   Figure.count(function(err, data){
//     // if err or no animals found, respond with error 
//     if(err || data == null){
//       var error = {status:'ERROR', message: 'Could not find animals'};
//       return res.json(error);
//     }

//     // otherwise, respond with the data 

//     var jsonData = {
//       status: 'OK',
//       figures: data
//     } 

//     res.json(jsonData);

//   })

// })

// router.post('/api/update/:id', function(req, res){

//    var requestedId = req.param('id');

//    var dataToUpdate = {}; // a blank object of data to update

//     // pull out the information from the req.body and add it to the object to update
//     var name, age, weight, color, url; 

//     // we only want to update any field if it actually is contained within the req.body
//     // otherwise, leave it alone.
//     if(req.body.name) {
//       name = req.body.name;
//       // add to object that holds updated data
//       dataToUpdate['name'] = name;
//     }
//     if(req.body.age) {
//       age = req.body.age;
//       // add to object that holds updated data
//       dataToUpdate['age'] = age;
//     }
//     if(req.body.weight) {
//       weight = req.body.weight;
//       // add to object that holds updated data
//       dataToUpdate['description'] = {};
//       dataToUpdate['description']['weight'] = weight;
//     }
//     if(req.body.color) {
//       color = req.body.color;
//       // add to object that holds updated data
//       if(!dataToUpdate['description']) dataToUpdate['description'] = {};
//       dataToUpdate['description']['color'] = color;
//     }
//     if(req.body.url) {
//       url = req.body.url;
//       // add to object that holds updated data
//       dataToUpdate['url'] = url;
//     }

//     var tags = []; // blank array to hold tags
//     if(req.body.tags){
//       tags = req.body.tags.split(","); // split string into array
//       // add to object that holds updated data
//       dataToUpdate['tags'] = tags;
//     }


//     console.log('the data to update is ' + JSON.stringify(dataToUpdate));

//     // now, update that animal
//     // mongoose method findByIdAndUpdate, see http://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate  
//     Animal.findByIdAndUpdate(requestedId, dataToUpdate, function(err,data){
//       // if err saving, respond back with error
//       if (err){
//         var error = {status:'ERROR', message: 'Error updating animal'};
//         return res.json(error);
//       }

//       console.log('updated the animal!');
//       console.log(data);

//       // now return the json data of the new person
//       var jsonData = {
//         status: 'OK',
//         animal: data
//       }

//       return res.json(jsonData);

//     })

// })


// router.get('/api/delete/:id', function(req, res){

//   var requestedId = req.param('id');

//   // Mongoose method to remove, http://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove
//   Animal.findByIdAndRemove(requestedId,function(err, data){
//     if(err || data == null){
//       var error = {status:'ERROR', message: 'Could not find that animal to delete'};
//       return res.json(error);
//     }

//     // otherwise, respond back with success
//     var jsonData = {
//       status: 'OK',
//       message: 'Successfully deleted id ' + requestedId
//     }

//     res.json(jsonData);

//   })

// })

module.exports = router;