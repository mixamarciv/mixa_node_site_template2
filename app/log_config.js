console.log('load logger..');

var path = require('path');


var winston = require('winston');

var g = require('./global.js');
var config = g.app_config;

var date_to_str_format = g.mixa.str.date_to_str_format;



var transport_console_options = {
    colorize: 1,
    handleExceptions: true,
    timestamp: true,
    json: 0
}


var log_filename = config.get("log:app:filepath")+"/app_"+date_to_str_format("YMDhms")+".log";
var log_level = config.get("log:app:level");

if(g.app_config.get('app_is_webserver')==0){
    //если запускаем внешнее приложение
    log_filename = config.get("log:inf:filepath")+"/app_"+date_to_str_format("YMDhms")+".log";
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

var transports_list = [new (winston.transports.File)(transport_file_options)];
if(g.app_config.get('app_is_webserver')){
    transports_list.push(new (winston.transports.Console)(transport_console_options));
}

var logger = new (winston.Logger)({
    transports: transports_list,
    exitOnError: exitOnErrorLoggerCheck
});


logger.dump_str = function(obj_name,obj,options){
    if (!obj){
        obj = obj_name;
        obj_name = 'dump';
    }
    if (!options) 
        options = {
            max_level:5,
            separator:'\n',
            showHidden:1,
            hide_functions:0,
            max_str_length: 9000,
            prepare_str_function:null,
            prepare_num_function:null,
            exclude: [/.+\._/] //исключаем все var._переменные
        };
    return g.mixa.dump.var_dump_node(obj_name,obj,options/*,level*/);
}

logger.dump_error = function(obj_name,obj,options){
    return logger.error(logger.dump_str(obj_name,obj,options));
}
logger.dump_info = function(obj_name,obj,options){
    return logger.info(logger.dump_str(obj_name,obj,options));
}
logger.dump_warn = function(obj_name,obj,options){
    return logger.warn(logger.dump_str(obj_name,obj,options));
}


winston.handleExceptions(new winston.transports.Console({ colorize: true, json: true }));


module.exports = function (type){
  
  return logger;
}




