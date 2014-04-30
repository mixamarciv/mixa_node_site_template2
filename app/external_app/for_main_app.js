console.log('load runner_main_app.js..');
//скрипт для запуска дочерних процессов из главного приложения

var g = require('../../app/global.js');
var a = g.app_fnc;
var errs = g.err.update_error_stack;

var config = g.app_config;
var app_db = g.app_db; 

var execFile = require('child_process').execFile;
var run_app_bat_file = g.path.join(config.main_path_full,"/run_app.bat");


var path_join = g.mixa.path.path_join;

module.exports.run_child_process = function(run_app_js_file,fn){
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
       fn(errs(err),d);
    });
}

//run_child_proccess2 - запускаем дочерний процесс..
//  параметры перечисляются в options
// !options.run_file (String) - файл который запускаем
//  options.run_file_rel_path (String) - оптимальный путь к запускаемому файлу (возможно относительный путь будет меньше)
//  options.arguments (array) - список параметров запуска этого файла
// !options.rr {req,res} - список параметров с данными тек ользователя и сессии
module.exports.run_child_process2 = function(options,fn){
    /*********
     * всегда, в любом случае запускается дочерний node app.js процесс
     * из этого процесса запускается нужный нам поддочерний процесс
     * а дочерний процесс собирает статус выполнения поддочернего процесса и пишет его в базу
     * в таком случае главный процесс не занимается слежкой за всеми дочерними процессами
     * и только в случае запроса возвращает статус нужного поддочернего процесса(из бд)
     **********/
    
    //var rr = options.rr; // {req,res}
    //delete options.rr;
    
    if (!options.run_file_rel_path) {
        options.run_file_rel_path = get_min_rel_path(options.run_file);
    }
    
    g.async.mapSeries([options.run_file,options.run_file_rel_path], g.fs.stat, function(err, results){
        if (err) {
            err.debug_msg = "\nrun_child_proccess ERROR: get fs.stat error for file:\n"+options.run_file+"\nAND file:\n"+options.run_file_rel_path;
            g.log.error( err.debug_msg );
            var dump_options = {exclude: [/^data.a$/,/^data.g$/]};
            g.log.dump_error("err",err,dump_options);
            return fn(errs(err),null);
        }

        if(!results[0].isFile()) {
            err = {};
            err.debug_msg = "\nrun_child_proccess ERROR: this is not file:\n"+options.run_file;
            return fn(errs(err),null);
        }
        if(!results[1].isFile()) {
            err = {};
            err.debug_msg = "\nrun_child_proccess ERROR: this is not file:\n"+options.run_file_rel_path;
            return fn(errs(err),null);
        }
        
        prepare_for_run_process(options,function(err,options){
            if(err) return fn(errs(err),null);
            run_process(options,fn);
        });
    });
    
}


function get_min_rel_path(path) {
    var rel_path = g.path.relative(config.main_path_full,path);
    rel_path = g.mixa.path.path_norm(rel_path);
    //rel_path = g.mixa.path.path_join(rel_path,"./"+g.path.basename(path));
    if (path.length > rel_path.length && rel_path.length>3) {
        return rel_path;
    }
    return path;
}

//записываем данные для запуска процесса в бд
function prepare_for_run_process(options,callback){
    /**********
    g.async.waterfall([
        function(callback)         { prepare_for_run_process__get_id_program(options,callback); },
        function(options2,callback){ prepare_for_run_process__get_id_child_process(options2,callback); }
    ],function(err,options){
        if(err) return fn(errs(err),null);
        fn(null,options);
    });
    ***********/
    prepare_for_run_process__get_id_program(options,function(err,options){
        if(err) return callback(errs(err),null);
        prepare_for_run_process__get_id_child_process(options,function(err,options){
            if(err) return callback(errs(err),null);
            callback(null,options);
        });
    });

}

function make_log_path(options,callback) {
    var path = path_join(config.main_path_full,config.get("log:child_process:filepath"));
    path = path_join(path,g.mixa.str.date_to_str_format('./YM/YMD/'+options.id_process+'_hm.k'));
    options.log_path = path;
    g.path.mkdirp(options.log_path,function(err,success){
        if (err) return callback(errs(err));
        g.log.info("mkdirp:"+options.log_path);
        callback(null,options);
    });
}

function prepare_for_run_process__get_id_program(options,callback){
    //g.log.dump_warn("arguments1",arguments,{exclude:[/\.rr/g]});
    
    var file = options.run_file_rel_path;
    
    var qstr = "SELECT id_program,app_name,app_file_path FROM app_program WHERE app_file_path='"+options.run_file+"'";
    app_db.query(qstr,function(err,rows){
        if (err) return callback(errs(err));
        if (!rows.length) {
            app_db.generator('NEW_ID_APP_PROGRAM',1,function(err,new_id){
                if (err) return callback(errs(err));
                options.id_program = new_id;
                var qstrins = "INSERT INTO app_program(id_program,app_name,app_file_path) VALUES("+new_id+",'"+file+"','"+options.run_file+"')";
                app_db.query(qstrins,function(err,data){
                    if (err) return callback(errs(err));
                    //app_db.query("COMMIT WORK",function(err){
                    //    if (err) return callback(errs(err));
                        callback(null,options);
                    //});
                });
            });
            return;
        }
        options.id_program = rows[0].id_program;
        callback(null,options);
    });
}

function prepare_for_run_process__get_id_child_process(options,callback){
    //g.log.dump_warn("arguments2",arguments,{exclude:[/\.rr/g]});
    
    app_db.generator('NEW_ID_APP_CHILD_PROCESS',1,function(err,new_id){
        if (err) return callback(errs(err));
        options.id_process = new_id;
        make_log_path(options,function(err,options){
            if (err) return callback(errs(err));
            var id_session = a.session.get_session_id(options.rr.req);
            var id_user = a.session.get_session_user(options.rr.req).id_user;
            var run_options = get_run_options(options);
            
            var qstrins = "INSERT INTO app_child_process(id_process,id_program,id_session,id_user,run_options) ";
            qstrins = qstrins + " VALUES("+options.id_process+","+options.id_program+",'"+id_session+"',"+id_user+",'"+run_options+"')";
            app_db.query(qstrins,function(err,data){
                if (err) return callback(errs(err),null);
                //app_db.query("COMMIT WORK",function(err){
                //    if (err) return callback(errs(err));
                    callback(null,options);
                //});
            });
        });
    });
}

function update_process_status__set_run_date_process(options,fn) {
    var qstr = "UPDATE app_child_process SET run_date_process=current_timestamp WHERE id_process="+options.id_process;
    app_db.query(qstr,function(err2,data){
        if (err2) {
            err2 = errs(err2);
            err2.debug_msg = "update child_process status ERROR\n SQL: "+qstr
            g.log.error( err2.debug_msg );
            g.log.dump_error("err2",err2,dump_options);
            return fn(err2);
        }
        fn();
    });
}

function get_run_options(options){
    var ro = g.u.omit(options,['id_process','rr','id_program']) //copy object options without keys..
    ro = JSON.stringify(ro);
    return ro;
}

function run_process(options,fn) {
    var run_app_bat_file = "node";
    var log_file = path_join(options.log_path,'process.log');
    var arr_params = ["app.js",options.id_process,'>>'+log_file/*,'2>&1'*/];
    
    var d = {data:{arr_params:arr_params,options:options},error:null};
    fn({},d);
    
    str = "node app.js "+options.id_process+">>"+log_file+" 2>&1";
    g.log.info("cpRUN: "+str);
    require('child_process').exec(str);
    update_process_status__set_run_date_process(options,function(){});
    return;
/*****
    var child_process = execFile(run_app_bat_file,arr_params,{},function(err,data){
        if(err){
            err = errs(err);
            err.debug_msg = "exec child process ERROR (id_process:"+options.id_process+")";
            var dump_options = {exclude: [/\.rr$/,/^data\.g$/]};
            g.log.error( err.debug_msg );
            g.log.dump_error("options",options,dump_options);
            g.log.dump_error("err",err,dump_options);
        }else{
            var qstr = "UPDATE app_child_process SET run_date_process=current_timestamp WHERE id_process="+options.id_process;
            app_db.query(qstr,function(err2,data){
                err2 = errs(err2);
                err2.debug_msg = "save child_process status ERROR\n SQL: "+qstr
                g.log.error( err2.debug_msg );
                g.log.dump_error("err2",err2,dump_options);
            });
        }
        //var d = {data:data,child_process:child_process,error:err};
        //fn(err,d);
    });
****/
}

