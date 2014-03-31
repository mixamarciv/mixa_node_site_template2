console.log('load runner_main_app.js..');
//скрипт для запуска из главного приложения - js-скриптов во внешнем дочернем процессе

var g = require('../../app/global.js');
module.exports = g; 

var config = g.app_config;




var execFile = require('child_process').execFile;
var run_app_bat_file = g.path.join(config.main_path_full,"/run_app.bat");



module.exports = function(run_app_js_file,fn){
    g.log.info('execute external app: ' + run_app_js_file);
    var child_process = execFile(run_app_bat_file,[run_app_js_file],{},function(err,data){
       if(err){
            var dump_options = {exclude: [/^data.a$/,/^data.g$/]};
            g.log.error( "\nexecFile ERROR:\n"+run_app_js_file );
            g.log.dump_error("err",err,dump_options);
       }
       var d = {data:data,child_process:child_process,test:1};
       fn(err,d);
    });
}
