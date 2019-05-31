var express = require('express');
var router = express.Router();
var aws = require('aws-sdk');
var app = express();
var env = require('node-env-file');

if (app.get("env") === "development") {
  env('./.env');
}
var S3_BUCKET = process.env.S3_BUCKET; 


router.get('/sign_s3', function(req, res){

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



module.exports = router;
