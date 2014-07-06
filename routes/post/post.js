var g  = require('../../app.js');
var a  = g.app_fnc;


module.exports = function(route_path,app,express){
  
  app.all(route_path,function(req, res, next){
    req.route_path = route_path;
    return require('./search/search.js').request(req,res,next);
  });
    
    
}




