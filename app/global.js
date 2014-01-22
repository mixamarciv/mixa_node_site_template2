console.log('load global functions..');


var global_app_var = {};
module.exports = global_app_var;


var g = global_app_var;

g.path = require('path');
g.fs   = require('fs');
g.util = require('util');

g.app_config = require('../config');
g.log        = require('./log_config.js')();




g.app_fnc = {};
f = g.app_fnc;

f.HttpError = require('./error/http_error.js');


/*********
winston.profile('test');


log4js.configure({
 appenders: [
   { type: 'console' },
   { category: 'app', type: 'file', filename: config.get("log:app:filepath"), maxLogSize: 20480, backups: 10 },
   { category: 'inf', type: 'file', filename: config.get("log:inf:filepath"), maxLogSize: 20480, backups: 10 }
  ]
});

//задаем setLevel для каждой категории логов из конфиг файла
function set_log_levels_from_config(config){
  var log_types = config.get('log');
  for(var log_type in log_types){
    if(log_types[log_type] && log_types[log_type].filepath){
      var log_type_level = 'ALL';
      if(log_types[log_type].level){
        log_type_level = log_types[log_type].level;
      }
      var logger = log4js.getLogger(log_type);
      logger.setLevel(log_type_level);
      console.log("  log type \""+log_type+"\" set level \""+log_type_level+"\"");
    }
  }
}

set_log_levels_from_config(config);

******/

