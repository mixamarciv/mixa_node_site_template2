console.log('load app_use/index.js..');
var g = require('../global.js');

module.exports = function(app,express){
    
    g.log.info("load app_use functions..");
    
    //��� �������� ���������� res.locals - ����� �������� � ejs ��������!
    
    app.use(require('./send_http_error.js'));
    app.use(require('./load_user_data.js'));
}
