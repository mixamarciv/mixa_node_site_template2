console.log('load app_use.js..');
var g = require('../global.js');
var a = g.app_fnc;

module.exports = function(app,express){
    
    //g.log.info("load app_use functions..");
    
    //все заданные переменные res.locals - будут доступны в ejs шаблонах!
    //app.use(log_request);
    app.use(load_main_vars);
    app.use(a.session.visit);
    //app.use(require('./send_http_error.js'));
    app.use(require('./load_user_data.js'));
    app.use(check_query);
}



function load_main_vars(req,res,next){
    res.locals.data = {}; //данные которые будут доступны далее в шаблоне
    
    res.locals.data.g = g;
    res.locals.data.a = g.app_fnc;
    res.locals.data.ip = get_ip(req,res);
    
    res.locals.data.this_url_path = get_url_path(req.originalUrl);
    
    
    next();
}

function get_url_path(url) {
    var p = url;
    if (p.length == 0) return "/";
    p = p.substr(0,p.indexOf('?'));
    
    if (p.length == 0) return "/";
    //if (p[p.length-1]=='/') return p;
    //var p = g.path.dirname(p);
    //if(p=='') p = '/';
    return p;
}

function check_query(req,res,next){
    //тут выполняем проверки на валидность запроса..
    var req_path = req.path;
    if(req_path.match(/\.\.\//)){
        return a.send_http_error("not valid http path: "+req_path,req,res);
    }
    
    var test = req.query['test'];
    if (test) {
        return res.send_http_error("check_query test: "+test,req,res);
    }
    next();
}

function get_ip(req,res) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return ip;
}
