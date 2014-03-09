console.log('load test_app.js..');

var g = require('../../app/global.js');
//var g = {};


module.exports = function(global){
    g = global;
    var log_file = g.path.join(__dirname,"/log.txt");
    g.fs.writeFileSync(log_file,g.mixa.str.date_to_str_format(new Date(),"YYY.MM.DD hh:mm:ss ms\n"));
}




