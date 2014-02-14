//тут загружаем список всех роутов
console.log("load routes ..");
var g  = require('../app.js');
var a  = g.app_fnc;

var r  = require('./global/index.js');


module.exports = function(app,express){
  
  app.get('/',function(req, res, next){
    a.render(req,res,'index.ect');
  });
  
  app.get('/aaa',r.checkAuth,function(req, res, next){
    next(404);
    g.log.info('http send 404');
  });
  
  
  
  //загружаем список роутов с поддиректорий
  function load_routes_from_dir(route_path,dir_path,route_list){
      var files = g.fs.readdirSync(dir_path);
      for(var i in files){
          if (!files.hasOwnProperty(i)) continue;
          
          var file_path = dir_path+'/'+files[i];
          
          //console.log(route_path+" : "+file_path);
          
          if (g.fs.statSync(file_path).isDirectory()){
              load_routes_from_dir(route_path+'/'+files[i],dir_path+'/'+files[i],route_list);
          }else{
              if(g.path.basename(route_path) == files[i].replace(/\.js$/i,"")){
                //console.log(dir_path+'/'+files[i]);
                route_list.push({
                  file: dir_path+'/'+files[i],
                  route_path: route_path
                });
              }
          }
      }
  }
  
  
  var route_list = [];
  try{
    load_routes_from_dir("",__dirname,route_list);
  }catch(error){
    g.log.error(g.mixa.dump.var_dump_node("load_route_err",error));
    g.log.error(g.util.inspect(error));
  }
  
  
  var router;
  while(router = route_list.shift()){
      try{
          g.log.info("load route: "+router.route_path);
          require(router.file)(router.route_path,app,express);
      }catch(error){
          error.router = router;
          g.log.error(g.util.inspect(error));
      }
  }
  
}

