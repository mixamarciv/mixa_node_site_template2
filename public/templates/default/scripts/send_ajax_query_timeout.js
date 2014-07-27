//создает копию объекта
function my_clone_object(o) {
    if(!o || typeof o!=='object'){
      return o;
    }
    var c = 'function' === typeof o.pop ? [] : {};
    var p, v;
    for(p in o){
        if(o.hasOwnProperty(p)){
            v = o[p];
            if(v && typeof v==='object'){
                c[p] = my_clone_object(v);
            }else{
                c[p] = v;
            }
        }
   }
   return c;
}

//send_ajax_query_timeout - функция для отправки аякс запроса с очередью в случае длительного выполнения,
//после отправки запроса, в случае если запрос с тем же id_user_query уже выполняется в текущий момент то новый ставится в очередь
//если в процессе выполнения запроса в очередь было отправлено более одного запроса то из очереди выполнится только последний!!
// id_user_query - уникальный id ajax запроса
// options - ajax параметры запроса
// timeout - время задержки перед отправкой первого запроса и след. запроса из очереди после получения результата от первого
/**************************
example:
  var ajax_options = {
        type: "GET",
        url: "index.php",
        data: data,
	onSend: function(){ //срабатывает при каждом вызове независимо от того был получен результат от прошлого запроса или нет
	    if(typeof window['query_data'][id_user_query]['send_count'] == 'undefined'){window['query_data'][id_user_query]['send_count']=0;}
	    window['query_data'][id_user_query]['send_count']++;
	    log.msg("отправлен "+window['query_data'][id_user_query]['send_count']+" запрос");
	},
	onWait: function(){ //срабатывает только при поставновке нового запроса в очередь
	    log.msg("ждите.., ваш запрос отправлен в очередь");
	},
        beforeSend: function(html){
	  if(window['query_data'][id_user_query]['query_status']['load_count']>1) set_cur_size_input_items(id_user_query);
        },
        success: function(html,textStatus,jqXHR){ // после получения результатов выводим список
	    if(typeof window['query_data'][id_user_query]['result_count'] == 'undefined'){window['query_data'][id_user_query]['result_count']=0;}
	    window['query_data'][id_user_query]['result_count']++;
	    log.msg("получен результат "+window['query_data'][id_user_query]['result_count']+" запроса (из "+window['query_data'][id_user_query]['send_count']+")");
	    
	    $("#test").html(html);
        },
        on_end_all: function(d,status){  //срабатывает при завершении всех запросов и отсутствия очереди
	      setTimeout(function(){
		  load_post__progressbar(0);
	      },100);
	},
	test: 0
  };
  send_ajax_query_timeout("test_11",ajax_options,500);
***************************/
function send_ajax_query_timeout(id_user_query,options,timeout){
  if(!timeout || timeout <= 10 ){
    timeout = 10;
  }
  
  if(!options){
    alert("незадан параметр 'options' для 'send_ajax_query_timeout(id_user_query,options,timeout)' !");
    return 0;
  }
  
  if(options.onSend && jQuery.isFunction(options.onSend)){
    options.onSend();
  }
  
  if(!window.list_ajax_query){
    window.list_ajax_query = {};
  }
  var aq = window.list_ajax_query;  //набор пользовательских запросов
  
  
  if(!aq.id_user_query){
    aq[id_user_query] = {};
  }
  var uq = aq[id_user_query];  //пользовательский запрос
  
  uq.options = options;
  if(!uq.status){
    uq.status = {result_wait: 0, restart_query: 0, last_params: null, load_count: 0};
  }
  
  var ss = uq.status;
  if( ss.result_wait == 1){
    if(ss.restart_query == 0){
        ss.restart_query = 1;
    }
    if(options.onWait && jQuery.isFunction(options.onWait)){
      options.onWait();
    }
    return 0;
  }
  
  ss.result_wait = 1;

    var options_new = my_clone_object(uq.options);
    if( options_new.complete ){ // && jQuery.isFunction(options['complete'])
	  uq.options.user_ajax_on_complete = options_new['complete'];
	  options['complete'] = null;
	  delete options['complete'];
    }
    options_new.complete = function(jqXHR,status){
	    if(uq.options.user_ajax_on_complete && jQuery.isFunction(uq.options.user_ajax_on_complete) ){
		uq.options.user_ajax_on_complete(jqXHR,status);
	    }
	    if(status!="success"){
		var msg = status+" : ["+jqXHR['status']+"] "+jqXHR['statusText'];
		alert("ОШИБКА AJAX загрузки: \n"+msg+"\nurl:"+options_new['url']+"\ndata:"+var_dump(options_new['data']));
	    }
	    
	    if(ss.restart_query==1){
		ss.restart_query = 0;
		setTimeout(function(){
		  send_ajax_query_timeout(id_user_query,window['list_ajax_query'][id_user_query]['options'],timeout);
		},10);
	    }else{
		ss.result_wait = 0;
		if(uq.options.on_end_all && jQuery.isFunction(uq.options.on_end_all) ){
		    uq.options.on_end_all(jqXHR,status);
		}
	    }
    };
    //alert('send ajax: ['+options_new.type+'] '+options_new.url);
    $.ajax(options_new);
    //.done(options_new.success)
    //.always(function(){ alert( "complete" ); });

  return 1;
}

