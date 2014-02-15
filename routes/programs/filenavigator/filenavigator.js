//вывод списка файлов в каталоге
var g  = require('../../../app.js');
var a  = g.app_fnc;

var fcfg = g.app_config.filenavigator_cfg ;

var default_path = g.path.join(__dirname,'../../../').replace(/\\/g,'/');

module.exports = function(route_path,app,express){
  
  app.get(route_path,function(req, res, next){
    
    req.route_path = route_path;
    
    if(!req.query['L']) req.query['L'] = default_path;
    if(!req.query['R']) req.query['R'] = default_path;
    
    get_panels_info(req,function(err,data){
      
        if (g.mixa.type.class_of(data).toLowerCase()=='string') {
          return res.sendfile(data);
        }

        if (!data) data = {};

        data.view_path = __dirname;
        data.error = err;
        
        a.render( req, res, 'filenavigator.ect', data );
    });
    
    
  });
}


function get_panels_info(req,fn) {
    var path_L = req.query['L'];
    var path_R = req.query['R'];
    
    g.async.map([path_L,path_R],chek_path_is_file,function(err,result){
        if(err){
            return fn(err);
        }

        for(var i in result){
          //если в одной из панелей выбран файл то отправляем его:
          if(result[i]) return fn(null,result[i]);
        }
        load_files_list(req,fn);
    });
}

function escapeHtml(text) {
  return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

function load_files_list(req,fn) {
    var path_L = req.query['L'];
    var path_R = req.query['R'];

    g.async.map([path_L,path_R],get_files_list,function(err, results){
        if (err) return fn(err);
        var data = {};
        data.d = results;
        data.l_files_list = get_files_list_html(req,'L',results[0]);
        data.r_files_list = get_files_list_html(req,'R',results[1]);

        fn(null,data);
    });
}

function chek_path_is_file(path,callback) {
  check_path(path,function(err,dir){
      if(err){
          err.debug_info = "check_path error ("+path+")";
          err.debug_stack = err.stack;
          return callback(err);
      }
      g.fs.stat(path,function(err,stat){
          if(err){
              err.debug_info = "fs.stat error ("+path+")";
              err.debug_stack = err.stack;
              return callback(err);
          }
          if (stat.isFile()) {
            return callback(null,path);
          }
          callback(null,0);
      });
  })
}

function get_files_list_html(req,L_or_R,data) {
  if (!data || !data.path || !data.files_info) {
      var err = new Error();
      err.data = data;
      err.debug_info = "get_files_list_html error: undefined data";
      err.debug_stack = err.stack;
      return "<pre>"+g.util.inspect(err).replace(/\\n/g,'\n')+"</pre>";
  }


  var path_L = req.query['L'];
  var path_R = req.query['R'];

  var fpath = g.path.normalize(data.path).replace(/\\/g,'/')+'/';
  var files = data.files_info;
  try{
    files.sort(function(a,b){
        if(a.isDirectory() && b.isFile())
          return -1; 
        if(a.isFile() && b.isDirectory())
          return 1 
        if(a.name < b.name)
          return -1;
        if(a.name > b.name)
          return 1;
        return 0
    });
  }catch(err){
    err.debug_info = "sort files list error";
    err.debug_stack = err.stack;
    return "<pre>"+g.util.inspect(err).replace(/\\n/g,'\n')+"</pre>";
  }
  
  var html = "";
  var link_begin = req.route_path+"?";
  if(L_or_R=='L'){
    link_begin += "R="+path_R+"&L=";
  }else{
    link_begin += "L="+path_L+"&R=";
  }
  
  var link = link_begin + g.path.normalize( g.path.join(fpath,'..') ).replace(/\\/g,'/');
  html += "\n<a href=\""+link+"\"> <b>[ .. ]</b> </a>";
  for(var i in files) {
    var file = files[i];
    //console.log("file.name="+file.name);
    var link = link_begin + fpath + file.name;
    var name = file.name;
    if (file.isDirectory()) {
      name = '<b>[ ' + name + ' ]</b>';
    }
    html += "\n<a href=\""+link+"\">"+name+"</a>";
  }
  return html;
}


function is_exclude_path(path) {
  path = path.replace(/(\\|\\\\|\/\/)/g,'/');
  for(var i in fcfg.exclude_path){
    var re = fcfg.exclude_path[i];
    if(re.test(path)) return re;
  }
  return 0;
}

//функция выдает список файлов, с информацией по каждому
//из каталога path (dir или любой доступный его родительский каталог)
//результат : {path:path,files_info:files_info}
function get_files_list(dir,fn) {
  g.async.waterfall([
      function (callback) { //check_path
          check_path(dir,function(err,dir){
              if(err){
                  err.debug_info = "check_path error";
                  err.debug_stack = err.stack;
                  return callback(err);
              }
              callback(null,dir);
          });
      },
      function (path,callback) { //readdir
          var re;
          if (re = is_exclude_path(path)) {
            return callback(null,path,['exclude : '+re.toString()]);
          }
          
          g.fs.readdir(path,function(err,files){
              if(err){
                  err.debug_info = "readdir error";
                  err.debug_stack = err.stack;
                  return callback(err);
              }
              callback(null,path,files);
          });
      },
      function (path,files,callback) { //read files info
          var files_info = [];

          g.async.map(files,
          function(file,callback2){
              var file_path = path+'/'+file;
              g.fs.stat(file_path,function(err,stat){
                  if (err) {
                      err.debug_info = "fs.stat error";
                      err.debug_stack = err.stack;
                      err.name = file;
                      err.isDirectory = function(){return 0;}
                      err.isFile = function(){return 0;}
                      files_info.push( err );
                      return callback2(null);
                  }
                  stat.name = file;
                  files_info.push( stat );
                  callback2(null);
              });
          },
          function(err, results){ 
              if (err) {
                  err.debug_info = "read files stat error";
                  err.debug_stack = err.stack;
                  return callback(err);
              }
              callback(null,path,files_info);
          });
      },
  ],function(err,path,files_info){
      if (err) {
        return fn(err);
      }
      fn(null,{path:path,files_info:files_info});
  });
}

function check_path(dir,fn) {
  if(g.mixa.type.class_of(dir).toLowerCase()!='string'){
      var err = new Error("check_path error, dir is not string");
      err.dir_type = g.mixa.type.class_of(dir);
      err.dir_data = g.util.inspect(dir);
      err.debug_stack = err.stack;
      return fn(err);
  }
  g.fs.exists(dir,function(exists){
      if (exists) {
        return fn(null,dir);
      }else{
        if (dir=='/' || (g.path.sep=='\\' && dir.length<=3)) {
            return check_path(default_path,fn);
        }
        dir = g.path.dirname(dir);
        return check_path(dir,fn);
      }
  });
}

