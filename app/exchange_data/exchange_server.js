console.log('load exchange_server.js..');

var g = require('../global.js');
var config = g.app_config;
var port = config.get('app_server_port');

var dnode = require('dnode');


var programs_list = {};
/***
 * array(  pid->object(info->object(name,user_name,description,log_file)
 *                     start_time,
 *                     end_time,
 *                     result,
 *                     errors,
 *                     error_message,
 *                     progress->object(total_progress,status,progress)
 *                    )
 *      );
 ***/

//функцмя возвращает текущее время
function get_time_fnc() { 
    return (new Date()).getTime(); //пока в количестве милисекунд
}

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

g.log.info('app exchange server listening on port ' + port);




