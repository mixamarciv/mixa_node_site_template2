var path  = require('path'),
    nconf = require('nconf');

function path_norm(arg) {
    //path.sep = '/'; - установка этого параметра ничего не меняет (кроме самого параметра)
    //console.log("path.sep = "+path.sep);
    return path.normalize( arg ).replace(/\\/g,'/');
}
function path_join(arg1,arg2) {
    return path_norm( path.join( arg1,arg2 ) );
}

nconf.argv()
     .env()
     .file({ file: path_join( __dirname, '/config.json') });
     
     
var args = process.argv;
if(args.length<=2){
    nconf.set("app_is_webserver",1); //устанавливаем флаг, что приложение запущено как веб сервер
}else{
    nconf.set("app_is_webserver",0);
    nconf.set("execute_app",args[2]); //какое приложение запускаем
}



//полный путь к root директории приложения
nconf.main_path_full     = path_join( __dirname, '/../');

var temp_path = nconf.get("temp_path");
if(!temp_path) temp_path = "./temp";
temp_path = path_join( nconf.main_path_full, temp_path);
nconf.set( "temp_path", temp_path);

//параметры для шаблонов
nconf.templates_cfg = {};
var t = nconf.templates_cfg;

//относительный путь к каталогу с шаблонами
t.templates_path_web = path_norm( nconf.get("templates:path") );

//полный путь к каталогу с шаблонами
t.templates_path_dir = path_join( nconf.main_path_full, t.templates_path_web ); 

//полный путь к каталогу с элементами шаблонов
t.template_elemenets_path_dir = path_join( t.templates_path_dir, "/template_elements" );

//полный путь к views каталогу
t.views_path_dir    = path_join( nconf.main_path_full,'/views/' );  

//console.log("  templates_path: "+t.templates_path_web);


nconf.filenavigator_cfg = require('./filenavigator_cfg.js');


//параметры подключения к бд приложения
nconf.app_conndb_config = {
    database: path_join( __dirname, '../db/app_db1.fdb' ) ,
    host: '127.0.0.1',     // default
    port: 3050,            // default
    user: 'SYSDBA',        // default
    password: 'masterkey', // default
    role: null,            // default
    pageSize: 4096,        // default when creating database
    table_prefix: ""
};


module.exports = nconf;






