console.log('load global functions..');


var global_app_var = {};
module.exports = global_app_var;


var g = global_app_var;

g.path = require('path');
g.fs   = require('fs');
g.util = require('util');
g.mixa = require('mixa_std_js_functions');


g.app_config = require('../config');
g.app_config.main_path = g.path.normalize(g.path.join(__dirname, '..'));
g.app_config.templates_path = g.path.normalize( g.path.join(__dirname, '..',g.app_config.get("templates:path")) );

g.log = require('./log_config.js')();




if(g.app_config.get('app_is_webserver')){
    g.app_fnc = {};
    a = g.app_fnc;
    
    a.render = require('./render/render.js');
    a.HttpError = require('./error/http_error.js');
    
    
    
    a.session = require('./session/session.js');
}



