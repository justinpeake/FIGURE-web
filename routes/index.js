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

module.exports = router;
