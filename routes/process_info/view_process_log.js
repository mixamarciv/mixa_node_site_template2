var c  = require('./process_info_config.js');
var g  = c.g;
var a  = g.app_fnc;
var err_info = g.err.update;

var path_join = g.mixa.path.path_join;
//var dirname = g.path.dirname;
var mp = g.mixa.path;

var db = c.db;

var cfg = g.app_config;
var log_path = cfg.get("log:child_process:filepath");
    log_path = path_join(cfg.main_path_full,log_path);


module.exports = request;

function request(req, res){
    if ( !req.param('view_process_log') ){
        return render_error('undefined param "view_process_log"',new Error(),req,res,data);
    }
    
    var file = req.param('view_process_log');
    if ( !mp.is_parent_path(file,log_path) ) {
        return render_error('log file not in log path!! ',new Error(),req,res,data);
    }
    
    load_log_file_data(file,function(err,data){
        if(err) return render_error('get log file data',err,req,res,data);
        render(req,res,data);
    });
    
}

function render_error(msg,err,req,res,data) {
    err_info(err,msg);
    var html_dump_error = g.err.html_dump_for_error(err);
    render(req,res,{error:msg,err:err,html_dump_error:html_dump_error});
}

function render(req,res,data) {
  if (!data) data = {};
  
  data.view_path = c.view_path;
  a.render( req, res, 'view_process_log.ect', data );
}

function load_log_file_data(file,fn) {
  
  g.fs.exists(file, function(is_exists){
        if (!is_exists) {
            return fn(err_info(new Error(),'file not exists'));
        }
        
        g.fs.readFile(file, function (err, file_data) {
            if (err) return fn(err_info(new Error(),'file read error'));
            var data = {};
            data.file_data_html = render_file_data_html(file_data);
            fn(null,data);
        });
  });
}

function render_file_data_html(data) {
  
  
  data = String(data).replace(/.{1}\[31m/g,'');
  data = String(data).replace(/.{1}\[32m/g,'');
  data = String(data).replace(/.{1}\[39m/g,'');
  
  data = String(data).replace(/(\d{4}-\d{2}-\d{2})T(\d{2}\:\d{2}\:\d{2}\.\d{3})Z/g,'$1 $2');
  //data = String(data).replace(/String/g,'');


  data = String(data).replace(/\n/g,'\n<br>');
//2014-06-19T15:05:24.877Z
  
  return data;
}









