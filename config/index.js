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


module.exports = nconf;






