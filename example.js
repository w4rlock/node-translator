    var MsTranslator = require('mstranslator');
    // Second parameter to constructor (true) indicates that 
    // the token should be auto-generated.
    var client = new MsTranslator({
      client_id: "madarab"
      , client_secret: "DJ9mr3Ev/tJ9DfYg6vYPshzOE3hYVRRk7wQ7kKEseXs="
    }, true);

    var params = { 
      //text: 'How\'s it going?'
      text: 'شقيق'
      , from: 'ar'
      , to: 'es'
    };

client.initialize_token(function(keys){ 
      console.log(JSON.stringify(keys));
      client.translate(params, function(err, data) {
          console.log(data);
      });
    });
    // Don't worry about access token, it will be auto-generated if needed.
    //client.translate(params, function(err, data) {
          //console.log(data);
    //});
