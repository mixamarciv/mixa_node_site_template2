var start_load_app_time = new Date();
console.log('load app..');

var g = require('./app/global.js');
module.exports = g; 

var config = g.app_config;

if(config.get('app_is_webserver')){
    //если запускаем наш веб сервер

    var express = require('express');
    var app = express();
    
    require('./app/express_config.js')(app, express);
    
    var http = require('http');
    var server = http.createServer(app);
    var port = config.get('http_port');
    
    server.listen(port, function(){
        g.log.info('Express server listening on port ' + port);
    });
    
    server.on('error',function(err){
        g.log.error('http server error: %j',err);
    });
    
    console.log('start app');
    
}else{
    //если запускаем внешнее приложение
    var user_app = config.get('execute_app');
    console.log('start app '+user_app);
}


console.log('end load app ('+g.mixa.str.time_duration_str(start_load_app_time)+')');

