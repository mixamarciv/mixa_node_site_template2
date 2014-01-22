console.log('load app_use/render..');
var g = require('../global.js');
var a = g.app_fnc;

//задаем обработку вывода шаблона
module.exports = function(req,res,template,data){
    g.log.info("render '"+template+"'..");
    var ect = require('ect');
    var renderer = ect({ watch: true, // — Automatic reloading of changed templates,
                                         //defaulting to false (useful for debugging with enabled cache, not supported for client-side)
                         root: __dirname + '/views',
                         cache: true, // — Compiled functions are cached, defaulting to true
                         test : 1,
                        });
    
    //app.engine('ect', renderer.render );
    var template_file_path = g.path.join(g.app_config.templates_path,template);
    if(!data.g) data.g = g;
    if(!data.a) data.a = a;
    var html;
    
    try {
      html = renderer.render(template_file_path, data);
    } catch(err) {
      g.log.error("template render '"+template+"':\n"+g.util.inspect(err,1,10,0));
      html = "<html><head><title>ERROR template render</title></head>"+
             "<body style=\"background: #000; color:#ccc; font-weight: bolder;\">"+
             "file: "+template_file_path+
             "<pre>"+
             g.util.inspect(err,1,10,0)+
             "</pre></body></html>";
    }
    
    if(!res.getHeader('Content-Type')){
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
    
    res.end(html);
}
