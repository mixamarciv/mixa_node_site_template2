var g  = require('../../../app.js');
var a  = g.app_fnc;


module.exports = function(route_path,app,express){
  
  app.get(route_path,function(req, res, next){
    var data = {view_path:__dirname};
    a.render( req, res, 'run_test_js_list.ect', data );
    return ;
    a.external_app.run_child_proccess("d:/program/nodejs__prjs/mixa_node_site_template2/programs/test_app/test_app.js",function(err,p_data){
      
        var data = {view_path:__dirname};
        data.err = err;
        data.result = p_data;
        data.aaa = 'test';
        
        var obj = {hehe:1,str:"привет","каг дела?":true};
        obj.test_fnc = function(param1,param2){
          return 20000*param2;
        }
        delete obj.hehe;
        data.test_obj = obj;
        
        data.test_str = JSON.stringify(obj);
        
        data.test_obj2 = JSON.parse(data.test_str);
        
        
        a.render( req, res, 'run_test_app.ect', data );
    });
   
  });
}

