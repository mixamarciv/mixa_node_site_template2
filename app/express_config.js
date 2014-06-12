console.log('load express..');
var g  = require('./global.js');
var a = g.app_fnc; 

var HttpError = require('./error/http_error.js');


module.exports = function (app, express) {

    var path = g.path,
        config = g.app_config;
        //mongoose = require('../utils/mongoose'),
        //MongoStore = require('connect-mongo')(express),

    //прокси мы тоже доверяем
    app.enable('trust proxy');
    
    
    var favicon = require('serve-favicon');
    var logger = require('morgan');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var cookieSession = require('cookie-session');

    //первым делом логируем запрос
    app.use(log_request);
    
    app.use(logger('dev'));
    app.use(favicon('public/images/favicon.ico'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());
    //app.use(cookieParser());
    app.use(cookieSession({
        //keys: [config.get('session:key'),config.get('session:secret')],
        
        secret: config.get('session:secret'),
        name: config.get('session:cookie_name'),
        httpOnly: false,
        //cookie: config.get('session:cookie'),
        
        //если не работают сессии поменяй этот ключ!!!:
        secureProxy: false // if you do SSL outside of node   // <<<<<<<<<<<<===================== поменяй ключ, если не работают сессии
        
    }));
    
    


    //user functions load: - загружаем все функции и проходим проверки пользователя
    require('./app_use/app_use.js')(app,express);

    

    //теперь задаем все роуты на вывод нужных страниц пользователю
    //app.use(app.router);
    require('../routes/routes.js')(app,express);
    require('../public/public.js')(app,express);



    
    /*// ------------------------------------------------------------------------
    //задаем функцию обработки ошибок, она должна идти последней в списке app.use
    //обязательно должна получать 4 параметра, argument1 == next(argument1)
    app.use(function(err,req,res,next){
        g.log.info('http error catch');
        if(typeof err == 'number'){
            err = new a.HttpError(err);
        }
        
        if(err instanceof a.HttpError){
            //return express.errorHandler()(err,req,res,next);
            return res.sendHttpError(err);
        }
        return express.errorHandler()(err,req,res,next);
    });
    */
    var errorhandler = require('errorhandler');
    app.use(errorhandler());
    // ------------------------------------------------------------------------
    
    //Error handing
    //app.use(errorHandler);
};

function log_request(req,res,next) {
    
    var req_n = a.server_info.request_number++;
    
    //var dump_options = {exclude: [/^req.socket/i,/^req.res/i,/\._/,/\.connection\.parser/i,/req.client/i,/req.connection/i]};
    //g.log.info(  g.mixa.dump.var_dump_node("req",req,dump_options)  );
    
    res.execute_info = { //сохраняем начальную информацию о запросе
        start_time : (new Date()).getTime(),  //время начала обработки запроса
        execute_time : function(time_end){ return g.mixa.str.time_duration_str(this.start_time,new Date());},
        url : req.originalUrl,
        method: req.method
    }
    //g.log.info(req_n+": ["+req.method+"] "+req.originalUrl);
    
    next();
}