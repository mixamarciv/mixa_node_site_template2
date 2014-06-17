var c  = require('../process_info_config.js');
var g  = c.g;
var a  = g.app_fnc;
var err_info = g.err.update;

var path_join = g.mixa.path.path_join;

var db = c.db;

function render(req,res,data) {
  if (!data) data = {};
  
  if (!data.search) {
    data.search = req.param('search');
  }
 
  data.view_path = c.view_path;
  a.render( req, res, 'list.ect', data );
}

function render_error(msg,err,req,res,data) {
    err_info(err,msg);
    var html_dump_error = g.err.html_dump_for_error(err);
    render(req,res,{error:msg,err:err,html_dump_error:html_dump_error});
}

module.exports = function(route_path,app,express){
  app.all(route_path,function(req, res){
    request(req, res);
  });
}

module.exports.request = request;
function request(req, res, next) {
    load_post_list(req, res,function(err,rows){
          if(err) return render_error('load post list',err,req,res);
          g.log.error("SEARCH=="+req.param('search'));
          g.log.error(rows);
          
          render(req,res,{rows:rows});
    });
}



function load_post_list(req, res, fn) {
  var search = req.param('search');
  var sql = "SELECT p.id_post,p.name,p.text FROM app1_post p WHERE 1=1";
  sql += " AND UPPER(p.name) LIKE UPPER('"+search+"%')";
  db.query(sql,function(err,rows){
      if(err){
        err.sql_query_error = sql;
        return fn(err_info(err,'sql query: get post list'));
      }
      fn(null,rows);
  });
}