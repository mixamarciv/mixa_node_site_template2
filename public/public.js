//тут загружаем список всех роутов для статичных ресурсов
console.log("load public.js..")
var g  = require('../app.js');
var a  = g.app_fnc;


module.exports = function(app,express){
  
  
  //app.use('/public', test_access, express.static(__dirname));
  app.use('/public', test_access );
  app.use('/public', less_files_send );
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


var less = require('less');

function less_files_send(req,res,next) {
  var file = req.path;
  if (g.path.extname(file).toLowerCase() == 'less') {
    
      var parser = new(less.Parser)({
          paths: [g.path.join(__dirname,'/stylesheets')], // Specify search paths for @import directives
          filename: 'style.less'      // Specify a filename, for better error messages
      });
      
      
      parser.parse('.class { width: (1 + 1) }', function (e, tree) {
          if (err) {
            return a.render(req,res,'error.ect',{error:"less render exception",error_msg:g.util.inspect(err)});
          }
          return tree.toCSS({ compress: true }); // Minify CSS output
      });
  }
  return next();
}
//req.path