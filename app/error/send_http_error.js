console.log('load send_http_error..');
var g = require('../global.js');
var a  = g.app_fnc;

module.exports = function(error,req,res,next){
    
    //g.log.info("load res.sendHttpError..");
    
    //res.sendHttpError = function(error){
        g.log.warn("res.sendHttpError..");
        //res.end(require('util').inspect(error));
        //res.status(error.status);
        res.status(505);
        if(res.req.headers['x-requested-with'] == 'XMLHttpRequest') {
            res.json(error);
        }else{
            var err_info = {
                    url: req.originalUrl,
                    error: error
                };
            //var dump = require('util').inspect(err_info);
            var dump = g.mixa.dump.var_dump_node(err_info);
            a.render(req,res,"error.ect",{error:error, error_dump:dump});
        }
    //}
    if (next && g.u.isFunction(next)) next();
}
