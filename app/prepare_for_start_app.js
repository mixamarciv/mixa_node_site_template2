console.log('load prepare_for_start_app..');
//подготавливаем к старту наше приложение, и убиваем все его предыдущие запущенные экземпляры
//pid предыдущих запущенных экземпляров определяется из файлов в папке /temp/app_pid
//после запуска сохраняем наш pid в /temp/app_pid

var g = require('./global.js');
var cfg = g.app_config;
var a = g.app_fnc;
var app_db = g.app_db;

module.exports = prepare_for_start_app;
if(!cfg.get('app_is_webserver')) module.exports = function(){g.log.warn("prepare_for_start_app.js call only for app webserwer!");} 


var temp_path = cfg.get('temp_path');
var temp_path_pid = g.path.join(temp_path,"/app_pid");

function prepare_for_start_app(fn) {
    /*var pfn = fn;
    fn = function(){
        g.path.mkdirp(cfg.get("log:app:filepath"),function(err,success){
            if (err || !success) {
                console.log(err);
                console.log("ERROR: can't create log path '"+cfg.get("log:app:filepath")+"'");
            }
            pfn();
        });
    }*/
    
    check_directory(temp_path_pid,function(err,dir_is_exists){
        if(!dir_is_exists) return 0;
        var list = g.fs.readdirSync(temp_path_pid);
        g.async.map(list,kill_this_process,function(err,result){
            if(err) g.log.error(err);
            save_new_pid_file(temp_path_pid);
            
            app_db.on_ready(function(){
                fn();    
            });
            
        });
    });
    
}

//проверяем существует ли заданная директория
function check_directory(path,fn) {
    if(g.fs.existsSync(path)){
        if(g.fs.statSync(path).isDirectory()) return fn(null,1);
        var msg = "path is not directory!:\n  "+path;
        g.log.error(msg);
        return fn(msg,0);
    }
    g.path.mkdirp(path,function(err){
        if(err){
            var msg = "can't create path:\n  "+path;
            g.log.error(msg);
            return fn(msg,0);
        }
        fn(null,1);
    });
}

function my_kill_process(pid,type) {
    try{
      process.kill(pid,type);
      return 0;
    } catch(err) {
      return err;
    }
}

function kill_this_process2(pid,callback) {
    var try_i = 0, try_success = 0;
    var kill_type_arr = [undefined,'SIGINT','SIGTERM','SIGKILL'];
    var err = [];
    for(var i in kill_type_arr){
        var has_error = my_kill_process(pid,kill_type_arr[i]);
        try_i++;
        if (!has_error){
            try_success = 1;
            break;
        }
        has_error.kill_signal = kill_type_arr[i];
        err.push(has_error);
    }
    if (try_success) {
        if(try_i>1) {
            var str = g.mixa.dump.var_dump_node('err',err);
            g.log.warn(str);
        }
        g.log.info("kill prev process pid: "+pid);
    }else
    if(try_i>1) {
        var str = g.mixa.dump.var_dump_node('err',err);
        g.log.error(str);
    }
    
    g.fs.unlink(g.path.join(temp_path_pid,pid),callback);
    /************
    var exec = require('child_process').exec;
    exec('taskkill /f /PID '+pid, function (error, stdout, stderr) {
        var msg = [stdout,stderr];
        g.log.warn("kill pid: "+pid);
        if (error !== null) {
          g.log.error("error kill prev webserver app (pid:"+pid+")");
          g.log.error(error);
        }
        g.fs.unlink(g.path.join(temp_path_pid,pid),callback);
    });
    ***********/
    
}

function kill_this_process(pid,callback) {
    var exec = require('child_process').exec;
    exec('taskkill /f /PID '+pid, function (error, stdout, stderr) {
        var msg = [stdout,stderr];
        g.log.warn("kill prev process pid: "+pid);
        if (error !== null) {
          g.log.error("error kill prev webserver app (pid:"+pid+")");
          g.log.error(error);
        }
        g.fs.unlink(g.path.join(temp_path_pid,pid),callback);
    });
}

function save_new_pid_file(path) {
    var exec = require('child_process').exec;
    var pid = String(process.pid);
    g.fs.writeFileSync(g.path.join(path,pid), g.mixa.str.date_to_str_format(new Date(),"Y.M.D  h:m:s"));
}
