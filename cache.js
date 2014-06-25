var config = require('./config');
var request = require('request');
var fs = require('fs');
var _ = require('underscore');
var AWS = require('aws-sdk');
var nodeEnv = process.env.NODE_ENV || 'local';

var AWS_ACCESS_KEY_ID = config.AWS_ACCESS_KEY_ID;
var AWS_SECRET_ACCESS_KEY = config.AWS_SECRET_ACCESS_KEY;

AWS.config.update({accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY});

var s3 = new AWS.S3();

request('http://api-staging.eatmorsel.com/places/25/morsels.json?count=9&client%5Bdevice%5D=mfkcaching', function (error, response, body) {
  var gridBucket,
      gridFile;

  if (!error && response.statusCode == 200) {
    gridBucket = 'morsel-press-kit/cache/grid';
    gridFile = 'morsels.json';

    //save a local copy for debugging
    fs.writeFile('./cache/'+gridFile, body, function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log('grid saved locally');
      }
    });

    //push a copy to amazon
    s3.putObject({
      Bucket: gridBucket,
      Key: gridFile,
      ACL: 'public-read',
      Body: body,
    }, function(err, data) {
      if (err) {
        console.log('error uploading to s3: ');
        console.log(err);
        process.exit(1);
      }
      else {
        console.log('Successfully uploaded data to ' + gridBucket + '/' + gridFile);
      }
    });

    _.each(JSON.parse(body).data, function(m){
      request('http://api-staging.eatmorsel.com/morsels/'+m.id+'.json?count=9&client%5Bdevice%5D=mfkcaching', function (error, response, body) {
        var morselBucket,
            morselFile;

        if (!error && response.statusCode == 200) {
          morselBucket = 'morsel-press-kit/cache/morsels';
          morselFile = m.id+'.json';

          fs.writeFile('./cache/morsels/'+morselFile, body, function(err) {
            if(err) {
              console.log(err);
            } else {
              console.log('morsel '+m.id+' saved locally');
            }
          });

          //push a copy to amazon
          s3.putObject({
            Bucket: morselBucket,
            Key: morselFile,
            ACL: 'public-read',
            Body: body,
          }, function(err, data) {
            if (err) {
              console.log('error uploading to s3: ');
              console.log(err);
              process.exit(1);
            }
            else {
              console.log('Successfully uploaded data to ' + morselBucket + '/' + morselFile);
            }
          });
          
        } else {
          console.log('uh ohs getting morsel '+m.id+' from api');
          process.exit(1);
        }
      });
    });
  } else {
    console.log('uh ohs getting morsels from api');
    process.exit(1);
  }
});

process.on('uncaughtException', function(err) {
  console.log(err);
});