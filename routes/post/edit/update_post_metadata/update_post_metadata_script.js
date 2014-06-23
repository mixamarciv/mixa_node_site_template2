
var db = require('../../db/connect.js');

var g = null;
var a = null;
var u = null;
var err_info = null;
var update_status = null;
var fn_end_script = null;


function set_global_vars(data,fn) {
  g = data.g;
  a = data.app_fnc;
  u = g.u;
  err_info = g.err.update;
  update_status = data.app.update_status;
  fn_end_script = fn;
}

function error_end(err,msg) {
    if (err && err.err_msg && u.isArray(err.err_msg)) {
      msg = msg + ': '+err.err_msg[0];
    }
    update_status(msg,is_error=1);
    
    g.log.info( "\n statistika:\n"+g.mixa.dump.var_dump_node("statistika",statistika,{}) );
    
    g.log.error( "\n ERROR: "+msg+"\n"+g.mixa.dump.var_dump_node("err",err,{max_str_length:90000}) );
    fn_end_script();
}

var statistika = {}
function update_stat(table_name,oper_type) {
  if (!statistika[table_name]) statistika[table_name] = {};
  var t = statistika[table_name];
  
  if (!t[oper_type]) t[oper_type] = 1;
  else t[oper_type]++;
  
  if(table_name!='_sum_') update_stat('_sum_',oper_type);
  
  return t[oper_type];
}

module.exports = function(data,fn_end_app){
  set_global_vars(data,fn_end_app);
  update_status('success start app');
  
  g.log.info( "\napp options:\n"+g.mixa.dump.var_dump_node("data.app_options",data.app_options,{}) );
  
  if (!data.app_options || !data.app_options.run_options || !data.app_options.run_options.id_post) {
    return error_end(null,'app_options.run_options.id_post is undefined');
  }
  var id_post = data.app_options.run_options.id_post;
  
  update_status('connect to db');
  connect_to_db(function(){
    
    update_status('get post data');
    get_post_data(id_post,function(err,post_data){
        if ( err ) return error_end(err,'get_post_data error');

        g.log.info( "\npost_data:\n"+g.mixa.dump.var_dump_node("post_data",post_data,{}) );
        
        update_status('get post words');
        
        post_data.words = get_words_from_post_data(post_data);
        
        g.log.info( "\n post_data.words:\n"+g.mixa.dump.var_dump_node("post_data.words",post_data.words,{}) );
        
        
        update_status('save post words');
        save_post_words(post_data,function(err){
            if ( err ) return error_end(err,'save post words error');
            
            g.log.info( "\n statistika:\n"+g.mixa.dump.var_dump_node("statistika",statistika,{}) );
            
            update_status('end app');
            fn_end_script();
        });

    });
  });
}

function connect_to_db(fn) {
  db.on_ready(fn);
}

function get_post_data(id_post,fn) {
  str = "SELECT id_post,name,text,tags FROM app1_post WHERE id_post="+id_post;
  db.query(str,function(err,rows){
      if ( err ) {
        err.sql_string = str;
        return fn(err_info(err,'sql query: get post data'));
      }
      if ( rows.length==0 ) {
        return fn(err_info(err,'sql query: post(id_post='+id_post+') not found'));
      }
      var row = rows[0];
      if ( !row ) {
        return fn(err_info(err,'sql query: post(id_post='+id_post+') not found'));
      }
      fn(null,row);
  });
}

function get_words_from_post_data(post_data){
  var post_words = {};
  post_words.name = get_words_from_text(post_data.name);
  post_words.text = get_words_from_text(post_data.text);
  post_words.tags = get_words_from_text(post_data.tags);
  post_words.name_lower = get_lower_words(post_words.name);
  post_words.text_lower = get_lower_words(post_words.text);
  post_words.tags_lower = get_lower_words(post_words.tags);
  return post_words;
}

function get_lower_words(words) {
  var lower_words = {};
  for(var word in words){
    var lower_word = word;
    lower_word = lower_word.toLowerCase();
    if(!lower_words[lower_word]) lower_words[lower_word] = words[word];
    else lower_words[lower_word] += words[word];
  }
  return lower_words;
}
//----------------------------------------------------------------------------------------------
function get_words_from_text(text){
  var words = {};
  var re = new RegExp("\d{2,100}","g");
  re = /[^ \t\n\v\.,;\:\!\?\|'"`~\\@#№$%\^\&\[\]{}\(\)-\+\*\/=]{2,100}/g;
  
  //g.log.info( "\n================================================\n" );
  //g.log.info( "text: \"" +text+"\"");
  while ((arr = re.exec(text)) != null){
    //g.log.info( "\n"+g.mixa.dump.var_dump_node("arr",arr,{}) );
    var word = arr[0];
    if(!words[word]) words[word] = 1;
    else words[word]++;
  }
  //g.log.info( "\n"+g.mixa.dump.var_dump_node("words",words,{}) );
  //g.log.info( "\n================================================\n" );
  return words;
}
//----------------------------------------------------------------------------------------------


function save_post_words(post_data,fn) {
  var id_post = post_data.id_post;
  var words = post_data.words;
  
  //save_post_words_to_table(id_post,words.name,'app1_word_name','app1_word_name__post',fn);
  var arr = [
    {words:words.name,table_word:'app1_word_name',table_post_word:'app1_word_name__post'},
    {words:words.text,table_word:'app1_word_text',table_post_word:'app1_word_text__post'},
    {words:words.tags,table_word:'app1_word_tags',table_post_word:'app1_word_tags__post'},
    {words:words.name_lower,table_word:'app1_word_name_lower',table_post_word:'app1_word_name_lower__post'},
    {words:words.text_lower,table_word:'app1_word_text_lower',table_post_word:'app1_word_text_lower__post'},
    {words:words.tags_lower,table_word:'app1_word_tags_lower',table_post_word:'app1_word_tags_lower__post'},
  ];

  g.async.each(arr,function(param,callback) {
      save_post_words_to_table(id_post,param.words,param.table_word,param.table_post_word,function(err){
        if( err ) return callback(err_info(err,'save_post_words_to_table('+param.table_word+','+param.table_post_word+')'));
        callback();
      });
  }, function(err){
    if( err ) return fn(err_info(err,'save_post_words_to_table'));
    fn();
  });
  
}

function save_post_words_to_table(id_post,words,word_tb_name,post_words_tb_name,fn) {
  //var words_arr = g.u.keys(words);
  
  var str = "SELECT w.id_word,w.word,w.cnt AS word_cnt,p.id_post,p.cnt AS post_word_cnt \n"
           +"FROM "+post_words_tb_name+" p \n"
           +"  LEFT JOIN "+word_tb_name+" w ON w.id_word=p.id_word \n"
           +"WHERE p.id_post="+id_post;
  
  db.query(str,function(err,rows){
      if ( err ) {
          err.sql_string = str;
          return fn(err_info(err,'sql query: get post words'));
      }
      
      g.async.each(rows,function(row,callback) {
          var old_word = row.word;
          var old_cnt  = row.post_word_cnt;
          if (!words[old_word]) { //если уже нет этого слова в посте
              row.old_cnt = old_cnt;
              return meta_word_post_delete(id_post,row,word_tb_name,post_words_tb_name,callback);
          }
          
          var new_cnt  = words[old_word];
          if (new_cnt == old_cnt) { //если ничего не изменилось то ничего не обновляем
              words[old_word] == 0;
              delete words[old_word];
              update_stat(word_tb_name,'nochange');
              update_stat(post_words_tb_name,'nochange');
              return callback();
          }
          
          row.new_cnt = new_cnt;
          row.old_cnt = old_cnt;
          meta_word_post_update(id_post,row,word_tb_name,post_words_tb_name,callback);
        
          //больше эти слова нам не понадобятся
          words[old_word] == 0;
          delete words[old_word];
          
      }, function(err){
          if( err ) return fn(err_info(err,'words update error'));
          
          var words_arr = g.u.keys(words);
          if ( words_arr.length > 0 ) {
              g.log.info( "add new words..." );
              g.async.each(words_arr,function(word,callback) {
                  var cnt = words[word];
                  if (!cnt) return callback();
                  meta_word_post_add(id_post,word,cnt,word_tb_name,post_words_tb_name,function(err){
                    if(err) return fn(err_info(err,'meta_word_post_add(word:'+word+';id_post:'+id_post+')'));
                    callback(err);
                  });
              }, function(err){
                  if( err ) return fn(err_info(err,'words add error'));
                  fn();
              });
          }else{
              fn();
          }

      });
      
      
  });

}

function meta_word_post_add(id_post,word,cnt,word_tb_name,post_words_tb_name,fn) {
  meta_get_id_word(word,cnt,word_tb_name,function(err,new_id){
      var str2 = "INSERT INTO "+post_words_tb_name+"(id_post,id_word,cnt) VALUES("+id_post+","+new_id+","+cnt+")";
      db.query(str2,function(err,rows){
            if ( err ) {
                err.sql_string = str2;
                return fn(err_info(err,'sql query add_new_word cnt in table '+post_words_tb_name));
            }
            update_stat(post_words_tb_name,'insert');
            fn(null);
      });
  });
}

function meta_get_id_word(word,cnt,word_tb_name,fn) {
  var str0 = "SELECT id_word FROM "+word_tb_name+" WHERE word='"+word+"'";
  db.query(str0,function(err,rows){
      if(err){
        err.sql_string = str0;
        return fn(err_info(err,'sql for get id_word for add_new_word'));
      }
      if (rows.length>0) {
          var row = rows[0];
          var str = "UPDATE "+word_tb_name+" w SET w.cnt = w.cnt + "+cnt+" WHERE w.id_word="+row.id_word;
          db.query(str,function(err,rows){
              if ( err ) {
                err.sql_string = str;
                return fn(err_info(err,'sql query update word cnt in table '+word_tb_name));
              }
              update_stat(word_tb_name,'update');
              fn(null,row.id_word);
          });
      }else{
          db.generator(word_tb_name+"_ID",1,function(err,new_id){
              if(err) return fn(err_info(err,'sql get generator id for add_new_word'));
              var str = "INSERT INTO "+word_tb_name+"(id_word,word,cnt) VALUES("+new_id+",'"+word+"',"+cnt+")";
              db.query(str,function(err,rows){
                  if ( err ) {
                    err.sql_string = str;
                    return fn(err_info(err,'sql query add_new_word in table '+word_tb_name));
                  }
                  update_stat(word_tb_name,'insert');
                  fn(null,new_id);
              });
          });
      }
  });
}

function meta_word_post_update(id_post,row,word_tb_name,post_words_tb_name,fn) {
    var str = "UPDATE "+word_tb_name+" w SET w.cnt = w.cnt + "+(row.new_cnt-row.old_cnt)+" WHERE w.id_word="+row.id_word;
    db.query(str,function(err,rows){
            if ( err ) {
              err.sql_string = str;
              return fn(err_info(err,'sql query update word cnt in table '+word_tb_name));
            }
            update_stat(word_tb_name,'update');
            var str2 = "UPDATE "+post_words_tb_name+" p SET p.cnt = "+row.new_cnt+" WHERE p.id_word="+row.id_word+" AND p.id_post="+id_post;
            db.query(str2,function(err,rows){
                if ( err ) {
                  err.sql_string = str2;
                  return fn(err_info(err,'sql query update post word cnt in table '+post_words_tb_name));
                }
                update_stat(post_words_tb_name,'update');
                fn(null);
            });
    });
}

function meta_word_post_delete(id_post,row,word_tb_name,post_words_tb_name,fn) {
    var str = "DELETE FROM "+post_words_tb_name+" p WHERE p.id_word="+row.id_word+" AND p.id_post="+id_post;
    db.query(str,function(err,rows){
            if ( err ) {
              err.sql_string = str;
              return fn(err_info(err,'sql query delete post word cnt in table '+post_words_tb_name));
            }
            update_stat(post_words_tb_name,'delete');
            var str2 = "";
            if (row.word_cnt-row.old_cnt == 0) { //если это слово больше нигде не повторяется
              str2 = "DELETE FROM "+word_tb_name+" WHERE id_word="+row.id_word;
              update_stat(word_tb_name,'delete');
            }else{
              str2 = "UPDATE "+word_tb_name+" SET cnt = "+(row.word_cnt-row.old_cnt)+" WHERE id_word="+row.id_word;
              update_stat(word_tb_name,'update');
            }

            db.query(str2,function(err,rows){
                if ( err ) {
                  err.sql_string = str2;
                  return fn(err_info(err,'sql query update word cnt in table '+word_tb_name));
                }
                
                fn(null);
            });
    });
}


