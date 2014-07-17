var c  = require('../post_config.js');
var g  = c.g;
var a  = g.app_fnc;

var err_info = g.err.update;

var path_join = g.mixa.path.path_join;

var db_arr = c.db_arr;

function render(req,res,data) {
  if (!data) data = {};
  data.c = c;
  
  if (!data.post) {
    data.post = {};
    var post = data.post;
    post.new_post = req.param('new_post');
    post.id       = req.param('post_id');
    post.name     = req.param('post_name');
    post.text     = req.param('post_text');
    post.tags     = req.param('post_tags');
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
  
  if(req.param('delete')) data.legend = "Удаление записи";
  
  if(req.param('success')){
    if(req.param('delete')){
        data.success = "Запись успешно <b>УДАЛЕНА</b> <br> id:"+post.id+";  "+g.mixa.str.date_format('Y.M.D h:m:s');
        post.id = 0;
    }else{
        if (post.new_post){
            data.success = "Запись успешно <b>добавлена</b> <br> id:"+post.id+";  "+g.mixa.str.date_format('Y.M.D h:m:s');
        }else{
            data.success = "Запись успешно <b>сохранена</b> <br> id:"+post.id+";  "+g.mixa.str.date_format('Y.M.D h:m:s');
        }
    }
  }
  
  //g.log.error( "\npost render:\n"+g.mixa.dump.var_dump_node("post_rend",post,{}) );
  
  data.view_path = c.view_path;
  if (req.db) {
    data.id_db = req.db.id_db;
    data.db = req.db;
  }else{
    return c.render_select_db(req, res, data);
  }
  a.render( req, res, 'edit.ect', data );
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
        
        var is_save = req.param('post_save');
        var post_delete = req.param('post_delete');
        /*********
        g.log.error( "\npost render:\n"
                    +g.mixa.dump.var_dump_node("req.params",req.params,{})
                    +g.mixa.dump.var_dump_node("req.body"  ,req.body,  {})
                    +g.mixa.dump.var_dump_node("req.query" ,req.query, {})
                    );
        **********/
        if (is_save) return save_post(req, res);
        if (post_delete) return delete_post(req, res);
        load_post(req, res );
    });
  });
    
    
}

function save_post(req, res) {
  var post = {};
  post.new_post = 0;
  post.id   = req.param('post_id');
  post.name = req.param('post_name');
  post.text = req.param('post_text');
  post.tags = req.param('post_tags');
  
  var is_mass_posts = mass_save_posts_data(post, req, res);
  if (is_mass_posts) return;
  
  if (!post.id || post.id == 0 ) {
    post.new_post = 1;

    req.db.generator('app1_post_id',1,function(err,new_id){
        if(err) return render_error('query: get new gen id_post',err,req,res);
        post.id = new_id;
        save_post_next1(post, req, res);
    });
    return;
  }
  save_post_next1(post, req, res);
}

function delete_post(req, res) {
  var post = {};
  post.new_post = 0;
  post.id   = req.param('post_id');
  if (!post.id) {
    post.new_post = 1;
  }
  if (post.new_post) {
    if(err) return render_error('cant delete new post',new Error(),req,res);
  }
  post.delete_post = 1;
  post_is_success_delete(post, req, res);
  update_post_metadata(req, res, post, function(err,id_process){
          if (err) {
            return render_error('update_post_metadata error4',err,req,res);
          }
          render(req,res,{id_process:id_process});
  });
}

function prepare_text_for_save(s) {
  if (!s) return '';
  s = s.replace(/\'/g,"''");
  s = s + " ";
  return s;
}

function prepare_post(p) {
  p.text = prepare_text_for_save(p.text);
  p.name = prepare_text_for_save(p.name);
  p.tags = prepare_text_for_save(p.tags);
  
}

function save_post_next1(post, req, res, fn_mass) {
  var str = "";
  
  prepare_post(post);
  
  if(post.new_post){
    str = "INSERT INTO app1_post(id_post,name,text,tags) VALUES("+post.id+",'"+post.name+"','"+post.text+"','"+post.tags+"')";
  }else{
    str = "UPDATE app1_post SET name='"+post.name+"',text='"+post.text+"',tags='"+post.tags+"' WHERE id_post="+post.id;
  }
  
  //g.log.error( "\npost save:\n"+g.mixa.dump.var_dump_node("post_save",post,{}) );
  
  req.db.query(str,function(err,data){
      if(err){
        err.sql_string = str;
        if (fn_mass) fn_mass(err);
        return render_error('query: save post data',err,req,res);
      }
      if (fn_mass) return fn_mass(null,post);
      
      post_is_success_saved(post, req, res);
      update_post_metadata(req, res, post, function(err,id_process){
          if (err) {
            return render_error('update_post_metadata error2',err,req,res);
          }
          render(req,res,{id_process:id_process});
      });
  });
}

//---------------------------------------------------------------
//функция для удаления переводов строки внутри текста - что бы он прошел валидацию в eval
//  все переводы строки заменяются на <#br#>, после eval - преобразуются обратно
function mass_prepapre_text(str) {
  var new_str = "";
  var p = str.indexOf('"');
  while(p!=-1){
      new_str += str.substr(0,p);  //строка до "
      str = str.substr(p+1);
      
      p = str.indexOf('"');
      subtext = str.substr(0,p);   // строка от " до второй "
      str = str.substr(p+1);
      
      subtext = mass_prepare_subtext(subtext);
      new_str += '"'+subtext+'"';
      
      p = str.indexOf('"');
  }
  new_str += str;
  
  return new_str;
}

function mass_prepare_subtext(subtext) {
  if (!subtext || subtext.length==0) {
    return "";
  }
  subtext = subtext.replace(/\r\n/g,"\n");
  subtext = subtext.replace(/\n\r/g,"\n");
  subtext = subtext.replace(/\n/g,"<#br#>");
  return subtext;
}
function mass_reprepare_subtext(subtext) {
  if (!subtext || subtext.length==0) {
    return "";
  }
  subtext = subtext.replace(/<#br#>/g,"\n");
  return subtext;
}
function mass_prepare_post_to_save(p) {
  var post = {};
  
  if (g.u.isString(p)) {
    var text = mass_reprepare_subtext(p);
    post = mass_prepare_get_post_attr_from_text(text);
    post.new_post = 1;
    return post;
  }

  post.name = mass_reprepare_subtext(p.name);
  post.text = mass_reprepare_subtext(p.text);
  post.tags = mass_reprepare_subtext(p.tags);
  post.new_post = 1;
  return post;
}

//получаем название поста с первой строки текста или если строк больше 
function mass_prepare_get_post_attr_from_text(t) {
    if (!t || t.length==0 || !g.u.isString(t)) {
      return null;
    }
    var post = {};
    var Str = g.u.str;
    var lines = Str.lines(t);
    if (lines.length>1) {
      post.name = lines.shift();
      post.text = lines.join('\n');
    }else{
      var words = Str.words(t);
      post.name = words[0];
      post.text = t;
    }
    return post;
}

//
function mass_get_array_from_text(str, req, res) {
  var arr = [];
  try{
    arr = eval(str);
  }catch (e) {
    e.dump_msg_eval = g.mixa.dump.var_dump_node("errEval",e,{max_str_length:90000});
    render_error('eval error: ',e,req,res);
    return null;
  }
  return arr;
}

//функция проверки и подготовки текста для массового добавления записей
//для добавления нескольких записей должен быть задан текст вида:
//[ {name:"название",text:"текст",tags:"теги-необязательно"},{name:"название2",text:"текст обязательно в кавычках"}]
function mass_save_posts_data(post, req, res) {
    var Str = g.u.str;  //underscore.string
    var str = Str.trim(post.text);
    
    if (Str.startsWith(str,"[") && Str.endsWith(str,"]")) {
      ok = 1;
    }else{
      return 0;
    }
    
    str = mass_prepapre_text(str);
    var arr = mass_get_array_from_text(str, req, res);
    if (!arr) return 1;
    
    g.async.map(arr,function(arr_p,callback) {
        var post = mass_prepare_post_to_save(arr_p);
        if (post) {
            req.db.generator('app1_post_id',1,function(err,new_id){
                if (err) {
                    post.err_msg = "generate id error";
                    post.is_error = 1;
                    post.err = err;
                    return callback(null,post);
                }
                post.id = new_id;
                save_post_next1(post, req, res, function(err,s_post){
                    if (err) {
                        post.err_msg = "save post error";
                        post.is_error = 1;
                        post.err = err;
                    }
                    callback(null,post);
                });
            });
        }else{
            callback(null,{nothing:1,data:arr_p});
        }
    }, function(err,res_arr){
        var data = {};
        var errors = [];
        var arr_id = [];
        for(var i=0;i<res_arr.length;i++){
            var p = res_arr[i];
            if (p.nothing || p.is_error) {
                errors.push(p);
            }else{
                arr_id.push(p.id);
            }
        }
        if (errors.length) {
          data.error = 'Ошибка сохранены не все записи ('+errors.length+'/'+res_arr.length+')';
          data.html_dump_error = g.mixa.dump.var_dump_node("err_arr",errors,{max_str_length:90000});
        }
        
        update_post_metadata(req, res, arr_id, function(err,id_process){
            if (err) {
              if (data.error) {
                data.error += '<br> +Ошибка обновления метаданных';  
              }else{
                data.error = 'Ошибка обновления метаданных';  
              }
            }
            data.id_process = id_process;
            render(req,res,data);
        });
    });
    
    return 1;
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

function post_is_success_delete(post, req, res) {

  req.params['post_id'] = post.id;
  req.body  ['post_id'] = post.id;
  req.query ['post_id'] = post.id;
  
  req.params['delete'] = 1;
  req.params['success'] = 1;
}

function update_post_metadata(req, res, post, fn) {
  var options = {};
  options.id_db = req.db.id_db;
  if (!g.u.isArray(post)) {
    options.id_post = post.id;
    options.delete_post = post.delete_post;
  }else{
    options.arr_id_post = post; 
    options.delete_post = 0;
  }
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
    load_post_data(post,req,res,function(err,post_data){
        if(err) return render_error('load post data',err,req,res);
        render(req,res,{post:post_data});
    })
  }else{
    render(req,res,{post:post});
  }
  
}


function load_post_data(post,req,res,fn){
  var str = "SELECT name,text,tags FROM app1_post WHERE id_post="+post.id;
  req.db.query(str,function(err,rows){
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
      post.tags = row.tags;
      fn(null,post);
  });
}

