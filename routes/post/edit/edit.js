var c  = require('../post_config.js');
var g  = c.g;
var a  = g.app_fnc;

var path_join = g.mixa.path.path_join;

var db = c.db;

function render(req,res,data) {
  if(!data) data = {};
  data.view_path = c.view_path;
  a.render( req, res, 'edit.ect', data );
}

module.exports = function(route_path,app,express){
  
  app.all(route_path,function(req, res, next){
    var is_save = req.param('post_save');
    if (is_save) return save_post(req, res, next);
    
    render(req,res,{error:'select post for edit'});
  });
    
    
}

function save_post(req, res, next) {
  
}


