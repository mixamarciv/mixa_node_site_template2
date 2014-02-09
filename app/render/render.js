console.log('load app_use/render..');
var g = require('../global.js');
var a = g.app_fnc;
var cfg = g.app_config;



                                 
//задаем обработку вывода шаблона
module.exports = function(req,res,template,data2){
    g.log.info("render '"+template+"'..");
    var ect = require('ect');
    var renderer = ect({ watch: true, // — Automatic reloading of changed templates,
                                      //defaulting to false (useful for debugging with enabled cache, not supported for client-side)
                         root: __dirname + '/views',
                         cache: true, // — Compiled functions are cached, defaulting to true
                         test : 1,
                        });
    
    //app.engine('ect', renderer.render );
    var template_file_path = g.path.join( g.app_config.templates_path, template);
    var templates_path = g.path.join( g.app_config.templates_path, '/template/default' );

    //if(!data) data = {};
    var data = res.locals.data;
    if(data2){
        g.mixa.obj.add_object( data, data2 );
    }
    
    if(!data.page_title)  data.page_title = cfg.get('site_title_default');
    if(!data.templates_path)  data.templates_path = templates_path;
    
    data.execute_time = res.execute_info.execute_time();
    
    var html;
    
    try {
      html = renderer.render(template_file_path, data);
    } catch(err) {
      g.log.error("template render '"+template+"':\n"+g.util.inspect(err,1,10,0));
      html = "<html><head><title>ERROR template render 1</title></head>"+
             "<body style=\"background: #000; color:#ccc; font-weight: bolder;\">"+
             "file: "+template_file_path+
             "<pre>"+
             g.util.inspect(err,1,10,0)+
             "</pre>(data size:"+data.length+") :<pre>"+
             g.util.inspect(data,1,3,0)+
             "</pre></body></html>";
    }
    
    if(!res.getHeader('Content-Type')){
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
    
    if(!html){
        g.log.error("send data (data size:"+data.length+")");
        html = "<html><head><title>ERROR template render 2</title></head>"+
               "<body style=\"background: #000; color:#ccc; font-weight: bolder;\">"+
               "file: "+template_file_path+
               "<pre>"+
               g.util.inspect(data,1,1,0)+
               "</pre></body></html>";
    }
    
    res.end(html);
    
    
}
