console.log('load runner.js..');
//скрипт для запуска js-скрпта с загруженными данными главного приложения

var g = require('../../app/global.js');
var a = g.app_fnc;
var errs = g.err.update_error_stack;

var config = g.app_config;
//var run_app = nconf.get("execute_app");
var app_db = g.app_db; 

var execFile = require('child_process').execFile;

module.exports.execute_app = function(js_file_path){
    g.log.info('start external app: ' + js_file_path);
    setInterval(function(){
      console.log(g.mixa.str.date_to_str_format('YMD h:m:s  k   hehe'));
    },2000);
}
