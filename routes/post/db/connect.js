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

