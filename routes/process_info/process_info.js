var c  = require('./process_info_config.js');
var g  = c.g;
var a  = g.app_fnc;
var err_info = g.err.update;

var path_join = g.mixa.path.path_join;

var req_search = require('./search.js');
var req_view   = require('./view.js');

module.exports = function(route_path,app,express){
  c.route_path = route_path;
  app.all(route_path,function(req, res){
    
    if ( req.param('search') ) {
      return req_search(req, res);
    }
    
    if ( req.param('edit') ) {
      return require('./edit.js')(req, res);
    }
    
    if ( req.param('view_process_log') ) {
      return require('./view_process_log.js')(req, res);
    }
    
    if ( req.param('view') ) {
      return req_view(req, res);
    }
    
    if ( !req.param('id_process') && !req.param('id') ) {
      return req_search(req, res);
    }
    
    return req_view(req, res);
  });
}



