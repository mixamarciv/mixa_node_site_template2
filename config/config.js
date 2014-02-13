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
console.log("path.sep = "+path.sep);

nconf.main_path_full = path.normalize(path.join(__dirname, '/../'));
nconf.templates_path = path.normalize( nconf.get("templates:path") ).replace(/\\/g,'/');  //относительный путь к каталогу с шаблонами
nconf.templates_path_full = path.normalize(  path.join( nconf.main_path_full , nconf.templates_path )  );
nconf.views_path_full = path.normalize( path.join( nconf.main_path_full ,'/views/' ) );

console.log("templates_path: "+nconf.templates_path);

module.exports = nconf;






