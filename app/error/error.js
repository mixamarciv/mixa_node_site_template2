console.log('load error..');

var g = require('../global.js');

function update_error_stack(err){
    if (!err.stack) {
        err.stack = new Error().stack;
    }else{
        var s = new Error().stack;
        if (s.length > err.stack.length) err.stack = s; 
    }
    return err;
}

function show_error_and_callfn(err,msg,fn) {
    
    g.log.error(msg);
    
    err = update_error_stack(err);
    if(!err.err_msg) err.err_msg = [];
    err.err_msg.push(msg);
    
    var dump_options = {exclude: [/^data.a$/,/^data.g$/]};
    g.log.dump_error("error",err,dump_options);
    
    return fn(err);
}



module.exports.update_error_stack = update_error_stack;

module.exports.show_error_and_callfn = show_error_and_callfn;
