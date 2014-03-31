console.log('load runner.js..');
//скрипт для запуска js-скрпта с загруженными данными главного приложения

var g = require('../../app/global.js');
module.exports = g; 

var config = g.app_config;
//var run_app = nconf.get("execute_app");



module.exports = function(js_file_path){
    g.log.info('start external app: ' + js_file_path);
    require(js_file_path)(g);
}
