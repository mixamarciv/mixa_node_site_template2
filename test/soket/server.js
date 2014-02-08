console.log('load serer..');

//var g = require('../../app/global.js');
//module.exports = g; 

var net = require('net');
var server = net.createServer(function(client) { //'connection' listener
    client.message_interval = setInterval(function(){
        client.write('connected to server (pid:'+process.pid+')');
    },2000);
    
    client.write('connection establish');
    
    console.log('server connected');
    
    function on_end_connection(type_disconnect) {
        clearInterval(client.message_interval);
        console.log('server disconnected ('+type_disconnect+')');
    }
    
    client.on('close', function(){on_end_connection('close');});
    client.on('end',   function(){on_end_connection('end');  });
    client.on('error', function(){on_end_connection('error');});
    
    client.on('data',function(d){
      console.log('client data: '+d);
    });
});

server.listen(3001, function() { //'listening' listener
  console.log('server start');
});


console.log('end load');

