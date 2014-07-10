//тут загружаем список всех роутов
console.log("load routes ..");
var g  = require('../app.js');
var a  = g.app_fnc;


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

module.exports = function(app,express){
  
  var route_list = [];
  try{
    load_routes_from_dir("",__dirname,route_list);
  }catch(error){
    g.log.error(g.mixa.dump.var_dump_node("load_route_err",error));
    g.log.error(g.util.inspect(error));
  }
  
  
  /******
  var templ_elements_path = g.app_config.templates_cfg.template_elemenets_path_dir;
  var menu_render = require(templ_elements_path+"/main_menu/render_menu.js");
  menu_render(route_list,function(err,menu_file){
    if (err) {
        return g.log.error(err);
    }
    var file = g.path.relative( g.app_config.main_path_full, menu_file);
    g.log.info("render new menu file: "+file);
  });
  *****/
  
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

