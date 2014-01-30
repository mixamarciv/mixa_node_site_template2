console.log("start http proxy");
var cfg = require("./config/config.js");
var dump = require("./my_std_modules/var_dump.js");
var mystr = require("./my_std_modules/str_functions.js");

var ip = require("./my_std_modules/ip.js");

var sys =require("util");
var url = require("url");
var querystring = require("querystring");

var exec = require("child_process").exec;
var path = require('path');
var fs = require('fs');

// path.exists on the v0.6.x releases, and was changed to fs.exists on v0.7.x
fs.exists = fs.exists || path.exists; 
fs.existsSync = fs.existsSync || path.existsSync; 

process.on('uncaughtException', function(error){
        console.log("[PROXY uncaughtException] "+error);
  
        //response.write('PROXY ERROR!\n\n');
        //response.write(dump.var_dump_node("options",options,{hide_functions:1}));
        //response.write(dump.var_dump_node("error.stack",error.stack,{hide_functions:1}));
        //response.end(dump.var_dump_node("error",error,{hide_functions:1}));
});

var http = require('http');

function write_request_log(request,info){
  var log_str = "[PROXY] "+info;
  if(info===undefined || info==null)
    log_str = "[PROXY] "+request.connection.remoteAddress + ": " + request.method + " "+ request.headers.host + request.url;

  var page_load_time = mystr.time_duration_str(request.log_start_load_url,(new Date()));
  console.log("["+mystr.date_to_str(request.log_start_load_url)+"]["+page_load_time+"]"+log_str);
}

http_proxy = http.createServer(function(request, response) {
  response.is_send_head = 0;
  request.log_start_load_url = new Date();
  
  var host = request.headers.host;
  if(host===undefined || host==""){
	write_request_log(request,"ERROR: host undefined.");
      	response.end("ERROR: host undefined.");
	return;
  }
  
  var options = {
    host: host.toLowerCase(),
    //hostname: To support url.parse() hostname is preferred over host
    port: 8081,
    localAddress: "0.0.0.0",
    //socketPath: Unix Domain Socket (use one of host:port or socketPath)
    method: request.method,
    path: request.url,
    headers: request.headers,
    //auth: Basic authentication i.e. 'user:password' to compute an Authorization header.
    //agent: request.headers['user-agent'],
    test: 1
  };

  if((/.*miffka\.troley\.net.*/).test(options.host)){
    options.port = 8081;
  }else
  if((/.*(troley\.net|uzkh-inta\.ru|fond-inta\.ru).*/).test(options.host)){
    options.port = 8080;
    //write_request_log(request,"port:80 -> port:"+options.port);
    /*if((/wp\-login\.php/i).test(options.path)){
	if(!(/hehe/).test(options.path)){
		write_request_log(dump.var_dump_node("access_dump",{options:options},{hide_functions:1}));
		return response.end("ACCESS DENIED");
	}
    }*/
  }

  

  var proxy_ip_info = ip.get_client_ip(request);
  options.headers.proxy_ip_info = proxy_ip_info;
  
  var proxy_req = http.request(options,function(proxy_res){
      
      //proxy_res.headers.proxy_ip_info = proxy_ip_info;
      response.writeHead(proxy_res.statusCode, proxy_res.headers);
      
      proxy_res.on('data', function(chunk){
        //console.log("[PROXY res data]");
        response.write(chunk, 'binary');
      });
      proxy_res.on('end', function(){
        //console.log("[PROXY res end]");
        response.end();
        
        //write_request_log(request);
      });
      
      
  });
  
  proxy_req.on('error', function(error){
      response.write('PROXY ERROR!\n\n');
      response.write(dump.var_dump_node("options",options,{hide_functions:1}));
      response.write(dump.var_dump_node("error.stack",error.stack,{hide_functions:1}));
      response.end(dump.var_dump_node("error",error,{hide_functions:1}));
      write_request_log("PROXY ERROR!\n\n");
      write_request_log(dump.var_dump_node("err_dump",{options:options,error_stack:error.stack,error:error},{hide_functions:1}));
  });

  request.on('data', function(chunk){
      //console.log("[PROXY req data]");
      proxy_req.write(chunk, 'binary');
  });
  
  request.on('end', function(){
      //console.log("[PROXY req end]");
      proxy_req.end();
  });
  


  
});

http_proxy.listen(80);



