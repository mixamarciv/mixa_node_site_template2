console.log('load test_app.js..');

var g = {};
var g = require('../../app/global.js');


g.app_db.close();

module.exports = function(global){
    g = global;
    var log_file = g.path.join(__dirname,"/log.txt");
    g.fs.writeFileSync(log_file,g.mixa.str.date_to_str_format(new Date(),"Y.M.D h:m:s k\n"));
    //setTimeout(function(){
            g.fs.writeFileSync(log_file,g.mixa.str.date_to_str_format(new Date(),"Y.M.D h:m:s k\n"));
    //    },1000);
    
    g.app_db.close();
    process.exit(1);
}




