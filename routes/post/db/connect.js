console.log('load post database connect..');


var g  = require('../../../app.js');
var cfg = g.app_config;
var a = g.app_fnc;

var path_join = g.mixa.path.path_join;
//-------------------------------------------------------------
var db_conn_config = {
    database: path_join( __dirname, './data1.fdb' ) ,
    host: '127.0.0.1',     // default
    port: 3050,            // default
    user: 'SYSDBA',        // default
    password: 'masterkey', // default
    role: null,            // default
    pageSize: 4096,        // default when creating database
    table_prefix: ""
};
//-------------------------------------------------------------

db_conn_config.name = "post_db";
module.exports = g.db.connect.create_db_connect(db_conn_config);

/*******************
var db_functions = {};
var db_conn = {is_connected:0};

module.exports = db_functions;

var fb = require("node-firebird");

var db_ready_functions_list = [];      //функции выполняется при установке подключения к бд
var db_ready_function = function(){
    for(var i=0;i<db_ready_functions_list.length;i++) {
        var fn = db_ready_functions_list[i];
        fn(arguments);
    }
    db_ready_functions_list = [];
};  

fb.attach(db_conn_config,function(err,p_db_conn){
    if (err) {
        g.log.error("connect to DB post error:");
        g.log.dump_error("db_conn_config",db_conn_config);
        g.log.dump_error("err",err);
        db_ready_function(err);
        return 0;
    }
    db_conn = p_db_conn;
    db_conn.is_connected = 1;
    g.log.info("connect to DB post complete )");
    db_ready_function();
});

db_functions.on_ready = function(fn){
    if (db_conn.is_connected){
        return fn();
    }else{
        db_ready_functions_list.push(fn);
    }
}

db_functions.query = function query(query_str,result_function,options){
    db_conn.query(query_str,function(err,rows){
        if (err) {
            err.query = query_str;
            //err.stack = new Error().stack;
            g.log.error("query to DB post error:");
            g.log.dump_error("db_conn_config",db_conn_config);
            g.log.dump_error("err",err);
            g.log.error("query_str ("+query_str.length+") = \n"+query_str);
            return result_function(err);
        }
        result_function(null,rows);
    });
}

db_functions.close = function close(){
    db_conn.disconnect();
    return 1;
}

db_functions.generator = function generator(gen_name,inc_val,result_function){
    var query_str = "SELECT gen_id("+gen_name+","+inc_val+") AS new_id FROM rdb$database";
    db_conn.query(query_str,function(err,rows){
        if (err) {
            err.query = query_str;
            err.stack = new Error().stack;
            g.log.error("generator query to DB post error:");
            g.log.dump_error("err",err);
            g.log.error("generator query_str("+query_str.length+") = \n"+query_str);
            return result_function(err);
        }
        var id = rows[0].new_id;
        result_function(null,id);
    });
}
**********************/