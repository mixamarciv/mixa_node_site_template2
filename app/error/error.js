console.log('load error..');

var g = require('../global.js');

function update_error_stack(err,info){
    if (!g.u.isArray(err.info)) {
        err.info = [err.info];
    }else if (!err.info) {
        err.info = [];
    }
    if (info) {
        err.info.push(info);
    }
    if (!err.stack_data) {
        err.stack_data = new Error().stack;
    }else{
        var s = new Error().stack;
        if (s.length > err.stack_data.length) err.stack_data = s; 
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


function html_dump_for_error(err) {
    var dump_options = {exclude: [/^data.a$/,/^data.g$/], max_str_length:90000};
      
    var serr = g.mixa.dump.var_dump_node("err",err,dump_options);
    serr = serr.replace(/err = undefined.?/ig,'');
    serr = serr.replace(/\n/g,'<br>');
    return serr;
}

module.exports.html_dump_for_error = html_dump_for_error;
module.exports.update = update_error_stack;
module.exports.update_error_stack = update_error_stack;

module.exports.show_error_and_callfn = show_error_and_callfn;

