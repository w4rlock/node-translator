var request = require('request'),
    cheerio = require('cheerio'),
      async = require('async');

//------------------- CLASS ------------------------------//
function Ticketek(params){
  this.params = params
}

//------------------- CONST -----------------------------//
Ticketek.DOMAIN = "http://www.ticketek.com.ar/";
Ticketek.STYLES = Ticketek.DOMAIN + 'musica';
Ticketek.CONTAINER = "table[width=762]";
Ticketek.FILTERS = ["img[src*=show]", "a[href*=list]:has(img[src*=siguiente])", "a.px11UCaseBold", "p:not(:empty)"];
//Ticketek.TYPES = ['ROCKINT','CLASSIC','ELECTRO','FIESTA','FOLKLORE','INTERINT','INTERNAC','JAZBLUES',
//                  'METAL','POP','PUNK','REGGAE','TANGO','TROPICAL','ROCKNAC','ROMANTIC'];

//------------------- PROTOTYPES ------------------------//
Ticketek.prototype = {
  constructor: Ticketek,

  getAllPage:function(done) {
    var evento = this.params["evento"].toUpperCase();
    if (checkEvento(evento)){
      var url = getPageUrl(evento,0);
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
  },

  getDetails:function(done){
    var urleve = this.params["evento"];
    if (urleve != ''){
      done({ err: 'param url is required'});
    }
    else{
      scrap(1,urleve,done);
    }
  },

  getMenuStyles:function(done){
    var result = [];
    var queue = async.queue(
        function getStylesMenu(url,callback){
           request({uri: url}, function(err, response, body){
              var $ = cheerio.load(body);

              $(".pane-shows-categories a").each(function(i,html){
                var ob = {
                  link: $(html).attr('href'),
                  label:$(html).text()
                }
                result.push(ob);
              });
              callback();
            });
        },1);
    queue.drain = function(){ done(result); };
    queue.push(Ticketek.STYLES);
  }
}

//------------------- FUNCTIONS -----------------------//
function getPageUrl(type,pageNumber){
  return Ticketek.DOMAIN +  type + '?page=' + pageNumber;
}

function checkEvento(evento){
  return true;
  //return (Ticketek.TYPES.indexOf(evento) >= 0);
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
       getTicketeckPages(url,callback);
     }
     else{
       return callback();
     }
  }

  function getTicketeckDetail(url,callback){
     console.log(url);
     request({uri:url}, function(err, response, body){
        var $ = cheerio.load(body);
        var ob = {};

        ob.lugar= $(".node-title>a").text();
        ob.precio= $(".price>strong").text();
        ob.important= $("h2:contains('Importante')").parent().find('span,p').text();
        ob.address=$("h2:contains('Escenario')").parent().find(".field-item .even:not(':empty')");
        result.push(ob);

        callback();
    });
  }



  function getTicketeckPages(url,callback){
     console.log(url);
     request({uri:url}, function(err, response, body){
        var $ = cheerio.load(body);
        var next_page = $(".pager-next a").attr('href');
        var ob = {};

        function hasNextPage(html){
          return (($(html).is('a')) && ($(html).attr('href').indexOf('list.php') > 0));
        }

        $("div[id^=artist]").find('p>a,img').each(function(i,html){
        //$(Ticketek.CONTAINER).find(Ticketek.FILTERS.toString()).each(function(i,html){
            if ($(html).is('img')){
              ob={};
              ob.img = 'http:' + $(html).attr('src');
            }
            else if ($(html).is('a')){
              ob.band = $(html).text().trim();
              ob.view =  Ticketek.DOMAIN + $(html).attr('href'); 
              result.push(ob);
            }
         });
         if (next_page){
           queue.push(Ticketek.DOMAIN + next_page);
         }
         callback();
     });
  }
}

function clog(ob){
  console.log(JSON.stringify(ob));
}

module.exports.Ticketek = Ticketek;

