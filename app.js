console.log('load app..');

var g = require('./app/global.js');
module.exports = g; 

var express = require('express');
var app = express();


require('./app/express_config.js')(app, express);

var http = require('http');
var server = http.createServer(app);
var port = g.app_config.get('port');

server.listen(port, function(){
    g.log.info('Express server listening on port ' + port);
});

server.on('error',function(err){
    g.log.error('http server error: %j',err);
});





console.log('start app');

/******************
var util = require('util');
var http = require('http');
var path = require('path');
var config = require('config');

var express = require('express');



var routes = require('./routes');
var user = require('./routes/user');


var app = express();
// all environments
app.set('port', process.env.PORT || config.get('port'));
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');
app.engine('ejs', require('ejs-locals'));
app.use(express.favicon());
//app.use(express.logger('dev'));
//app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));



var log4js = require('log4js');
log4js.configure({
 appenders: [
   { type: 'console' },
   { type: 'file', filename: 'log/cheese.log', category: 'cheese' }
  ]
});

var logger = log4js.getLogger('cheese');
logger.setLevel('trace');

var t = log4js.connectLogger(logger, { /*level: log4js.levels.INFO * /});
console.log("--==[ t ]==--");
console.log(t.toString());
console.log("--==[ t ]==--");
app.use(log4js.connectLogger(logger, { /*level: log4js.levels.INFO * /}));

{
var logger = log4js.getLogger('cheese');
logger.setLevel('trace');

logger.trace('Entering cheese testing');
logger.debug('Got cheese.');
logger.info('Cheese is Gouda.');
logger.info(logger);
logger.warn('Cheese is quite smelly.');
logger.error('Cheese is too ripe!');
logger.fatal('Cheese was breeding ground for listeria.');
}



function logErrors(err, req, res, next) {
  console.log("--==[ ERROR ]==--");
  console.error(err.stack);
  console.log("--==[/ERROR ]==--");
  next(err);
}
app.use(logErrors);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.get('/', routes.index);
app.get('/users', user.list);

var httpServer = http.createServer(app);

httpServer.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

httpServer.on('error',function(err){
  console.log("=================================================");
  console.log(err);
});

function err_test(){
  //dtest = 0;
  //console.log(test[1]);
  var std = require('mixa_std_js_functions');
  console.log(std);
}

try {
  err_test();
}catch(e){
  console.log("error:\"%s\"\nmessage:\"%s\"\n%s",e.name,e.message,e.stack);
}

function appError(status,message){
  this.message = message;
  Error.captureStackTrace(this);
}
util.inherits(appError,Error);
appError.prototype.name = "appError";
*****************/
