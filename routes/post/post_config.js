var g  = require('../../app.js');

var post_db_arr = require('./db/connect.js');

var path_join = g.mixa.path.path_join;
var view_path = path_join(__dirname,'./views');


module.exports = {
  g: g,
  view_path: path_join(__dirname,'./views'),
  db_arr: post_db_arr
}



