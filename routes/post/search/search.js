var c  = require('../post_config.js');
var g  = c.g;
var a  = g.app_fnc;

var path_join = g.mixa.path.path_join;

var db = c.db;

function request(req, res, next) {

    var data = {};
    data.view_path = c.view_path;
    a.render( req, res, 'list.ect', data );
}

module.exports = function(route_path,app,express){
  app.get(route_path,request);
}
module.exports.request = request;