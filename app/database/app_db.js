console.log('load app database..');
//загрузка скриптов для подключения и работой с бд

var g = require('../global.js');
var cfg = g.app_config;
var a = g.app_fnc;


var app_db_functions = {};
var app_db_conn = null;  
module.exports = app_db_functions;

var fb = require("node-firebird");

var app_conndb_config = cfg.app_conndb_config;
  

fb.attach(app_conndb_config,function(err,db_conn){
    if (err) {
        g.log.error("connect to app_DB error:");
        g.log.dump_error("app_conndb_config",app_conndb_config);
        g.log.dump_error("err",err);
        return 0;
    }
    app_db_conn = db_conn;
    app_db_conn.is_connected = 1;
    g.log.info("connect to app_DB complete )");
});


app_db_functions.query = function query(query_str,result_function/*(err,rows)*/,options){

    app_db_conn.query(query_str,function(err,rows){
        if (err) {
            g.log.error("query to app_DB error:");
            g.log.dump_error("app_conndb_config",app_conndb_config);
            g.log.dump_error("err",err);
            g.log.error("query_str ("+query_str.length+") = \n"+query_str);
            return result_function(err);
        }
        result_function(null,rows);
    });
}

app_db_functions.close = function close(){
    app_db_conn.disconnect();
    return 1;
}

app_db_functions.generator = function generator(gen_name,inc_val,result_function){
    var query_str = "SELECT gen_id("+gen_name+","+inc_val+") FROM rdb$database";
    app_db_conn.query(query_str,function(err,rows){
        if (err) {
            g.log.error("generator query to app_DB error:");
            g.log.dump_error("err",err);
            g.log.error("generator query_str("+query_str.length+") = \n"+query_str);
            return result_function(err);
        }
        var id = rows[0][0];
        result_function(null,id);
    });
}