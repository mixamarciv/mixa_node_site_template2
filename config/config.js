var path  = require('path'),
    nconf = require('nconf');


nconf.argv()
     .env()
     .file({ file: path.join(__dirname,'/config.json') });
     
     
var args = process.argv;
if(args.length<=2){
    nconf.set("app_is_webserver",1); //флаг, что приложение запущено как веб сервер
}else{
    nconf.set("app_is_webserver",0);
    nconf.set("execute_app",args[2]); //какое приложение запускаем
}

path.sep = '/';
//console.log("path.sep = "+path.sep);

//полный путь к root директории приложения
nconf.main_path_full     = path.normalize( path.join(__dirname, '/../') ).replace(/\\/g,'/');



//параметры для шаблонов
nconf.templates_cfg = {};
t = nconf.templates_cfg;

//относительный путь к каталогу с шаблонами
t.templates_path_web = path.normalize( nconf.get("templates:path") ).replace(/\\/g,'/');

//полный путь к каталогу с шаблонами
t.templates_path_dir = path.normalize( path.join( nconf.main_path_full , t.templates_path_web )  ).replace(/\\/g,'/'); 

//полный путь к каталогу с элементами шаблонов
t.template_elemenets_path_dir = path.normalize( path.join( t.templates_path_dir , "/template_elements" )  ).replace(/\\/g,'/');

//полный путь к views каталогу
t.views_path_dir    = path.normalize( path.join( nconf.main_path_full ,'/views/' ) ).replace(/\\/g,'/');  

console.log("  templates_path: "+t.templates_path);


nconf.filenavigator_cfg = require('./filenavigator_cfg.js');


module.exports = nconf;






