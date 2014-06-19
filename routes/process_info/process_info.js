var c  = require('./process_info_config.js');
var g  = c.g;
var a  = g.app_fnc;
var err_info = g.err.update;

var path_join = g.mixa.path.path_join;



module.exports = function(route_path,app,express){
  app.all(route_path,function(req, res){
    
    if ( req.param('search') ) {
      return require('./search.js')(req, res);
    }
    
    if ( req.param('edit') ) {
      return require('./edit.js')(req, res);
    }
    
    if ( req.param('view_process_log') ) {
      return require('./view_process_log.js')(req, res);
    }
    
    return require('./view.js')(req, res);
  });
}



