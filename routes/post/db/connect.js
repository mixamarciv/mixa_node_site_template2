console.log('load post database connect..');


var g  = require('../../../app.js');
var err_info = g.err.update;
var cfg = g.app_config;
var a = g.app_fnc;

var path_join = g.mixa.path.path_join;
//-------------------------------------------------------------
var arr_databases = [];
var map_databases = {};

var db_conn_config = {
    id: 1,
    name: "post_db",
    database: path_join( __dirname, './data1.fdb' ) ,
    host: '127.0.0.1',     // default
    port: 3050,            // default
    user: 'SYSDBA',        // default
    password: 'masterkey', // default
    role: null,            // default
    pageSize: 4096,        // default when creating database
    table_prefix: ""
};

add_database_config(db_conn_config);

db_conn_config.id       = 2;
db_conn_config.name     = 'АДминистрирование';
db_conn_config.database = path_join( __dirname, './data_adminnax.fdb' );
add_database_config(db_conn_config);

db_conn_config.id       = 3;
db_conn_config.name     = 'programming';
db_conn_config.database = path_join( __dirname, './data_programming.fdb' );
add_database_config(db_conn_config);

db_conn_config.id       = 4;
db_conn_config.name     = 'workdb';
db_conn_config.database = path_join( __dirname, './data_work.fdb' );
add_database_config(db_conn_config);

//-------------------------------------------------------------
function add_database_config(config) {
    var cfg = g.u.clone(config);
    if (!cfg.name) throw("undefined database name");
    if (!cfg.id)   throw("undefined database id");
    
    map_databases[cfg.name] = cfg;
    map_databases[cfg.id  ] = cfg;
    arr_databases.push(cfg);
}
function get_db_by_id(id_db,fn){

    var d = map_databases[id_db];
    if (!d){
        return fn(err_info(new Error(),'daatabase "'+id_db+'"not found'));
    }
    if(!d.connect){
        d.connect = g.db.connect.create_db_connect(d);
        d.connect.id_db = d.id;
    }
    
    d.connect.on_ready(function(err){
        if (err) return fn(err_info(err,'connect to daatabase "'+id_db+'" error'));
        fn(null,d.connect);
    });
}

//-------------------------------------------------------------


module.exports.map_conn = map_databases;
module.exports.arr_conn = arr_databases;

module.exports.get_db_by_id = get_db_by_id;

module.exports.get_db = function(req,res,fn){
    var id_db = req.param('id_db');
    if (!id_db) id_db = req.param('id_database');
    if (!id_db) id_db = req.param('db');
    if (!id_db) id_db = req.param('database');
    
    get_db_by_id(id_db,fn);
}

