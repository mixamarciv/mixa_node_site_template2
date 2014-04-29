console.log('load runner.js..');
//скрипт для запуска js-скрпта с загруженными данными главного приложения

var g = require('../../app/global.js');
var a = g.app_fnc;
var errf = g.err.show_error_and_callfn;

var config = g.app_config;
//var run_app = nconf.get("execute_app");
var app_db = g.app_db; 

var execFile = require('child_process').execFile;

module.exports.execute_app = function(execute_app){
    g.log.info('start external app: ' + execute_app);
    var app_options = {};
    app_options.id_process = execute_app;
    
    app_db.on_ready(function(err){
        if(err) return errf(app_exit,err,"connect app db ERROR!");
        get_app_data(app_options,function(err,app_options){
            app_exit();
        });
    });

}

function app_exit(){
    g.log.error('app EXIT');
    setTimeout(function(){
        process.exit(0);
    },10000);
}

function get_app_data(options,fn){
    var qstr =
     "SELECT p.id_program,p.app_name,p.app_file_path,s.id_user,s.run_options \n"
    +"FROM app_child_process s \n"
    +"  LEFT JOIN app_program p ON p.id_program=s.id_program \n"
    +"WHERE id_process="+options.id_process;
    app_db.query(qstr,function(err,rows){
        if (err) return errf(fn,err,"get child_process options ERROR: bad query send\n SQL: \n"+qstr);
        if (!rows || rows.length==0) {
            return errf(fn,(new Error()),"get child_process options ERROR: no rows in result\n SQL: \n"+qstr);
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
            if (err2) return errf(fn,err2,"JSON.parse run_options ERROR:\n"+run_options);
        }
        
        g.log.info('app options load:');
        g.log.dump_info('options',options);
        fn(null,options);
    });
}


function update_process_status__set_run_date_app(options,fn) {
    var qstr = "UPDATE app_child_process SET run_date_app=current_timestamp WHERE id_process="+options.id_process;
    app_db.query(qstr,function(err,data){
        if (err) return errf(fn,err,"update child_process status ERROR\n SQL: "+qstr);
        fn();
    });
}

