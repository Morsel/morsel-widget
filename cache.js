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

request('http://api.eatmorsel.com/places/8/morsels.json?count=50&client%5Bdevice%5D=mfkcaching', function (error, response, body) {
  var gridBucket,
      gridFile,
      gridFileContents;

  if (!error && response.statusCode == 200) {
    gridBucket = 'morsel-press-kit/cache/grid';
    gridFile = 'morsels.json';
    gridFileContents = 'morselCallback('+body+');';

    //save a local copy for debugging
    fs.writeFile('./cache/'+gridFile, gridFileContents, function(err) {
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
      Body: gridFileContents,
      ContentType: 'application/json'
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
      request('http://api.eatmorsel.com/morsels/'+m.id+'.json?client%5Bdevice%5D=mfkcaching', function (error, response, body) {
        var morselBucket,
            morselFile,
            morselFileContents;

        if (!error && response.statusCode == 200) {
          morselBucket = 'morsel-press-kit/cache/morsels';
          morselFile = m.id+'.json';

          morselFileContents = 'morselCallback('+body+');';

          fs.writeFile('./cache/morsels/'+morselFile, morselFileContents, function(err) {
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
            Body: morselFileContents,
            ContentType: 'application/json'
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