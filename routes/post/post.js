var g  = require('../../app.js');
var a  = g.app_fnc;
var c  = require('./post_config.js');

module.exports = function(route_path,app,express){
  
  app.all(route_path,function(req, res, next){
    req.route_path = route_path;
    return require('./search/search.js').request(req,res,next);
  });
    
    
}

module.exports.user_main_menu_item = render_user_main_menu_item;

function render_user_main_menu_item(route_path) {
  var arr_db = c.db_arr.arr_conn;
  var el = {};
  el.name = 'БД ('+arr_db.length+')';
  el.link = null;
  el.file = 'не важно';
  el.no_autoload_subitems = 1;
  el.subitems = [];
  
  for(var i=0;i<arr_db.length;i++){
      var db = arr_db[i];
      var sub_el = {name:db.name};
      sub_el.link = route_path + '?db=' + db.id;
      sub_el.no_autoload_subitems = 1;

      sub_el.subitems = [{ name: 'добавить запись',
                           link: route_path + '/new?db=' + db.id,
                           no_autoload_subitems: 1
                         }];

      el.subitems.push(sub_el);
  }
  
  return el;
}


