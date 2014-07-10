var c  = require('../post_config.js');
var g  = c.g;
var a  = g.app_fnc;

var err_info = g.err.update;

var path_join = g.mixa.path.path_join;

var db_arr = c.db_arr;

function render(req,res,data) {
  if (!data) data = {};
  
  data.view_path = c.view_path;
  if (req.db) {
    data.id_db = req.db.id_db;
  }
  a.render( req, res, 'view.ect', data );
}

function render_error(msg,err,req,res,data) {
    err_info(err,msg);
    var html_dump_error = g.err.html_dump_for_error(err);
    render(req,res,{error:err.get_msg(),err:err,html_dump_error:html_dump_error});
}

module.exports = function(route_path,app,express){
  
  app.all(route_path,function(req, res, next){
    db_arr.get_db(req,res,function(err,db){
      if(err) return render_error('get db error',err,req,res);
      req.db = db;
      
      var id_post = req.param('id_post');
      if (!id_post) id_post = req.param('post_id');
      if (!id_post) id_post = req.param('id');
      
      if (!id_post) {
        return render_error('post not select (not found id_post)',new Error(),req,res,{});
      }
  
      load_post(id_post, req, res );
    });
  });
    
    
}

function load_post(id_post, req, res) {
  var post = {id:id_post,name:"",text:""};

  load_post_data(post, req, res ,function(err,post_data){
        if(err) return render_error('load post data',err,req,res);
        render(req,res,{post:post_data});
  });
  
}

function load_post_data(post, req, res ,fn){
  var str = "SELECT name,text,tags FROM app1_post WHERE id_post="+post.id;
  req.db.query(str,function(err,rows){
      if(err){
        err.sql_query_error = str;
        return fn(err_info(err,'sql query: get post data'));
      }
      if (rows.length==0){
        err = new Error();
        err.sql_query_norows = str;
        return fn(err_info(err,'sql query: post not found (id_post:'+post.id+')'));
      }
      
      var row = rows[0];

      post.name = row.name;
      post.text = row.text;
      post.tags = row.tags;
      
      fn(null,post);
  });
  
}

