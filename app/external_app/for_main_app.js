console.log('load runner_main_app.js..');
//скрипт для запуска дочерних процессов из главного приложения

var g = require('../../app/global.js');
module.exports = g; 

var config = g.app_config;




var execFile = require('child_process').execFile;
var run_app_bat_file = g.path.join(config.main_path_full,"/run_app.bat");



module.exports.run_child_proccess = function(run_app_js_file,fn){
    g.log.info('execute external app: ' + run_app_js_file);
    
    run_app_bat_file = "node";
    var arr_params = ["app.js",run_app_js_file];
    var child_process = execFile(run_app_bat_file,arr_params,{},function(err,data){
       if(err){
            var dump_options = {exclude: [/^data.a$/,/^data.g$/]};
            g.log.error( "\nexecFile ERROR:\n"+run_app_js_file );
            g.log.dump_error("err",err,dump_options);
       }
       var d = {data:data,child_process:child_process,test:1};
       fn(err,d);
    });
}

//run_child_proccess2 - запускаем дочерний процесс..
//  параметры перечисляются в options
//  options.run_file (String) - файл который запускаем
//  options.run_file_rel_path (String) - оптимальный путь к запускаемому файлу (возможно относительный путь будет меньше)
//  options.arguments (array) - список параметров запуска этого файла
//  options.rr {req,res} - список параметров с данными тек ользователя и сессии
module.exports.run_child_proccess2 = function(options,fn){
    /*********
     * всегда, в любом случае запускается дочерний node app.js процесс
     * из этого процесса запускается нужный нам поддочерний процесс
     * а дочерний процесс собирает статус выполнения поддочернего процесса и пишет его в базу
     * в таком случае главный процесс не занимается слежкой за всеми дочерними процессами
     * и только в случае запроса возвращает статус нужного поддочернего процесса
     **********/
    
    var rr = options.rr; // {req,res}
    delete options.rr;
    
    if (!options.run_file_rel_path) {
        options.run_file_rel_path = get_min_rel_path(options.run_file);
    }
    
    run_app_bat_file = "node";
    var arr_params = ["app.js",run_app_js_file];
    var child_process = execFile(run_app_bat_file,arr_params,{},function(err,data){
       if(err){
            var dump_options = {exclude: [/^data.a$/,/^data.g$/]};
            g.log.error( "\nexecFile ERROR:\n"+run_app_js_file );
            g.log.dump_error("err",err,dump_options);
       }
       var d = {data:data,child_process:child_process,test:1};
       fn(err,d);
    });
}


function get_min_rel_path(path) {
    var rel_path = g.path.relative(path, g.app_config.main_path_full);
    if (path.length > rel_path.length && rel_path.length>3) {
        return rel_path;
    }
    return path;
}

