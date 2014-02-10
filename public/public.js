//тут загружаем список всех роутов для статичных ресурсов
console.log("load public.js..")
var g  = require('../app.js');
var a  = g.app_fnc;

var lessMiddleware = require('less-middleware');


module.exports = function(app,express){
  
  
  //app.use('/public', test_access, express.static(__dirname));
  app.use('/public', test_access );
  app.use('/public', less_files_send );
  /********
  app.use(lessMiddleware({
        //dest: '/public/stylesheets', // should be the URI to your css directory from the location bar in your browser
        src: g.path.join(__dirname), // or '../less' if the less directory is outside of /public
        //root: '/public',
        compress: true
  }));
  ******/
  app.use('/public', express.static(__dirname));
  //app.use('/public', express.static(__dirname+'/public'));
}


function test_access(req,res,next) {
    var is_long_lid = 0;
    var link_id = req.query['slid'];
    if(!link_id){
        is_long_lid = 1;
        link_id = req.query['llid'];
    }
    if(!a.session.check_link_id(req,res,link_id,is_long_lid)){
        return a.render(req,res,'error.ect',{error:"no access to public (bad link id)"});
    }
    return next();
}

/**************************************/
var less = require('less');

function less_files_send(req,res,next) {
  var file = req.path;
  //g.log.info("g.path.extname("+file+").toLowerCase()=="+g.path.extname(file).toLowerCase());
  if(g.path.extname(file).toLowerCase() !== '.css') return next();

  //g.log.info("fs.exists("+file+")");
  g.fs.exists(file,function(exists){
    if(exists) res.sendFile(file);
  });
  /*******
  fs.readFile(lessPath, 'utf8', function(err, str){
          if (err) { return error(err); }

          delete imports[lessPath];

          try {
            var preprocessed = options.preprocessor(str, req);
            options.render(preprocessed, lessPath, cssPath, function(err, css){
              if (err) {
                lessError(err);

                return next(err);
              }

              log('render', lessPath);

              mkdirp(path.dirname(cssPath), 511 , function(err){
                if (err) return error(err);

                fs.writeFile(cssPath, css, 'utf8', next);
              });
            });
          } catch (err) {
            lessError(err);

            return next(err);
          }
        });
  
  
      parser.parse(str, function(err, tree) {
        if(err) {
          return callback(err);
        }

        try {
          var css = tree.toCSS({
            compress: (options.compress == 'auto' ? regex.compress.test(cssPath) : options.compress),
            yuicompress: options.yuicompress,
            sourceMap: options.sourceMap
          });

          // Store the less import paths
          imports[lessPath] = determine_imports(tree, lessPath, options.paths);

          callback(err, css);
        } catch(parseError) {
          callback(parseError, null);
        }
    });
    ***********/
}
/**************************************/
//req.path