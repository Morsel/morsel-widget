var express = require("express");

//create our app and expose it
var app = express();

//enable gzip
var compress = require('compression');
app.use(compress());

//use hbs for templates
var hbs = require('hbs');
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

//static files
app.use('/js', express.static(__dirname + '/js'));
app.use('/style', express.static(__dirname + '/style'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/places/:id', function(req, res){
  res.render('frame', {
    placeId: req.params.id
  });
});

app.get('/shell/:id', function(req, res){
  res.render('shell', {
    placeId: req.params.id
  });
});

httpServer = app.listen(5001, function() {
  console.log("Listening on " + 5001);
});