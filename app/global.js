console.log('load global functions..');
//тут объявляем все глобальные переменные которые используются практически во всех модулях
//!порядок подключения модулей НЕ МЕНЯТЬ

var global_app_var = {};
module.exports = global_app_var;


var g = global_app_var;

g.u = require('underscore');
g.u.str = require('underscore.string');

g.async = require('async');
g.path = require('path');
g.path.mkdirp = require('mkdirp');

g.fs   = require('fs');
g.util = require('util');
g.mixa = require('mixa_std_js_functions');

g.err  = require('./error/error.js');

g.app_config = require('../config/config.js');



g.log = require('./log_config.js')();
g.app_db = require('./database/app_db.js');

g.app_fnc = {};
a = g.app_fnc;


//a.programs_runner = require('./programs_runner/runner.js');
a.external_app = require('./external_app/load4extapp.js');

if(g.app_config.get('app_is_webserver')){
    a.server_info = {
        request_number: 0 //количество запросов к серверу
    };
    a.session = require('./session/session.js');

    a.render = require('./render/render.js');
    a.HttpError = require('./error/http_error.js');
    
}

//подключаем модуль для обмена сообщениями между процессами
//g.exchange = require('./exchange_data/exchange.js'); 


