console.log('load app..');

var g = require('./app/global.js');
module.exports = g; 

var express = require('express');
var app = express();


require('./app/express_config.js')(app, express);

var http = require('http');
var server = http.createServer(app);
var port = g.app_config.get('port');

server.listen(port, function(){
    g.log.info('Express server listening on port ' + port);
});

server.on('error',function(err){
    g.log.error('http server error: %j',err);
});





console.log('start app');

