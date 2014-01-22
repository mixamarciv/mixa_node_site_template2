console.log('load session..');
var g = require('../global.js');
var a = g.app_fnc;
var m = g.mixa;

//функции для работы с сессиями
module.exports = {
    visit: session_visit,
    end: session_end,
    check_link_id: check_link_id,
    link_id: gen_link_id,
}

function gen_link_id() {
    var r = m.int.get_random_int(100,100*1000);
    
}

//задаем сессию +отмечаем визит
function session_visit(req,res,next){
    g.log.info("session_visit ..");
    req.session.count = req.session.count || 0;
    if(req.session.count==0){
        req.session.lsid = m.int.get_random_int(Number.MAX_VALUE/2,Number.MAX_VALUE-10);
    }
    req.session.count++;
    next();
}

//уничтожаем сессию:
function session_end(req,res,callback){
    g.log.info("session_end ..");
    if(typeof req.session.destroy == 'function'){
        req.session.destroy(function(err) {
            callback(err);
        });
        return;
    }
    req.session = null;
    delete req.session;
    callback();
}
