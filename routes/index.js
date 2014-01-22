var g  = require('../app.js');
var gf = g.app_fnc;
var r  = require('./global/index.js');
/*
 * GET home page.
 */
module.exports = function(app){
  
  app.get('/',function(req, res, next){
    
    g.log.info("try catch error");
    //test.a.a = 0;
    res.render('index', { title: 'Express' });
  });
  
  app.get('/aaa',r.checkAuth,function(req, res, next){
    g.log.info("AAAAAAAAAAAAA");
    g.log.info('http query 404');
    next(404);
    g.log.info('http send 404');
  });
  
}
