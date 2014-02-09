console.log('load app_use.js..');
var g = require('../global.js');
var a = g.app_fnc;

module.exports = function(app,express){
    
    //g.log.info("load app_use functions..");
    
    //все заданные переменные res.locals - будут доступны в ejs шаблонах!
    //app.use(log_request);
    app.use(load_main_vars);
    app.use(a.session.visit);
    app.use(require('./send_http_error.js'));
    app.use(require('./load_user_data.js'));
    
}


function load_main_vars(req,res,next){
    res.locals.data = {}; //данные которые будут доступны далее в шаблоне
    res.locals.data.g = g;
    res.locals.data.a = a;
    next();
}

