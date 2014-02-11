var express = require('express'),
    request = require('request'),
    cheerio = require('cheerio'),
    param = require('express-params'),
    Ticketek = require('./concert.js').Ticketek,
    app = express(),
    Cache = require('cache-storage'),
    FileStorage = require('cache-storage/Storage/FileSyncStorage'),
    server = require('http').createServer(app);

var cache = new Cache(new FileStorage('./cache'), 'namespace');

function cacheSave(key,value,expire){
  var oexpires = { minutes: 10};
  //moment({years: 2010, months: 3, days: 5, hours: 15, minutes: 10, seconds: 3, milliseconds: 123});
  cache.save(key.toUpperCase(),value, {expire: oexpires});
}

function cacheGet(key){
  return cache.load(key.toUpperCase());
}


//------------------------- ROUTES ------------------------------//
app.use(express.static(__dirname + '/public'));

app.get('/concerto/:evento', function(req, res){
  var cach = cacheGet(req.params["evento"]);
  if (cach == null){
    var con = new Ticketek(req.params);
    con.getAllPage(function(result){ 
      cacheSave(req.params["evento"], result, null);
      res.json(result);
    });
  }
  else{
    res.send(cach);
  }
});

app.get('/concerto/:evento/:numpage', function(req, res){
  var con = new Ticketek(req.params);
  con.getPage(
    function(result){ 
      res.json(result);
    },2);
});

app.get('/', function(req, res) {
  res.send(app.routes);
});

app.get('/*', function(req, res){
  res.sendfile('./public/404.html');
});
//------------------------- ROUTES ------------------------------//

server.listen(8081);
console.log('Server listen on 8081');
