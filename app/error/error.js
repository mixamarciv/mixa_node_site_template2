console.log('load error..');


function update_error_stack(err){
    if (!err.stack) {
        err.stack = new Error().stack;
    }else{
        var s = new Error().stack;
        if (s.length > err.stack.length) err.stack = s; 
    }
    return err;
}


module.exports.update_error_stack = update_error_stack;