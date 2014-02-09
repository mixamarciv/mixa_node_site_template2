console.log('load logger..');

var path = require('path');


var winston = require('winston');

var g = require('./global.js');
var config = g.app_config;

var date_to_str_format = g.mixa.str.date_to_str_format;



var transport_console_options = {
    colorize: true,
    handleExceptions: true,
    timestamp: true,
    json: false
}


var log_filename = config.get("log:app:filepath")+"/app_"+date_to_str_format("YMDhmsk")+".log";
var log_level = config.get("log:app:level");

if(g.app_config.get('app_is_webserver')==0){
    //если запускаем внешнее приложение
    log_filename = config.get("log:inf:filepath")+"/app_"+date_to_str_format("YMDhmsk")+".log";
    log_level = config.get("log:inf:level");
}

console.log('  log file: '+log_filename+' (level:'+log_level+')');

var transport_file_options = {
    filename: log_filename,
    level: log_level,
    handleExceptions: true,
    timestamp: true,
    maxsize: 1024*100,
    maxFiles: 10,
    json: false
}

function exitOnErrorLoggerCheck(err) {
    return err.code == 'Unexpected token';
    return err.code !== 'EPIPE';
}

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(transport_console_options),
      new (winston.transports.File)(transport_file_options)
    ],
    exitOnError: exitOnErrorLoggerCheck
});


module.exports = function (type){
  
  return logger;
}




