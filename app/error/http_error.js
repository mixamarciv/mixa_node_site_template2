console.log('load http_error..');

var path = require('path');
var util = require('util');
var http = require('http');

//класс обработки ошибок запросов http  
function HttpError(status_code,err_message){
    if(!status_code) status_code = 5000;
    Error.apply(this,arguments);
    Error.captureStackTrace(this,HttpError);
    
    this.status = status_code;
    this.message = err_message || http.STATUS_CODES[status_code] || ("Error "+status_code);
}
util.inherits(HttpError,Error);
HttpError.prototype.name = "HttpError";

module.exports = HttpError;