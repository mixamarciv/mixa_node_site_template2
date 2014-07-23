var c  = require('../post_config.js');
var g  = c.g;
var a  = g.app_fnc;

var err_info = g.err.update;

var path_join = g.mixa.path.path_join;

var db_arr = c.db_arr;

function render(req,res,data) {
  if (!data) data = {};
  data.c = c;
  
  data.legend = "Реиндексирование записей БД  "+req.db.name;
  //g.log.error( "\npost render:\n"+g.mixa.dump.var_dump_node("post_rend",post,{}) );
  
  data.view_path = c.view_path;
  if (req.db) {
    data.id_db = req.db.id_db;
    data.db = req.db;
  }else{
    return c.render_select_db(req, res, data);
  }
  a.render( req, res, 'reindex.ect', data );
}

function render_error(msg,err,req,res,data) {
    err_info(err,msg);
    var html_dump_error = g.err.html_dump_for_error(err);
    render(req,res,{error:msg,err:err,html_dump_error:html_dump_error});
}

module.exports = function(route_path,app,express){
  
  app.all(route_path,function(req, res, next){
    db_arr.get_db(req,res,function(err,db){
        if(err) return render_error('get db error',err,req,res);
        req.db = db;
        
        var is_start = req.param('start');
        /*********
        g.log.error( "\npost render:\n"
                    +g.mixa.dump.var_dump_node("req.params",req.params,{})
                    +g.mixa.dump.var_dump_node("req.body"  ,req.body,  {})
                    +g.mixa.dump.var_dump_node("req.query" ,req.query, {})
                    );
        **********/
        if (is_start) return start_reindex(req, res);
        render(req,res);
    });
  });
}


function start_reindex(req,res,fn){
  var str = "SELECT id_post FROM app1_post WHERE 1=1 ORDER BY date_modify";
  req.db.query(str,function(err,rows){
      if(err){
        err.sql_query_error = str;
        return fn(err_info(err,'sql query: get posts id list'));
      }
      if (rows.length==0){
        err = {};
        err.sql_query_norows = str;
        return fn(err_info(err,'sql query: post not found'));
      }
      
      var post_id_arr = [];
      for(var i=0;i<rows.length;i++){
        var row = rows[i];
        post_id_arr.push(row.id_post);
      }
      update_post_metadata(req, res, post_id_arr, function(err,id_process){
          if (err) {
            return render_error('update_post_metadata error2',err,req,res);
          }
          data = {post_list: post_id_arr.join(', ')};
          data.id_process = id_process;
          render(req,res,data);
      });

  });
}


function update_post_metadata(req, res, post_id_arr, fn) {
  var options = {};
  options.id_db = req.db.id_db;
  options.arr_id_post = post_id_arr; 
  options.delete_post = 0;
  options.run_file = path_join(__dirname,'../edit/update_post_metadata/update_post_metadata_script.js');
  options.rr = {req:req,res:res};

  a.external_app.run_child_process2(options,function(err,p_data){
        if (err) {
          return render_error('update_post_metadata error1',err,req,res);
        }
        fn(null,p_data.id_process);
  });
}


