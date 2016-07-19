//вывод списка файлов в каталоге
var g  = require('../../../../app.js');
var a  = g.app_fnc;

var fcfg = g.app_config.filenavigator_cfg ;
var fnf = require('../filenavigator_fnc.js');

module.exports = function(route_path,app,express){
  
  app.get(route_path,function(req, res, next){
    var file = req.query['file'];
    if (fnf.is_exclude_path(file)) {
        var data = {view_path:g.path.join(__dirname,"/.."),error:"'"+file+"' is exclude path"};
        a.render( req, res, '../filenavigator.ect', data );
    }
    chek_path_is_file(file,function(err){
        if (err) {
            var data = {view_path:g.path.join(__dirname,"/.."),error:err};
            a.render( req, res, '../filenavigator.ect', data );
        }
        //для отправки файлов из каталогов уровнем выше
        return res.sendfile(g.path.basename(file),{root:g.path.dirname(file)});
    });

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

