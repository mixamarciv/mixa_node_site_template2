//тут загружаем список всех роутов для статичных ресурсов
console.log("load render_menu.js..")
var g  = require('../../../../app.js');
var a  = g.app_fnc;
var path_join = g.mixa.path.path_join;

var string = g.u.str;


var main_menu = [];

module.exports = function render_menu(route_list,fn){
  //return fn(1); //нах
  
  route_list.sort(function(a,b){ return a.route_path > b.route_path });
  //g.log.error("route_list:\n" + g.mixa.dump.var_dump_node("list",route_list,{}));
  
  for(var i=0;i<route_list.length;i++){
    var item = route_list[i];
    var el = get_menu_element(item);
    var b = set_main_menu_element(main_menu,el);
    if (!b) {
        main_menu.push(el);
    }
  }
  
  write_to_file_menu(main_menu,'main_menu.ect',fn);

}


//проверяем является ли указанный пункт меню el одним из дочерних ранее загруженных пунктов меню 
function set_main_menu_element(menu,el) {
  //g.log.error("==============================================>>>\n"+g.mixa.dump.var_dump_node("menu",menu));
  if (menu.length == 0) {
    menu.push(el);
    return 1;
  }
  
  var fp = el.file;
  var rp = el.link; 
  for(var mname in menu){
    var t = menu[mname];
    var tfp = t.file;  //file path
    var trp = t.link;  // route path
    
    if( rp.indexOf(trp) == -1 ) continue;
    //далее если путь к текущему елементу является частью пути к родительскому элементу
    if(!t.subitems){
      if(t.no_autoload_subitems) return 1;
      t.subitems = [el];
      return 1;
    }else{
      //g.log.error("==============================================>>>\n"+g.mixa.dump.var_dump_node("menu",menu));
      var b = set_main_menu_element(t.subitems,el);
      if(b) return 1;
      
      //если не один из дочерних элементов не подошел под роль родительского то им будет текущий
      if(t.no_autoload_subitems) return 1; //если ему конечно не запрещено
      t.subitems.push(el);
      return 1;
    }
  }
  return 0;
}

//get_menu_element - получаем информацию по элементу меню, и возможно по его дочерним элементам
//элемент состоит из
// el = {name:'',link:route,file:path,subitems:[],no_autoload_subitems:0}
function get_menu_element(item) {
  var el = {};
  el.name = g.path.basename(item.route_path);
  el.link = item.route_path;
  el.file = g.mixa.path.path_norm( item.file );
  el.no_autoload_subitems = 0;

  //require(el.file).user_main_menu_item  - может быть функция, может быть и сам объект
  var user_menu_item = require(el.file).user_main_menu_item;
  if (user_menu_item) {
      if (g.u.isFunction(user_menu_item)) {
        user_menu_item = user_menu_item(item.route_path);
      }
      if (g.u.isObject(user_menu_item)) {
          if(user_menu_item.name) el.name = user_menu_item.name;
          if(user_menu_item.link) el.link = user_menu_item.link;
          if(user_menu_item.file) el.file = user_menu_item.file;
          if(user_menu_item.no_autoload_subitems) el.no_autoload_subitems = user_menu_item.no_autoload_subitems;
          if(user_menu_item.subitems) el.subitems = user_menu_item.subitems;
      }
  }


  return el;
}


function write_to_file_menu(menu,file_name,fn) {
  file_name = path_join(__dirname,file_name);
  
  var ect = require('ect');
  var renderer = ect({ watch: false, // — Automatic reloading of changed templates,
                                      //defaulting to false (useful for debugging with enabled cache, not supported for client-side)
                         //root: __dirname + '/views',
                       cache: false, // — Compiled functions are cached, defaulting to true
                       test : 1,
                    });
  
  var menu_html = get_menu_html(menu,"\t\t");
  var data = {menu:menu,menu_html:menu_html,g:g,a:a};
  /*************
  g.log.error("==========================================================\n   menu:\n"
              +g.mixa.dump.var_dump_node("menu",menu,{max_level:10})
              +"\n==========================================================");
  **************/
  var text = "";
  try {
      text = renderer.render(file_name, data);
  } catch(err) {
      var dump_options = {};
      g.log.error(err);
      g.log.error("ERROR menu render :\n" + g.mixa.dump.var_dump_node("err",err,dump_options));
      g.log.error("menu data:\n" + g.mixa.dump.var_dump_node("menu",menu,dump_options));
  }
  
  var new_file_name = file_name+".html";
  g.fs.writeFile(new_file_name, text, 'utf8', function(err){
    if(err) return fn(err);
    fn(null,new_file_name);
  });
}


function get_menu_html(menu,deep_str,deep_level) {
  if (!deep_level) {
    deep_level = 0;
  }
  var str = "";
  var cnt = menu.length;
  for(var i=0;i<cnt;i++){
    var el = menu[i];
    if(el.subitems && deep_level<1){
      str += deep_str+"<li class='dropdown'>\n";
      str += deep_str+"<a href=\"#\" class='dropdown-toggle' data-toggle='dropdown'>"+el.name+"<b class='caret'></b></a>\n";
      str += deep_str+"<ul class='dropdown-menu'>\n";
      str += deep_str+"\t\t<li><a href=\""+el.link+"\">"+el.name+"</a></li>\n";
      str += deep_str+"\t\t<li class='divider'></li>\n";
      str += get_menu_html(el.subitems,deep_str+"\t\t",deep_level+1);
      str += deep_str+"</ul>\n";
    }else{
      str += deep_str+"<li><a href=\""+el.link+"\">"+el.name+"</a></li>\n";
    }
  }
  return str;
}

function test_access(req,res,next) {
    //all public files need slid (short link id) or llid (long link id)
    if (a.session.get_session_vizit_count(req)>1) {
      var file = req.path;
      var ext = g.path.extname(file);
      if (ext=='.css') return css_files_send2(req,res,next);
      else if (ext=='.js') return js_files_send2(req,res,next);
    }
    if(!a.session.check_link_id(req,res)){
        //return a.render(req,res,'error.ect',{error:"no access to public (bad link id)"});
        //return res.sendHttpError("no access to public file");
        return a.send_http_error("no access to public file (not valid link id)",req,res);
    }
    return next();
}

/**************************************/
function css_files_send2(req,res,next) {
    var file = req.path;
    //if(g.path.basename(file) !== 'all.styles.min.css') return less_files_send(req,res,next);
    if(!string.endsWith(file,'all.styles.min.css')) return less_files_send(req,res,next);
    file = path_join(__dirname,file);
    check_exists_and_send_file(file,render_css_file_from_list_files,dev_render_always_css,req,res,next);
}
function js_files_send2(req,res,next) {
  var file = req.path;
  if(!string.endsWith(file,'all.scripts.min.js')) return next();
  file = g.path.join(__dirname,file);
  check_exists_and_send_file(file,render_js_file_from_list_files,dev_render_always_js,req,res,next);
}

function check_exists_and_send_file(file,render_from_list_fn,render_anyway,req,res,next) {
    g.fs.exists(file,function(exists){
        if(exists && dev_render_always==0 && render_anyway==0){
            //g.log.warn("send already exists file ["+file+"]");
            return res.sendfile(file);
        }else{
            g.log.warn("render & send file ["+req.path+"]");
            get_list_files(file,function(err,list_files){
                if (err) return a.send_http_error(err,req,res,next);
                render_from_list_fn(file,list_files,function(err){
                    if (err) return a.send_http_error(err,req,res,next);
                    //g.log.info("render new file: "+file);
                    res.sendfile(file);
                });
            });
        }
    });
}

function render_js_file_from_list_files(file,list_files,fn) {
    var UglifyJS = null;
    try{
      UglifyJS = require("uglify-js");
    }catch(err){
      g.err.update(err,'ERROR load module "UglifyJS" - start run_install.bat ');
      return fn(err);
    }
    
    var result = null;
    try{
      result = UglifyJS.minify(list_files,null);
    } catch(err) {
      g.err.update(err,{msg:'ERROR "UglifyJS.minify" - bad js scripts in files:',list_files:list_files});
      return fn(err);
    }
    
    write_render_data_to_file(file,result.code,fn);
}

function write_render_data_to_file(file,data,fn) {
    g.fs.writeFile( file, data, 'utf8', function(err){
        if(err){
            //err.info = 'ERROR writeFile "'+file+'" - no access to file or bad path';
            g.err.update(parseError,'ERROR writeFile "'+file+'" - no access to file or bad path');
            return fn(err);
        }
        fn(null,file);
    });
}

function render_css_file_from_list_files(file,list_files,fn) {
    var less = require('less');
    var parser = new(less.Parser);
    
    
    g.async.map(list_files,
      function(file,callback){
          g.fs.readFile(file, function (err, data) {
              if (err) {
                  g.err.update(err,'ERROR cant read file: '+file);
                  return callback(err);
              }
              callback(null,data);
          });
      },
      function(err, results){
          if (err) {
              g.err.update(err,{msg:'ERROR load data from files',files:list_files});
              return callback(err);
          }
          var less_data_str = results.join('\n');
          parser.parse(less_data_str, function (err, tree) {
              if (err) {
                g.err.update(err,{msg:"less parse error",less_data:less_data_str});
                return fn(err);
              }
              try{
                var css = tree.toCSS({
                            compress: 1,
                            yuicompress: 1,
                            sourceMap: []
                          });
                //if (dev_render_always) {
                //  css = '/*' + less_data_str + '\n*/\n\n'+css;
                //}
                css = str_delete_last_comment(css);
                write_render_data_to_file(file,css,fn);
              } catch(parseError) {
                g.err.update(parseError,"Parse ERROR");
                fn(parseError);
              }
          });
      }
    );
}

function str_delete_last_comment(str) {
  str = string.rtrim(str,'\n\r ');
  var len = str.length;
  if (str[len-1]=='/' && str[len-2]=='*') {
      var pos = str.lastIndexOf('/*');
      str = str.substring(0,pos);
  }
  return str;
}

function get_list_files(file,fn) {
  var list_file = file+'list';
  g.async.waterfall([
        function(callback){
          g.fs.exists(list_file,function(exists){
            if(exists){
              return callback(null, list_file);
            }
            callback('ERROR: list file not found ('+list_file+')');
          });
        },
        function(list_file, callback){
          g.fs.readFile(list_file, 'utf8', function(err, str){
            if (err){
              g.err.update(err,{msg:"read file error",file:list_file});
              return callback(err);
            }
            callback(null, str);
          });
        },
        function(list_file_str, callback){
          
          var d = {};
          d.this_path = g.path.dirname(list_file);
          d.path_join = g.mixa.path.path_join;
          
          eval_list_file_data(d,list_file_str,callback);
          
        }
    ], function (err, arr_list_files) {
        if(err){
          var dump_options = {exclude: [/^req.socket/i,/^req.res.socket/i,/\._/,/\.connection\.parser/i,/req.client.parser/i]};
          
          g.err.update(err,'get list files from file "'+list_file+'" error');
          g.log.info(  g.mixa.dump.var_dump_node("err",err,dump_options)  );
          return fn(err);
          //return a.send_http_error(err,req,res,next);
        }
        fn(null,arr_list_files);
  });
}

function eval_list_file_data(d,data,fn) {
    var arr_list_files = [];
    
    var this_path = d.this_path;
    var path_join = d.path_join;
    
    try{
      //получаем список файлов
      arr_list_files = eval(data);
    }catch(err){
      g.err.update(err,{msg:"EVAL error",data:data});
      return fn(err);
    }
    var new_arr = [];
    for(var i=0;i<arr_list_files.length;i++){
        var a = arr_list_files[i];
        if( a && g.u.isString(a) ){
            new_arr.push(a);
            continue;
        }
    }
    fn(null,new_arr);
}


function less_files_send(req,res,next) {
  var less = require('less');
  var file = req.path;
  //g.log.info("g.path.extname("+file+").toLowerCase()=="+g.path.extname(file).toLowerCase());
  if(g.path.extname(file) !== '.css') return next();

  file = g.path.join(__dirname,file);
  
  //g.log.info("fs.exists("+file+")");
  g.fs.exists(file,function(exists){
      if(exists && dev_render_always==0){
        return res.sendfile(file);
      }
      var css_file = file;
      var less_file = file.replace(/css$/i,'less');
      
      g.async.waterfall([
          function(callback){
            g.fs.exists(less_file,function(exists){
              if(exists) return callback(null, less_file);
              callback('ERROR: less file not found ('+less_file+')');
            });
          },
          function(less_file, callback){
            g.fs.readFile(less_file, 'utf8', function(err, str){
              if (err) return callback(err);
              callback(null, str);
            });
          },
          function(less_file_str, callback){
            var parser = new(less.Parser);

            parser.parse(less_file_str, function (err, tree) {
                if (err) { return callback(err); }
                try{
                  var css = tree.toCSS({
                      compress: 1,
                      yuicompress: 1,
                      sourceMap: []
                    });
                  callback(null,css);
                } catch(parseError) {
                  callback(parseError);
                }
            });
          },
          function(css_text, callback){
            var parser = new(less.Parser);
            g.fs.writeFile(css_file, css_text, 'utf8', function(err){
                if(err) return callback(err);
                callback(null,css_file);
            });
          }
      ], function (err, result_css_file_path) {
          var dump_options = {exclude: [/^req.socket/i,/^req.res.socket/i,/\._/,/\.connection\.parser/i,/req.client.parser/i]};
          
          if(err){
            g.log.info(  g.mixa.dump.var_dump_node("err",err,dump_options)  );
            //res.end(g.mixa.dump.var_dump_node("err",err,dump_options));
            return res.sendHttpError(err);
          }
          g.log.info("render new css file: "+result_css_file_path);
          res.sendfile(result_css_file_path);
          //g.log.info(  g.mixa.dump.var_dump_node("result",result,dump_options)  );
          //res.end(g.mixa.dump.var_dump_node("result",result,dump_options));
          
      });
  });
  
  //return res.end('что то пошло не так..');
}

function js_files_send(req,res,next) {
  var file = req.path;
  //g.log.warn("query file ["+g.path.basename(file)+"] ");
  if(g.path.basename(file) !== 'all.scripts.min.js') return next();
  
  file = g.path.join(__dirname,file);
  
  g.fs.exists(file,function(exists){
      if(exists && dev_render_always==0){
        //g.log.warn("send already exists file ["+file+"]");
        return res.sendfile(file);
      }else{
        g.log.warn("render & send file ["+file+"]");
        return render_min_js_file(file,req,res,next);
      }
  });
}

function render_min_js_file(file,req,res,next) {
  var js_min_file = file;
  var js_list_file = file.replace(/\.js$/i,'.jslist');
  g.async.waterfall([
        function(callback){
          g.fs.exists(js_list_file,function(exists){
            if(exists) return callback(null, js_list_file);
            callback('ERROR: .jslist file not found ('+js_list_file+')');
          });
        },
        function(js_list_file, callback){
          g.fs.readFile(js_list_file, 'utf8', function(err, str){
            if (err) return callback(err);
            callback(null, str);
          });
        },
        function(js_list_file_str, callback){
          var arr_list_files = [];
          
          {
            var this_path = g.path.dirname(js_min_file);
            var path_join = g.mixa.path.path_join;
            
            try{
              //получаем список файлов
              arr_list_files = eval(js_list_file_str);
            }catch(err){
              return callback(err);
            }
          }
          
          var UglifyJS = null;
          try{
            UglifyJS = require("uglify-js");
          }catch(err){
            return callback(err);
          }
          
          var result = null;
          try{
            result = UglifyJS.minify(arr_list_files,null);
          }catch(err){
            return callback(err);
          }
          
          callback(null,result.code);
          
        },
        function(js_code, callback){
          g.fs.writeFile(js_min_file, js_code, 'utf8', function(err){
              if(err) return callback(err);
              callback(null,js_min_file);
          });
        }
    ], function (err, result_js_min_file) {
        if(err){
          var dump_options = {exclude: [/^req.socket/i,/^req.res.socket/i,/\._/,/\.connection\.parser/i,/req.client.parser/i]};
          g.log.info(  g.mixa.dump.var_dump_node("err",err,dump_options)  );
          //res.end(g.mixa.dump.var_dump_node("err",err,dump_options));
          err.info = 'render min js file from list file error';
          err.file_error = __filename;
          return a.send_http_error(err,req,res,next);
        }
        g.log.info("render new js file: "+result_js_min_file);
        res.sendfile(result_js_min_file);
        //g.log.info(  g.mixa.dump.var_dump_node("result",result,dump_options)  );
        //res.end(g.mixa.dump.var_dump_node("result",result,dump_options));
  });
}
