console.log('load exchange.js..');
//модуль для обмена сообщениями между процессами
var g = require('../global.js');

if(g.app_config.get('app_is_webserver')){
    //module.exports = require('./exchange_server.js');
}else{
    //module.exports = require('./exchange_client.js');
}

