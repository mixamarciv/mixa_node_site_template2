console.log('load runner.js..');

var g = require('../../app/global.js');

if(g.app_config.get('app_is_webserver')){
    module.exports = require('./for_main_app.js');
}else{
    module.exports = require('./for_external_app.js');
}

