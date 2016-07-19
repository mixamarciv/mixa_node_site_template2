//вывод списка файлов в каталоге
var g  = require('../../../app.js');
var a  = g.app_fnc;

var fcfg = g.app_config.filenavigator_cfg ;

var default_path = g.app_config.main_path_full;

module.exports.default_path = default_path;

module.exports.is_exclude_path = function is_exclude_path(path) {
  path = path.replace(/(\\|\\\\|\/\/)/g,'/');
  for(var i in fcfg.exclude_path){
    var re = fcfg.exclude_path[i];
    if(re.test(path)) return re;
  }
  return 0;
}

module.exports.get_link_to_path = function get_link_to_path(req,path_T,new_path) {

  var path_L = req.query['L'];
  var path_R = req.query['R'];


  var link_begin = req.route_path+"?";
  if(path_T.type=='L'){
    link_begin += "R="+req.query['R']+"&L=";
  }else{
    link_begin += "L="+req.query['L']+"&R=";
  }
  
  var link = link_begin + g.path.normalize( g.path.join(path_T.path,new_path) ).replace(/\\/g,'/');
  
  return link;
}


