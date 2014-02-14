var request = require('request'),
    cheerio = require('cheerio'),
      async = require('async');

//------------------- CLASS ------------------------------//
function Ticketek(params){
  this.params = params
}

//------------------- CONST -----------------------------//
Ticketek.DOMAIN = "http://www.ticketek.com.ar/";
Ticketek.CONTAINER = "table[width=762]";
Ticketek.FILTERS = ["img[src*=show]", "a[href*=list]:has(img[src*=siguiente])", "a.px11UCaseBold", "p:not(:empty)"];
Ticketek.TYPES = ['ROCKINT','CLASSIC','ELECTRO','FIESTA','FOLKLORE','INTERINT','INTERNAC','JAZBLUES',
                  'METAL','POP','PUNK','REGGAE','TANGO','TROPICAL','ROCKNAC','ROMANTIC'];

//------------------- PROTOTYPES ------------------------//
Ticketek.prototype = {
  constructor: Ticketek,

  getAllPage:function(done) {
    var evento = this.params["evento"].toUpperCase();
    if (checkEvento(evento)){
      var url = getPageUrl(evento,1);
      scrap(-1, url, done);
    }
    else{
      done({err: 'evento no encontrado'});
    }
  },

  getPage:function(done,maxpagination) {
    var evento = this.params["evento"].toUpperCase();
    var numpage = this.params["numpage"];
    if (checkEvento(evento)){
      var url = getPageUrl(evento,numpage);
      scrap(maxpagination,url,done);
    }
    else{
      done({err: 'evento no encontrado'});
    }
  }

  getDetails:function(done){
    var urleve = this.params["urlevent"];
    if (urleve != ''){
      done({ err: 'param url is required'});
    }
    else{
      scrap(1,urleve,done);
    }
  }
}

//------------------- FUNCTIONS -----------------------//
function getPageUrl(type,pageNumber){
  return Ticketek.DOMAIN + 'list.php?area_id=1&show_type=' + type + '&page=' + pageNumber;
}

function checkEvento(evento){
  return (Ticketek.TYPES.indexOf(evento) >= 0);
}

function scrap(maxpagination,url,done){
  var result = [];
  var visited = {};
  var queue = async.queue(crawl,2);

  queue.drain = function(){
    done(result);
  };

  queue.push(url);

  function crawl(url, callback) {
     if (visited[url]){ 
       return callback(); 
     }
     if ((maxpagination < 0)||(maxpagination > 0)){
       maxpagination--;
       visited[url] = true;
       getTicketTekObj(url,callback);
     }
     else{
       return callback();
     }
  }

  function getTicketTekObj(url,callback){
     console.log(url);
     request({uri:url}, function(err, response, body){
        var $ = cheerio.load(body);
        var ob = {};

        function hasNextPage(html){
          return (($(html).is('a')) && ($(html).attr('href').indexOf('list.php') > 0));
        }

        $(Ticketek.CONTAINER)
            .find(Ticketek.FILTERS.toString())
            .each(function(i,html){
              if ($(html).is('img')){
                ob={};
                ob.img = $(html).attr('src');
              }
              else if ($(html).is('p')){
                ob.info = $(html).text();
                result.push(ob);
              }
              else if (hasNextPage(html)){
                 queue.push(Ticketek.DOMAIN + $(html).attr('href'));
              }
              else if ($(html).is('a')){
                ob.band = $(html).text().trim();
                ob.ticket =  Ticketek.DOMAIN + $(html).attr('href'); 
              }
            });
         callback();
     });
  }
}

//lugar = $(".node-title>a").text()
//precio = $(".price>strong").text()
//important = $("h2.pane-title:contains('Importante')").parent().find('p').text()

function clog(ob){
  console.log(JSON.stringify(ob));
}

module.exports.Ticketek = Ticketek;
