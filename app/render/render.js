console.log('load app_use/render..');
var g = require('../global.js');
var a = g.app_fnc;
var cfg = g.app_config;



var log_render_data = g.app_config.get("dev:log_render_data");

//задаем обработку вывода шаблона
module.exports = function(req,res,template,data2){
    g.log.info("render '"+template+"'..");
    var ect = require('ect');
    var renderer = ect({ watch: true, // — Automatic reloading of changed templates,
                                      //defaulting to false (useful for debugging with enabled cache, not supported for client-side)
                         //root: __dirname + '/views',
                         cache: true, // — Compiled functions are cached, defaulting to true
                         test : 1,
                        });
    
    //app.engine('ect', renderer.render );
    var view_file_path; //= g.path.join( g.app_config.views_path_full, template);
    if(data2 && data2.view_path){
        view_file_path = g.path.join( data2.view_path, template);
    }else{
        view_file_path = g.path.join( g.app_config.templates_cfg.views_path_dir, template);
    }
    
    var cur_template = 'default';


    if(!data2) data2 = {};
    
    var data = data2;
    g.mixa.obj.add_object( data, res.locals.data );

    
    if(!data.page_title)  data.page_title = cfg.get('site_title_default');
    
    data.templates_cfg = g.app_config.templates_cfg;
    if(!data.this_template_path_web )  data.this_template_path_web  = g.app_config.templates_cfg.templates_path_web +'/'+cur_template ;
    if(!data.this_template_path_dir )  data.this_template_path_dir  = g.path.join( g.app_config.templates_cfg.templates_path_dir, cur_template );
    
    
    data.execute_time = res.execute_info.execute_time();
    
    if(log_render_data){
        var dump_options = {exclude: [
                              // /^data.a$/,/^data.g$/
                            ]};
        g.log.warn( "\ndump render data:\n"+g.mixa.dump.var_dump_node("data",data,dump_options) );
    }

    
    var html;
    
    try {
      html = renderer.render(view_file_path, data);
    } catch(err) {
      html = get_html_dump_error_render("err1",err,template,view_file_path,data);
    }
    
    if(!res.getHeader('Content-Type')){
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
    
    if(!html){
        html = get_html_dump_error_render("no html data",err,template,view_file_path,data);
    }
    
    res.end(html);
    
    
}


function get_html_dump_error_render(err_info,err,template,view_file_path,data) {
    var dump_options = {exclude: [
                               /^data\.a\..*/,/^data\.g\..*/
                        ]};
    g.log.error("template render '"+template+"':\n" + g.mixa.dump.var_dump_node("data",data,dump_options));
    html = "<html><head><title>ERROR template render: "+err_info+"</title></head>"+
           "<body style=\"background: #000; color:#ccc; font-weight: bolder;\">"+
           "file: "+view_file_path+
           "<pre>"+
           g.util.inspect(err)+
           //g.mixa.dump.var_dump_node("err",err,{})+
           "</pre>(data size:"+data.length+") :<pre>"+
           g.mixa.dump.var_dump_node("data",data,dump_options)+
           "</pre></body></html>";
    return html;
}
