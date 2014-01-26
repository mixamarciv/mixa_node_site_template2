console.log('load send_http_error..');
var g = require('../global.js');

module.exports = function(req,res,next){
    
    //g.log.info("load res.sendHttpError..");
    
    res.sendHttpError = function(error){
        g.log.warn("execute res.sendHttpError..");
        res.end(require('util').inspect(error));
        res.status(error.status);
        if(res.req.headers['x-requested-with'] == 'XMLHttpRequest') {
            res.json(error);
        }else{
            res.render("error.ect",{error:error, error_str:require('util').inspect(error)});
        }
    }
    
    next();
}
