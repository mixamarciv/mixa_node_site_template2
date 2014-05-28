//тут загружаем список всех роутов для статичных ресурсов
console.log("load public.js..")
var g  = require('../app.js');
var a  = g.app_fnc;

//var lessMiddleware = require('less-middleware');


module.exports = function(app,express){
  
  app.use('/public', test_access );
  //app.use('/public', less_files_send );
  //app.use('/public', js_files_send );
  app.use('/public', express.static(__dirname));

}


function test_access(req,res,next) {
    //all public files need slid (short link id) or llid (long link id)
    if (a.session.get_session_vizit_count(req)>1) {
      var file = req.path;
      var ext = g.path.extname(file);
      if (ext=='.css') return less_files_send(req,res,next);
      else if (ext=='.js') return js_files_send(req,res,next);
    }
    if(!a.session.check_link_id(req,res)){
        //return a.render(req,res,'error.ect',{error:"no access to public (bad link id)"});
        //return res.sendHttpError("no access to public file");
        return a.send_http_error("no access to public file (not valid link id)",req,res);
    }
    return next();
}

/**************************************/

var less = require('less');
//var public_dir = g.path.dirname(__dirname);
var dev_render_always = g.app_config.get("dev:always_render_less");

function less_files_send(req,res,next) {
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
