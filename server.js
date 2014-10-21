var app = require('express.io')(),
MsTranslator = require('mstranslator'),
client = new MsTranslator({
  client_id: "madarab",
  client_secret: "DJ9mr3Ev/tJ9DfYg6vYPshzOE3hYVRRk7wQ7kKEseXs="
}, true);

app.http().io()

var params = { 
  //text: 'How\'s it going?'
  text: 'شقيق'
  , from: 'ar'
  , to: 'es'
};
// Setup the ready route, and emit talk event.
app.io.route('trans', function(req) {
    params.text = req.data;
    client.translate(params, function(err, data) {
        //console.log(data);
        req.io.emit('talk', {
            message: data
        })
    });
});
app.io.route('ready', function(req) {
    client.translate(params, function(err, data) {
        //console.log(data);
        req.io.emit('talk', {
            message: data
        })
    });
    //req.io.emit('talk', {
        //message: 'io event from an io route on the server'
    //})
})

// Send the client html.
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/client.html')
})

var port = process.env.PORT || 8081;
app.listen(port)
