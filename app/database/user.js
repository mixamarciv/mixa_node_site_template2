console.log('load user..');
var g = require('../global.js');
var a = g.app_fnc;
var m = g.mixa;
var cfg = g.app_config;

//функции для работы с пользователями
module.exports = {
    visit: user_visit,
    logout: user_logout,
    login: require("./auth.js"),
    gen_link_id: gen_link_id,
}


//отмечаем визит
function user_visit(req,res,next){
    g.log.info("user_visit ..");

    
    next();
}

//уничтожаем сессию:
function user_logout(req,res,callback){
    g.log.info("user_logout ..");
    if(typeof req.session.destroy == 'function'){
        req.session.destroy(function(err){
            callback(err);
        });
        return;
    }
    req.session = null;
    delete req.session;
    callback();
}
