var request = require('request');
var fs = require('fs');
var _ = require('underscore');

request('http://api-staging.eatmorsel.com/places/25/morsels.json?count=9&client%5Bdevice%5D=mfkcaching', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    fs.writeFile("./cache/morsel.json", body, function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("morsels saved");
      }
    });

    _.each(JSON.parse(body).data, function(m){
      request('http://api-staging.eatmorsel.com/morsels/'+m.id+'.json?count=9&client%5Bdevice%5D=mfkcaching', function (error, response, body) {
        fs.writeFile("./cache/morsels/"+m.id+".json", body, function(err) {
          if(err) {
            console.log(err);
          } else {
            console.log("morsels saved");
          }
        });
      });
    });
  } else {
    console.log('uh ohs getting morsels from api');
  }
});