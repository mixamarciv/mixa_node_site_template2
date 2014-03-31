console.log('load test_app.js..');

var g = {};
var g = require('../../app/global.js');



module.exports = function(global){
    g = global;
    var log_file = g.path.join(__dirname,"/log.txt");
    g.fs.writeFileSync(log_file,g.mixa.str.date_to_str_format(new Date(),"Y.M.D h:m:s k\n"));
    setInterval(function(){
            g.fs.writeFileSync(log_file,g.mixa.str.date_to_str_format(new Date(),"Y.M.D h:m:s k\n"));
            
        },5000);
}




