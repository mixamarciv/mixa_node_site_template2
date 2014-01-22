var g = require('../../app.js');
var gf = g.app_fnc;

module.exports.checkAuth = function(req,res,next){
  if(!req.session || !req.session.user){
    return next(new gf.HttpError(403,"Вы не авторизованы"));
  }
  next();
}
