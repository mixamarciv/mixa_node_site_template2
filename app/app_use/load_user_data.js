console.log('load load_user_data..');
var g = require('../global.js');
var a = g.app_fnc;

//загружаем данные пользователя в res.locals.user
module.exports = function(req,res,next){
    
    //g.log.info("load res.locals.user..");
    if(!req.session || !req.session.user){
        //g.log.info("!req.session || !req.session.user");

        a.render(req,res,"need_auth.ect");
        return 0;
    }
    
    res.locals.data.user = req.session.user;
    
    return next();
}
