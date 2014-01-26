console.log('load express..');

var g  = require('./global.js');
var gf = g.app_fnc; 


var HttpError = require('./error/http_error.js');


module.exports = function (app, express) {
    
    //test.get_info('express_config run');
    //test.set_var_value('express_config2');
    
    var path = g.path,
        config = g.app_config;
        //mongoose = require('../utils/mongoose'),
        //MongoStore = require('connect-mongo')(express),

    var router = require('../routes');
    
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


    //отправляем Favicon
    app.use(express.favicon('public/images/favicon.ico'));

    
    if (app.get('env') == 'development') {
        //app.use(express.logger('dev'));
    }


    

    //теперь вместо bodyParser() используются следующие две надстройки:
    app.use(express.json());
    app.use(express.urlencoded());
    
    
    
    //задаем парсер куков
    app.use(express.cookieParser());
    
    /**********
    //задаем параметры хранения сессии
    //express.session - используется всегда после express.cookieParser
    app.use(express.session({
        secret: config.get('session:secret'),
        key: config.get('session:key'),
        cookie: config.get('session:cookie'),
        //store: new MongoStore({mongoose_connection: mongoose.connection})
        test: 0
    }));
    ************/
    
    //express.cookieSession - храним все данные сессии в куках пользователя! поэтому обязательно надежно храним ключ "session:secret"
    app.use(express.cookieSession({
        key: config.get('session:key'),
        secret: config.get('session:secret'),
        cookie: config.get('session:cookie'),
        test: 0
    }));
    

    //user functions load: - загружаем все функции и проходим проверки пользователя
    require('./app_use/app_use.js')(app,express);


    //теперь задаем все роуты на вывод нужных страниц пользователю
    //app.use(app.router);
    require('../routes')(app);



    
    // ------------------------------------------------------------------------
    //задаем функцию обработки ошибок, она должна идти последней в списке app.use
    //обязательно должна получать 4 параметра, argument1 == next(argument1)
    app.use(function(err,req,res,next){
        g.log.info('http error catch');
        if(typeof err == 'number'){
            err = new gf.HttpError(err);
        }
        
        if(err instanceof gf.HttpError){
            //return express.errorHandler()(err,req,res,next);
            return res.sendHttpError(err);
        }
        return express.errorHandler()(err,req,res,next);
    });
    // ------------------------------------------------------------------------
    
    //Error handing
    //app.use(errorHandler);
};