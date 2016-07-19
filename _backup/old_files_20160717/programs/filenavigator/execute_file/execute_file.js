//вывод списка файлов в каталоге
var g  = require('../../../../app.js');
var a  = g.app_fnc;

var fcfg = g.app_config.filenavigator_cfg ;
var fnf = require('../filenavigator_fnc.js');

module.exports = function(route_path,app,express){
  app.get(route_path,route_execute_file);
}



function route_execute_file(req, res, next) {
  
  var file = req.query['file'];
  if (fnf.is_exclude_path(file)) {
      var data = {view_path:g.path.join(__dirname,"/.."),error:"'"+file+"' is exclude path"};
      a.render( req, res, '../filenavigator.ect', data );
  }
  
  var options = {};
  options.run_file = file;
  options.rr = {req:req,res:res};
  
  a.external_app.run_child_process2(options,function(err,p_data){
        var data = {};
        data.err = err;
        data.result = p_data;
        
        a.render( req, res, './child_proccess/run_child_proccess.ect', data );
  });

}
