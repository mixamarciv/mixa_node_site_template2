var c  = require('./process_info_config.js');
var g  = c.g;
var a  = g.app_fnc;
var err_info = g.err.update;

var path_join = g.mixa.path.path_join;

var db = c.db;

module.exports = request;

function request(req, res){
    load_process_info(req, res,function(err,data){
          if(err){
            
            return render_error('load process info',err,req,res);
          }
          //g.log.error("id_process=="+req.param('id_process'));
          //g.log.error(rows);
          
          render(req,res,data);
    });
}

function render_error(msg,err,req,res,data) {
    err_info(err,msg);
    var html_dump_error = g.err.html_dump_for_error(err);
    render(req,res,{error:err.get_msg(default_msg='undefined error'),err:err,html_dump_error:html_dump_error});
}

function render(req,res,data) {
  if (!data) data = {};
  
  data.view_path = c.view_path;
  a.render( req, res, 'process_info_view.ect', data );
}

function load_process_info(req, res, fn) {
  
  var id_process = req.param('id_process');
  if (!id_process) {
    return fn(err_info(new Error(),'undefined id_process'));
  }
  
  var sql = "SELECT p.id_session,p.id_user,p.run_options, "
           +" p.create_date,p.run_date_process,p.run_date_app,p.end_date_app, "
           +" pr.id_program, pr.app_name, pr.app_file_path, pr.description AS app_description, "
           +" pr.create_date AS app_create_date "
           +" FROM app_child_process p "
           +" LEFT JOIN app_program pr ON pr.id_program=p.id_program "
           +"WHERE id_process="+id_process;
  
  db.query(sql,function(err,rows){
      if (err) {
        err.sql_query_error = sql;
        return fn(err_info(err,'sql query: get process data'));
      }
      var row = rows[0];
      if (!row) {
        return fn(err_info(new Error(),'process not found (id_process='+id_process+')'));
      }
      
      try {
          row.run_options = JSON.parse(row.run_options);
      } catch(err) {
          row.run_options_is_error = 1;
          row.run_options = 'JSON.parse ERROR: '+row.run_options;
      }
      
      if (!row.run_options_is_error) {
        row.run_options.log_file = path_join(row.run_options.log_path,'process.log');
      }
      
      row.id_process = id_process;
      load_process_status(req, res, row, fn);
  });
}

function load_process_status(req, res, data, fn) {
  var sql = "SELECT p.percent_execute,p.note,p.create_date,p.is_error "
           +" FROM app_child_process_status p WHERE id_process="+data.id_process
           +" ORDER BY p.create_date,p.n_order ";
  
  db.query(sql,function(err,rows){
      if (err) {
        err.sql_query_error = sql;
        return fn(err_info(err,'sql query: get process status'));
      }
      data.status = rows;
      fn(null,data);
  });
}









