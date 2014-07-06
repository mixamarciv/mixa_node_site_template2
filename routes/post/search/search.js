var c  = require('../post_config.js');
var g  = c.g;
var a  = g.app_fnc;
var err_info = g.err.update;

var path_join = g.mixa.path.path_join;

var db_arr = c.db_arr;

function render(req,res,data) {
  if (!data) data = {};
  
  if (!data.search) {
    data.search = req.param('search');
  }
 
  data.view_path = c.view_path;
  data.id_db = req.db.id_db;
  a.render( req, res, 'search.ect', data );
}

function render_error(msg,err,req,res,data) {
    err_info(err,msg);
    var html_dump_error = g.err.html_dump_for_error(err);
    render(req,res,{error:err.get_msg(),err:err,html_dump_error:html_dump_error});
}

module.exports = function(route_path,app,express){
  app.all(route_path,function(req, res){
    request(req, res);
  });
}

module.exports.request = request;
function request(req, res, next) {
    db_arr.get_db(req,res,function(err,db){
      if(err) return render_error('get db error',err,req,res);
      req.db = db;
      load_post_list(req, res,function(err,rows){
            if(err) return render_error('load post list',err,req,res);
            //g.log.error("SEARCH=="+req.param('search'));
            //g.log.error(rows);
            
            render(req,res,{rows:rows});
      });
    });
}


function get_sub_sql(table_name,options,arr_search) {
  
  var s = "SELECT SUM(wp.cnt) FROM "+table_name+" w \n";
  s    += "  LEFT JOIN "+table_name+"__post wp ON wp.id_word=w.id_word \n";
  s    += "WHERE wp.id_post=p.id_post \n   AND (";
  
  
  var begin_search_text = " w.word LIKE ";
  if (options.to_lower) begin_search_text += "LOWER";
  if (options.like_end) begin_search_text += "('%";
  else                  begin_search_text += "('";
  //begin_search_text == " w.word LIKE LOWER('%"
  
  var end_search_text = "";
  if (options.like_begin) end_search_text = "%";
  end_search_text += "')\n";
  //end_search_text == "%')\n"

  
  for(var i=0;i<arr_search.length;i++){
    if (i>0) {
      s += "  OR ";
    }
    s += begin_search_text + arr_search[i] + end_search_text ;
  }
  s += "  )";
  return s;


}

function get_search_words_arr(text) {
  var words = {};
  var re = null;
  re = /[^ \t\n\v\.,;\:\!\?\|'"`~\\@#№$%\^\&\[\]{}\(\)-\+\*\/=]{2,100}/g;
  
  while ((arr = re.exec(text)) != null){
    var word = arr[0];
    if(!words[word]) words[word] = 1;
    else words[word]++;
  }
  var arr = g.u.keys(words);
  return arr;
}

function load_post_list(req, res, fn) {
  var search = req.param('search');
  
  var cnt_words_select = " 0 AS tags_cnt, 0 AS name_cnt, 0 AS text_cnt \n";
  var cnt_words_where  = " 1=1 \n";
  var order_by = " ORDER BY date_modify DESC \n";
  
  if (search) {
    var options = {to_lower:1}
    var words_arr = get_search_words_arr(search);
    
    cnt_words_select  = " ("+get_sub_sql("app1_word_tags_lower",options,words_arr)+") AS tags_cnt,\n";
    cnt_words_select += " ("+get_sub_sql("app1_word_name_lower",options,words_arr)+") AS name_cnt,\n";
    cnt_words_select += " ("+get_sub_sql("app1_word_text_lower",options,words_arr)+") AS text_cnt \n";
    
    cnt_words_where  = " (tags_cnt > 0 OR name_cnt > 0 OR text_cnt > 0) \n";
    order_by = " ORDER BY tags_cnt*100+name_cnt*10+text_cnt DESC \n";
    
  }
  
  var sql = null;
  
  sql  = "SELECT id_post,name,text,tags,date_modify,tags_cnt,name_cnt,text_cnt FROM \n";
  sql += "(SELECT p.id_post,p.name,p.text,p.tags,p.date_modify,"+cnt_words_select+" FROM app1_post p)\n";
  sql += "WHERE "+cnt_words_where;
  sql += order_by;
  
  req.db.query(sql,function(err,rows){
      if(err){
        err.sql_query_error = sql;
        return fn(err_info(err,'sql query: get post list'));
      }
      fn(null,rows);
  });
}