var c  = require('../post_config.js');
var g  = c.g;
var a  = g.app_fnc;
var err_info = g.err.update;

var path_join = g.mixa.path.path_join;

var db_arr = c.db_arr;

function render(req,res,data) {
  if (!data) data = {};
  data.c = c;
  
  if (!data.search) {
    data.search = req.param('search');
  }
 
  data.view_path = c.view_path;
  if (req.db) {
    data.id_db = req.db.id_db;
    data.db = req.db;
  }else{
    return c.render_select_db(req, res, data);
  }
  
  if (data.ajax_query || req.param('ajax_query')) {
      return a.render( req, res, 'search_data.ect', data );
  }
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
      load_post_list(req, res,function(err,rows,options){
            if(err) return render_error('load post list',err,req,res);
            //g.log.error("SEARCH=="+req.param('search'));
            //g.log.error(rows);
            
            render(req,res,{rows:rows,options:options});
      });
    });
}

//функция возвращает подзапрос, который выдает количество повторений набранных слов в посте
function get_sub_sql(table_name,options) {
  var arr_search = options.words_arr;
  if (arr_search.length==0) {
    return 0;
  }
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
  
  //s += " AND (SELECT COUNT(*) FROM "+table_name+"__post WHERE )"
  return s;
}

//
var get_cnt_where_query = " \
  AND( 0<(SELECT COUNT(*) FROM app1_word_text#table# w \
            LEFT JOIN app1_word_text#table#__post pw ON pw.id_word=w.id_word \
          WHERE pw.id_post = p.id_post \
            AND w.word #search# \
          PLAN JOIN (PW INDEX (APP1_WORD_TEXT#table#__POST_IDX2), W INDEX (IDX_APP1_WORD_TEXT#table#_2)) \
         ) \
       OR \
        0<(SELECT COUNT(*) FROM app1_word_name#table# w \
            LEFT JOIN app1_word_name#table#__post pw ON pw.id_word=w.id_word \
          WHERE pw.id_post = p.id_post \
            AND w.word #search# \
          PLAN JOIN (PW INDEX (APP1_WORD_name#table#__POST_IDX2), W INDEX (IDX_APP1_WORD_name#table#_2)) \
         ) \
       OR \
        0<(SELECT COUNT(*) FROM app1_word_tags#table# w \
            LEFT JOIN app1_word_tags#table#__post pw ON pw.id_word=w.id_word \
          WHERE pw.id_post = p.id_post \
            AND w.word #search# \
          PLAN JOIN (PW INDEX (APP1_WORD_tags#table#__POST_IDX2), W INDEX (IDX_APP1_WORD_tags#table#_2)) \
         ) \
     ) \
";
function get_cnt_where(options) {
  var arr_search = options.words_arr;
  var s = get_cnt_where_query;
 
  
  var search_type = "";
  var table_type = "";
  if (options.to_lower){
    table_type = "_lower";
    if (options.like_begin )     search_type = " starts with LOWER('#word#') ";
    else if (options.like_end  ) search_type = " ends with LOWER('#word#') ";
    else                         search_type = " = LOWER('#word#') ";
  }else{
    table_type = "";
    if (options.like_begin )     search_type = " starts with '#word#' ";
    else if (options.like_end  ) search_type = " ends with '#word#' ";
    else                         search_type = " = '#word#' ";
  }

  s = s.replace(/#table#/g,table_type);
  s = s.replace(/#search#/g,search_type);
  var s_all = ' 1=1 \n';

  for(var i=0;i<arr_search.length;i++){
    var tmp = s;
    tmp = tmp.replace(/#word#/g,arr_search[i]);
    s_all += tmp;
  }
  return s_all;
}

//получаем параметр search_info из параметров options
function get_search_info(options) {
    var arr_search = options.words_arr;
    var search_info = "поиск записей со словами";
    if(options.to_lower) search_info += ", без учета регистра";
    
    var type_search = "";
    if(options.like_begin && options.like_end){
      type_search = ", содержащими текст";
    }else{
      if(options.like_begin) type_search = ", начинающимися на";
      if(options.like_end  ) type_search = ", оканчивающимися на";
    }
    search_info += type_search;
    
    if (arr_search.length==0) return "не задан текст для поиска";
    else if (arr_search.length==1){
      search_info += " \"" + arr_search[0] + "\"";
    }else{
      search_info += ": ";
      for(var i=0;i<arr_search.length;i++){
        if (i>0) search_info += ", ";
        var word = arr_search[i];
        search_info += "\"" + word + "\"";
      }
    }
    return search_info;
}


//функция возвращает words_arr - массив набранных пользователем слов для поиска
function get_search_words_arr(text) {
  
  var words = {};
  var re = null;
  text = text + " "; //регулярка работает только когда в конце пробел!
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
  var options = {to_lower:1,like_begin:1};
  if (search) {
    options.words_arr = get_search_words_arr(search);
    if (options.words_arr.length>0) {
        cnt_words_select  = " ("+get_sub_sql("app1_word_tags_lower",options)+") AS tags_cnt,\n";
        cnt_words_select += " ("+get_sub_sql("app1_word_name_lower",options)+") AS name_cnt,\n";
        cnt_words_select += " ("+get_sub_sql("app1_word_text_lower",options)+") AS text_cnt \n";
        
        cnt_words_where  = get_cnt_where(options); //" (tags_cnt > 0 OR name_cnt > 0 OR text_cnt > 0) \n";
        order_by = " ORDER BY tags_cnt*100+name_cnt*10+text_cnt DESC \n";
        
        options.search_info = get_search_info(options);
        //options = g.mixa.dump.var_dump_node("opt",options,{max_str_length:9000});
    }
  }
  
  var sql = null;
  
  sql  = "SELECT id_post,name,text,tags,date_modify,tags_cnt,name_cnt,text_cnt FROM \n";
  sql += "(SELECT p.id_post,p.name,p.text,p.tags,p.date_modify,"+cnt_words_select+" FROM app1_post p) p\n";
  sql += "WHERE "+cnt_words_where;
  sql += order_by;
  
  req.db.query(sql,function(err,rows){
      if(err){
        err.sql_query_error = sql;
        return fn(err_info(err,'sql query: get post list'));
      }
      fn(null,rows,options);
  });
}
