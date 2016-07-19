//вывод списка файлов в каталоге
var g  = require('../../../app.js');
var a  = g.app_fnc;

var fnf = require('./filenavigator_fnc.js');


var path_join = g.mixa.path.path_join;
var path_norm = g.mixa.path.path_norm;

module.exports.load = function load(req,path_T,fn){
  
  if(fnf.is_exclude_path(path_T.path)){
    return fn("ERROR: "+path_T.path+" is Exclude!");
  }
  
  g.fs.stat(path_T.path,function(err,stat){
      if (err) {
          err.debug_info = "fs.stat error";
          err.debug_stack = err.stack;
          err.file_path = path_T.path;
          return fn(err);
      }
      stat.file_path = path_T.path;
      var s = get_html_view_file(req,path_T,stat);
      fn(null,s);
  });
  
  return 0;
}

function get_html_view_file(req,path_T,stat) {
  var s = "";
  var dump_options = {exclude: [/^data.a$/,/^data.g$/]}
  s += "<a href="+fnf.get_link_to_path(req,path_T,"..")+"><b>[ .. ]<b></a>\n";
  s += "<div class=file_info>\n";

  for (var key in stat) {
    
    if (g.u.indexOf(['atime','ctime','mtime'],key) != -1) {
      s += "<span>"+key+": "+g.mixa.str.date_to_str_format(stat[key],'Y.M.D h:m:s.k')+"</span>\n";
    }
    if (g.u.indexOf(['size','file_path'],key) != -1) {
      s += "<span>"+key+": "+stat[key]+"</span>\n";
    }
  }
  s += "</div>\n";
  
  var rout_dl_file = path_join(req.route_path,"/download_file")+"?file="+path_norm(path_T.path);
  s += "<a href="+rout_dl_file+"> <b> скачать <b> "+g.path.basename(path_T.path)+" </a>\n";
  
  var rout_run_file = path_join(req.route_path,"/execute_file")+"?file="+path_norm(path_T.path);
  s += "<a href="+rout_run_file+"> <b> запустить <b> "+g.path.basename(path_T.path)+" </a>\n";
  
  s += "<pre>"+ g.mixa.dump.var_dump_node("stat",stat,dump_options) + "</pre>";
  return s;
}



