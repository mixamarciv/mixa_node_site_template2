var g  = require('../../app.js');
var a  = g.app_fnc;
var path_join = g.mixa.path.path_join;

var post_db = require('./db/connect.js');

var view_path = path_join(__dirname,'./views');

module.exports = function(route_path,app,express){
  
  app.get(route_path,function(req, res, next){
    req.route_path = route_path;
    post_db.on_ready(function(){
        var data = {};

        data.view_path = view_path;
        
        a.render( req, res, 'post.ect', data );
    
    });
  });
    
    
}




