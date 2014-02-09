console.log('load load_user_data..');
var g = require('../global.js');
var a = g.app_fnc;

//загружаем данные пользователя в res.locals.user
module.exports = function(req,res,next){
    
    //g.log.info("load res.locals.user..");
    if(!req.session.user){
        //g.log.info("!req.session || !req.session.user");
        req.session.user = load_anonim_user_data();
        a.render(req,res,"need_auth.ect");
        return 0;
    }
    
    update_user_visit(req.session.user,req);
    
    res.locals.data.user = req.session.user;
    
    return next();
}


function load_anonim_user_data() {
    var user_data = {
        name: 'anonim',
        visit_count: 0
    }
    return user_data;
}

function update_user_visit(user,req) {
    user.visit_count++;
}