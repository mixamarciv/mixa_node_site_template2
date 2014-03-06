console.log('load exchange_server.js..');

var g = require('../global.js');
var config = g.app_config;
var port = config.get('app_server_port');

//var dnode = require('dnode');


/*****
 * {  pid : {info : {name,user_name,description,log_file}
 *           start_time,
 *           end_time,
 *           result,
 *           errors,
 *           error_message,
 *           progress : {total_progress,status,progress}
 *           }
 * };
 *****/
var clients_list = {} // { pid->client };

//функцмя возвращает текущее время
function get_time_fnc() { 
    return (new Date()).getTime(); //пока в количестве милисекунд
}

var net = require('net');
var server = net.createServer(function(client) { //'connection' listener
    
    client.id = clients_list.length;
    client.start_time = get_time_fnc();
    clients_list[client.id] = client;
    
    client.message_interval = setInterval(function(){
        client.write('var data = {connected:1}');
    },5000);
    
    //client.write('connect to server establish (client id: '+client.id+')');
    
    console.log('client '+client.id+' connected');
    
    function on_end_connection(type_disconnect) {
        clearInterval(client.message_interval);
        console.log('server disconnected ('+type_disconnect+')');
        receive_client_close_connect(client,type_disconnect);
    }
    
    client.on('close', function(){on_end_connection('close');});
    client.on('end',   function(){on_end_connection('end');  });
    client.on('error', function(){on_end_connection('error');});
    
    client.on('data',function(data) { 
      console.log('client data: '+d);
      receive_client_data(client,data);
    });
});

server.listen(port, function() { //'listening' listener
  g.log.info('app exchange server listening on port ' + port);
});

//удаляем информацию о заданном подключении
function delete_client_from_client_list(client) {
    clients_list[client.id] = null;
    delete clients_list[client.id];
}

function receive_client_close_connect(client,data) {
    //
    delete_client_from_client_list(client);
}

function receive_client_data(client,data) {
    //

}


/***************
var server = dnode({
    program_start : function (pid,info) {
        //получаем сообщение о запуске процесса info(name,user_name,description,log_file)
        programs_list[pid] = { info : info,
                               start_time : get_time_fnc(),  
                               end_time : null,
                               errors : "",
                               progress : { total_progress : 0, status: "start", progress: 0 }
                             };
    },
    program_progress : function (pid,progress) {
        //обновляем информацию о текущем процессе
        if(!programs_list[pid]){
            programs_list[pid] = {
                errors : "1;",
                error_message : "ERROR: undefined process (неизвестный процесс сообщает информацию о выполнении).",
                start_time : get_time_fnc()  //текущее время
            }
        }
        programs_list[pid].progress = progress;
    },
    program_end : function (pid,info){
        if(!programs_list[pid]){
            programs_list[pid] = {
                errors : "2;",
                error_message : "ERROR: undefined process (неизвестный процесс сообщает информацию о завершении).",
                start_time : get_time_fnc()  //текущее время
            }
        }
        programs_list[pid].end_time = get_time_fnc();
        if(programs_list[pid].progress) programs_list[pid].progress.status = "end";
    }
});

server.listen(port);
*****************/



