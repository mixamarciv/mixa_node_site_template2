var g  = require('../../../app.js');
var a  = g.app_fnc;


module.exports = function(route_path,app,express){
  
  app.get(route_path,function(req, res, next){
    
    a.programs_runner("d:/program/nodejs__prjs/mixa_node_site_template2/programs/test_app/test_app.js",function(err,p_data){
      
        var data = {view_path:__dirname};
        data.err = err;
        data.result = p_data;
        data.aaa = 'test';

        a.render( req, res, 'run_test_app.ect', data );
    });
   
  });
}

