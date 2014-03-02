//тут загружаем список всех роутов
console.log("load routes ..");
var g  = require('../app.js');
var a  = g.app_fnc;

var r  = require('./global/index.js');


module.exports = function(app,express){
  
  app.get('/',function(req, res, next){
    a.render(req,res,'index.ect');
  });
  
  app.get('/aaa',r.checkAuth,function(req, res, next){
    next(404);
    g.log.info('http send 404');
  });
  
  
  require('./auto_load_routes.js')(app,express);
  
}

