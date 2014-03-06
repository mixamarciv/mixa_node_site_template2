console.log('load exchange_client.js..');

var g = require('../global.js');
var config = g.app_config;
var port = config.get('app_server_port');

var net = require('net');

var client = net.connect({port: port}, function() { //'connect' listener
  //console.log('connect to app server');
  
  //client.write('client connected');
  
  client.message_interval = setInterval(function(){
        client.write('connected:1');
  },5000);
  
});
client.message_interval = 0;

client.on('data', function(data) {
  console.log(data.toString());
  //client.end();
});

function on_end_connection(type_disconnect) {
  client.end();
  clearInterval(client.message_interval);
  console.log('client disconnected ('+type_disconnect+')');
}
client.on('close', function(){on_end_connection('close');});
client.on('end',   function(){on_end_connection('end');  });
client.on('error', function(){on_end_connection('error');});



console.log('end load exchange client');


