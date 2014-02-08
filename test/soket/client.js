console.log('load client..');

//var g = require('../../app/global.js');
//module.exports = g; 

var net = require('net');
var client = net.connect({port: 3001}, function() { //'connect' listener
  console.log('client connected');
  client.write('client connected');
  client.message_interval = setInterval(function(){
        client.write('connected client (pid:'+process.pid+')');
  },2000);
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



console.log('end load');

