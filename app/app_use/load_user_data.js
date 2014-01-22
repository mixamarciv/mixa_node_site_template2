console.log('load load_user_data..');
var g = require('../global.js');

//загружаем данные пользователя в res.locals.user
module.exports = function(req,res,next){
    
    g.log.info("load res.locals.user..");
    if(!req.session || !req.session.user) return next();
    
    res.locals.user = req.session.user;
    
    next();
}
