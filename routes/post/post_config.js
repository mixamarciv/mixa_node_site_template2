var g  = require('../../app.js');

var db_arr = require('./db/connect.js');

var path_join = g.mixa.path.path_join;
var view_path = path_join(__dirname,'./views');


module.exports = {
  g: g,
  view_path: path_join(__dirname,'./views'),
  db_arr: db_arr,
  render_select_db: render_select_db,
  post_route_path: null,  //устанавливается один раз при загрузке
  set_post_route_path: function (route_path) { this.post_route_path = route_path; }
}


function render_select_db(req, res, data) {
  data.db_arr = db_arr;
  return a.render( req, res, 'select_db.ect', data );
}
