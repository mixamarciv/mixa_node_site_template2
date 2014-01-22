console.log('load logger..');

var path = require('path');

var config = require('../config');

var winston = require('winston');


var transport_console_options = {
    colorize: true,
    handleExceptions: true,
    timestamp: true,
    json: false
}

var transport_file_options = {
    filename: config.get("log:app:filepath"),
    level: config.get("log:app:level"),
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




