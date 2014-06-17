console.log('load runner.js..');
//скрипт для запуска js-скрпта с загруженными данными главного приложения

var g = require('../../app/global.js');
var a = g.app_fnc;

var config = g.app_config;
//var run_app = nconf.get("execute_app");
var app_db = g.app_db; 

var execFile = require('child_process').execFile;

var app_options = null;

//функция для обработки ошибок
function errf(err,msg,fn) {
    g.err.show_error_and_callfn(err,msg,function(){
        update_app_status(msg,1,fn);
    });
}

function update_app_status(msg,is_error,fn) {
    if(!app_options || !app_options.id_process) return errf(new Error(),"ERROR app_options not loaded.",fn);
    if(g.u.isFunction(is_error)) {
        fn = is_error;
        is_error = 0;
    }else{
        if(!is_error) is_error = 0;
        else  is_error = 1;
    }
    var qs = "INSERT INTO app_child_process_status(id_process,note,is_error)"
    +" VALUES("+app_options.id_process+",'"+msg+"',"+is_error+")";
    app_db.query(qs,function(err,data){
        if (err) return errf(err,"ERROR update child_process status: bad query SQL: \n"+qs,fn);
        fn(null);
    });
}

module.exports.exit = app_exit;
module.exports.update_status = update_app_status;

module.exports.execute_app = function(id_app){
    g.log.info('prepare to start external app: ' + id_app);
    app_options = {id_process:id_app};
    
    module.exports.execute_app = null;
    delete module.exports.execute_app; 
    
    app_db.on_ready(function(err){
        if(err) return errf(err,"connect app db ERROR!",app_exit);
        g.log.info("load app data..");
        get_app_data(app_options,function(err,loaded_options){
            if (err) return errf(err,"get app options ERROR! exit..",app_exit);
            g.log.info("execute app..");
            app_options = loaded_options;
            
            execute_app(app_options,function(err){
                if (err) return errf(err,"execute app ERROR!",app_exit);
                app_exit();
            });
            
        });
    });

}


function execute_app(app_options,fn) {
    var file = app_options.run_file;
    var ext = g.path.extname(file).toLowerCase();
    g.log.info("app type: "+ext);
    if (ext == '.js') {
        execute_app_js(app_options,fn);
    }else{
        execute_app_external(app_options,fn);
    }
}


function execute_app_js(app_options,fn) {
    var data = {
        app_options:app_options,
        g:g,
        app:module.exports
    };
    update_process_status__set_run_date_app(app_options,function(err){
        g.log.info("run js file: "+app_options.run_file);
        try{
            require(app_options.run_file)(data,fn);
        }catch(err){
            return errf(err,"require js file error",fn);
        }
    });
}


function execute_app_external(app_options,fn) {
    g.log.info("run external file: "+app_options.run_file);
    fn();
}


function app_exit(){
    g.log.info('app EXIT');
    update_process_status__set_end_date_app(app_options,function(){
        process.exit(0);
    })
    
}


function get_app_data(options,fn){
    var qstr =
     "SELECT p.id_program,p.app_name,p.app_file_path,s.id_user,s.run_options \n"
    +"FROM app_child_process s \n"
    +"  LEFT JOIN app_program p ON p.id_program=s.id_program \n"
    +"WHERE id_process="+options.id_process;
    app_db.query(qstr,function(err,rows){
        if (err) return errf(err,"get child_process options ERROR: bad query send\n SQL: \n"+qstr,fn);
        if (!rows || rows.length==0) {
            return errf((new Error()),"get child_process options ERROR: no rows in result\n SQL: \n"+qstr,fn);
        }
        var row = rows[0];
        options.id_program   = row.id_program;
        options.app_name     = row.app_name;
        options.run_file     = row.app_file_path;
        options.id_user      = row.id_user;
        var run_options      = row.run_options;
        try {
            options.run_options = JSON.parse(run_options);
        }catch(err2){
            if (err2) return errf(err2,"JSON.parse run_options ERROR:\n"+run_options,fn);
        }
        
        g.log.info('app options load:');
        g.log.dump_info('options',options);
        fn(null,options);
    });
}


function update_process_status__set_run_date_app(options,fn) {
    var qstr = "UPDATE app_child_process SET run_date_app=current_timestamp WHERE id_process="+options.id_process;
    app_db.query(qstr,function(err,data){
        if (err) return errf(err,"update child_process status ERROR\n SQL: "+qstr,fn);
        fn();
    });
}


function update_process_status__set_end_date_app(options,fn) {
    var qstr = "UPDATE app_child_process SET end_date_app=current_timestamp WHERE id_process="+options.id_process;
    app_db.query(qstr,function(err,data){
        if (err) return errf(err,"update child_process status ERROR\n SQL: "+qstr,fn);
        fn();
    });
}

