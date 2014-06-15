var c  = require('../post_config.js');
var g  = c.g;
var a  = g.app_fnc;

var err_info = g.err.update;

var path_join = g.mixa.path.path_join;

var db = c.db;

function render(req,res,data) {
  if (!data) data = {};
  
  
  if (!data.post) {
    data.post = {};
    var post = data.post;
    post.new_post = req.param('new_post');
    post.id       = req.param('post_id');
    post.name     = req.param('post_name');
    post.text     = req.param('post_text');
    if(!post.new_post && !post.name && !post.text) {
      if (!data.error) return load_post(req, res);
    }
  }
  var post = data.post;
  
  if (post.new_post) {
    data.legend = "Добавление новой записи";
  }else{
    data.legend = "Редактирование записи";
  }
  
  if(req.param('success')){
    data.success = "Запись успешно сохранена <br> id:"+post.id+";  "+g.mixa.str.date_format('Y.M.D h:m:s');
  }
  
  g.log.error( "\npost render:\n"+g.mixa.dump.var_dump_node("post_rend",post,{}) );
  
  data.view_path = c.view_path;
  a.render( req, res, 'edit.ect', data );
}

function render_error(msg,err,req,res,data) {
    err_info(err,msg);
    var html_dump_error = g.err.html_dump_for_error(err);
    render(req,res,{error:msg,err:err,html_dump_error:html_dump_error});
}

module.exports = function(route_path,app,express){
  
  app.all(route_path,function(req, res, next){
    var is_save = req.param('post_save');
    g.log.error( "\npost render:\n"
                +g.mixa.dump.var_dump_node("req.params",req.params,{})
                +g.mixa.dump.var_dump_node("req.body"  ,req.body,  {})
                +g.mixa.dump.var_dump_node("req.query" ,req.query, {})
                );
    if (is_save) return save_post(req, res);
    load_post(req, res );
  });
    
    
}

function save_post(req, res) {
  var post = {};
  post.new_post = 0;
  post.id   = req.param('post_id');
  post.name = req.param('post_name');
  post.text = req.param('post_text');
  
  if (!post.id) {
    post.new_post = 1;
    db.generator('next_id_post',1,function(err,new_id){
        if(err) return render_error('query: get new gen id_post',err,req,res);
        post.id = new_id;
        save_post_next1(post, req, res);
    });
  }
  save_post_next1(post, req, res);
}

function save_post_next1(post, req, res) {
  var str = "";
  if(post.new_post){
    str = "INSERT INTO app1_post(id_post,name,text) VALUES("+post.id+",'"+post.name+"','"+post.text+"')";
  }else{
    str = "UPDATE app1_post SET name='"+post.name+"',text='"+post.text+"' WHERE id_post="+post.id;
  }
  
  g.log.error( "\npost save:\n"+g.mixa.dump.var_dump_node("post_save",post,{}) );
  
  db.query(str,function(err,data){
      if(err){
        err.sql_string = str;
        return render_error('query: save post data',err,req,res);
      }
      
      post_is_success_saved(post, req, res);
      update_post_metadata(req, res, post, function(err,id_process){
          if (err) {
            return render_error('update_post_metadata error2',err,req,res);
          }
          render(req,res,{id_process:id_process});
      });
  });
}

function post_is_success_saved(post, req, res) {
  req.params['new_post'] = 0;
  req.body  ['new_post'] = 0;
  req.query ['new_post'] = 0;

  req.params['post_id'] = post.id;
  req.body  ['post_id'] = post.id;
  req.query ['post_id'] = post.id;
  
  req.params['success'] = 1;

}

function update_post_metadata(req, res, post, fn) {
  var options = {};
  options.run_file = path_join(__dirname,'update_post_metadata/update_post_metadata_script.js');
  options.rr = {req:req,res:res};
  
  a.external_app.run_child_process2(options,function(err,p_data){
        if (err) {
          return render_error('update_post_metadata error1',err,req,res);
        }
        fn(null,p_data.id_process);
  });
}



function load_post(req, res) {
  var post = {new_post:1,id:0,name:"",text:""};
  post.new_post = req.param('new_post');
  post.id       = req.param('post_id');
  
  if (!post.id && !post.new_post) return render(req,res,{error:'select post for edit'});
  if (post.id){
    load_post_data(post,function(err,post_data){
        if(err) return render_error('load post data',err,req,res);
        render(req,res,{post:post_data});
    })
  }else{
    render(req,res,{post:post});
  }
  
}


function load_post_data(post,fn){
  var str = "SELECT name,text FROM app1_post WHERE id_post="+post.id;
  db.query(str,function(err,rows){
      if(err){
        err.sql_query_error = str;
        return fn(err_info(err,'sql query: get post data'));
      }
      if (rows.length==0){
        err = {};
        err.sql_query_norows = str;
        return fn(err_info(err,'sql query: post not found'));
      }
      
      var row = rows[0];

      post.name = row.name;
      post.text = row.text;
      fn(null,post);
  });
}

