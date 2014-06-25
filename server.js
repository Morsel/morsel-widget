var express = require("express");

var nodeEnv = process.env.NODE_ENV || 'local';
var apiUrl = nodeEnv === 'local' ? 'http://api.eatmorsel.com'/*'http://api-staging.eatmorsel.com'*/ : 'http://api-staging.eatmorsel.com';//'http://api.eatmorsel.com'

//create our app and expose it
var app = express();

var port = Number(process.env.PORT || 5001);

//enable gzip
var compress = require('compression');
app.use(compress());

//use hbs for templates
var hbs = require('hbs');
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

hbs.registerHelper('ifCond', function(v1, v2, options) {
  if(v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});
hbs.registerPartials(__dirname + '/templates');

//static files
app.use('/js', express.static(__dirname + '/js'));
app.use('/style', express.static(__dirname + '/style'));
app.use('/assets', express.static(__dirname + '/assets'));
app.use('/templates', express.static(__dirname + '/templates'));


app.get('/places/:id', function(req, res){
  res.render('frame', {
    placeId: req.params.id,
    nodeEnv: nodeEnv,
    apiUrl: apiUrl
  });
});

app.get('/shell/:id', function(req, res){
  res.render('shell', {
    placeId: req.params.id,
    nodeEnv: nodeEnv
  });
});

httpServer = app.listen(port, function() {
  console.log("Listening on " + port);
});