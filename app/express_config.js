console.log('load express..');
var g  = require('./global.js');
var a = g.app_fnc; 

var HttpError = require('./error/http_error.js');


module.exports = function (app, express) {
    
    //test.get_info('express_config run');
    //test.set_var_value('express_config2');
    
    var path = g.path,
        config = g.app_config;
        //mongoose = require('../utils/mongoose'),
        //MongoStore = require('connect-mongo')(express),

    //var router = require('../routes/routes.js');
    
    /****
    //задаем шаблонизатор
    var ect = require('ect');
    var ectRenderer = ect({ watch: true, // — Automatic reloading of changed templates,
                                         //defaulting to false (useful for debugging with enabled cache, not supported for client-side)
                            root: __dirname + '/views',
                            cache: true, // — Compiled functions are cached, defaulting to true
                            test : 1,
                           });
    app.engine('ect', ectRenderer.render );
    ***/
    
    //app.set('views', path.normalize(path.join(__dirname, '../views')) );
    //app.set('view engine', 'ejs');
    
    
    //прокси мы тоже доверяем
    app.enable('trust proxy');
    
    //первым делом логируем запрос
    app.use(log_request);
    
    
    /*********************************
    //отправляем Favicon
    app.use(express.favicon('public/images/favicon.ico'));

    //теперь вместо bodyParser() используются следующие две надстройки:
    app.use(express.json());
    app.use(express.urlencoded());
    
    //задаем парсер куков
    app.use(express.cookieParser());
    
    //express.cookieSession - храним все данные сессии в куках пользователя!
    //  поэтому обязательно надежно храним ключ "session:secret"
    app.use(express.cookieSession({
        key: config.get('session:key'),
        secret: config.get('session:secret'),
        cookie: config.get('session:cookie'),
        test: 0
    }));
    **********************************/
    
    var favicon = require('serve-favicon');
    var logger = require('morgan');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var session = require('cookie-session');
    
    app.use(favicon('public/images/favicon.ico'));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());
    app.use(cookieParser());
    app.use(session({
        keys: [config.get('session:key'),config.get('session:secret')],
        //secret: config.get('session:secret'),
        //cookie: config.get('session:cookie'),
        secureProxy: true // if you do SSL outside of node
    }));
    


    //user functions load: - загружаем все функции и проходим проверки пользователя
    require('./app_use/app_use.js')(app,express);

    

    //теперь задаем все роуты на вывод нужных страниц пользователю
    //app.use(app.router);
    require('../routes/routes.js')(app,express);
    require('../public/public.js')(app,express);



    
    // ------------------------------------------------------------------------
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
    // ------------------------------------------------------------------------
    
    //Error handing
    //app.use(errorHandler);
};

function log_request(req,res,next) {
    
    var req_n = a.server_info.request_number++;
    //var dump_options = {exclude: [/^req.socket/i,/^req.res.socket/i,/\._/,/\.connection\.parser/i,/req.client.parser/i]};
    //g.log.info(  g.mixa.dump.var_dump_node("req",req,dump_options)  );
    res.execute_info = { //сохраняем начальную информацию о запросе
        start_time : (new Date()).getTime(),  //время начала обработки запроса
        execute_time : function(time_end){ return g.mixa.str.time_duration_str(this.start_time,new Date());},
        url : req.originalUrl,
        method: req.method
    }
    g.log.info(req_n+": ["+req.method+"] "+req.originalUrl);
    
    next();
}