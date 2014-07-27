var c  = require('./process_info_config.js');
var g  = c.g;
var a  = g.app_fnc;
var err_info = g.err.update;

var path_join = g.mixa.path.path_join;

var db = c.db;

function render(req,res,data) {
  if (!data) data = {};
  data.c = c;
  
  data.search = req.param('search');
 
  data.view_path = c.view_path;
  if (data.ajax_query || req.param('ajax')) {
      return a.render( req, res, 'search_data.ect', data );
  }
  a.render( req, res, 'search.ect', data );
}

function render_error(msg,err,req,res,data) {
    err_info(err,msg);
    var html_dump_error = g.err.html_dump_for_error(err);
    render(req,res,{error:err.get_msg(),err:err,html_dump_error:html_dump_error});
}


module.exports = request;
function request(req, res, next) {
    load_process_list(req, res,function(err,rows,options){
            if(err) return render_error('load process list',err,req,res);
            //g.log.error("SEARCH=="+req.param('search'));
            //g.log.error(rows);
            
            render(req,res,{rows:rows,options:options});
    });
}


function load_process_list(req, res, fn) {
  var search = req.param('search');
  if (!search) search = '';
  
  var options = {};
  
  options.page = get_page_n(req);
  options.url_page_next = 'search='+encodeURIComponent(search)+'&page='+(options.page+1),
  options.url_page_prev = 'search='+encodeURIComponent(search)+'&page='+(options.page-1),
  
  options.show_records = 10;
  options.skip_records = options.show_records * (options.page-1);

                     
  var where_query = "";
  if (search) {
    where_query = "  AND pr.app_name LIKE '"+search+"%' \n";
  }
  var show_records = options.show_records + 1;
  var sql = "SELECT FIRST "+show_records+" SKIP "+options.skip_records
           +" p.id_session,p.id_user,p.run_options,p.id_process, "
           +" p.create_date,p.run_date_process,p.run_date_app,p.end_date_app, "
           +" pr.id_program, pr.app_name, pr.app_file_path, pr.description AS app_description, "
           +" pr.create_date AS app_create_date "
           +" FROM app_child_process p "
           +" LEFT JOIN app_program pr ON pr.id_program=p.id_program "
           +"WHERE 1=1 \n"
           +where_query+"\n"
           +"ORDER BY p.create_date DESC";
           
  db.query(sql,function(err,rows){
      if(err){
        err.sql_query_error = sql;
        return fn(err_info(err,'sql query: get process list'));
      }
      fn(null,rows,options);
  });
}

function get_page_n(req) {
  var page   = req.param('page');
  if (!page){
    page = 1;
  }else{
    if (String(page).match(/^\d*$/g)) {
      page = Number(page);
    }
  }
  return page;
}