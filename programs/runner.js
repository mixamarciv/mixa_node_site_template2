console.log('load runner.js..');

var g = require('../app/global.js');
module.exports = g; 

var config = g.app_config;
var run_app = nconf.get("execute_app");


/********
if(!config.get('app_is_webserver') || !run_app ){
    //если 

    var express = require('express');
    var app = express();
    
    require('./app/express_config.js')(app, express);
    
    var http = require('http');
    var server = http.createServer(app);
    var port = config.get('port');
    
    server.listen(port, function(){
        g.log.info('Express server listening on port ' + port);
    });
    
    server.on('error',function(err){
        g.log.error('http server error: %j',err);
    });
    
    console.log('start app');
    
}else{
    //если запускаем внешнее приложение
    var user_app = args[2];
    console.log('start app '+user_app);
}
*******/



