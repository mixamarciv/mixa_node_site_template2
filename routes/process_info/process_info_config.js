var g  = require('../../app.js');

var process_db = g.app_db;

var path_join = g.mixa.path.path_join;
var view_path = path_join(__dirname,'./views');


module.exports = {
  g: g,
  view_path: path_join(__dirname,'./views'),
  route_path: 'set after first load process_info.js',
  db: process_db
}

