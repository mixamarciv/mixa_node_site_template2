//создает копию объекта
function my_clone(o) {
    if(!o || typeof o!=='object'){
      return o;
    }
    var c = 'function' === typeof o.pop ? [] : {};
    var p, v;
    for(p in o){
        if(o.hasOwnProperty(p)){
            v = o[p];
            if(v && typeof v==='object'){
                c[p] = my_clone(v);
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

    var options_new = my_clone(uq.options);
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


var post_search__data = {};
function post_search__run_query() {
    var form = $('#search_form');
    var data = post_search__get_form_data(form);
    var text = post_search__clear_search_text(data.search);
    
    if(post_search__data.prev_text && post_search__data.prev_text == text){
        //если текст не менялся то запрос не отправляем
        return null;
    }
    load_post__progressbar(1);
    post_search__data.prev_text = text;
    
    var ajax_options = {
          type: form.attr('method'),
          url: form.attr('action'),
          data: data,
          success: function(html,textStatus,jqXHR){ // после получения результатов выводим список (новый список, и удаляем старый)
              //alert('RECIVE '+html);
              var obj = $('#search_data');
              if (!obj) {
                alert('not found object #search_data');
              }
              obj.html(html);
          },
	  on_end_all: function(d,status){
	      setTimeout(function(){
		  load_post__progressbar(0);
	      },100);
	  },
          test: 0
    };
    
    send_ajax_query_timeout("post_search_uniq_id3000",ajax_options,delay=1000);
}

function post_search__clear_search_text(search_text) {
    var text = String(search_text);
    text = text.replace(/[ \t\r\n]{2,}/g,' ');
    return text;
}

function post_search__get_form_data(form) {
    var data = {};
    data.ajax_query = 1;
    data.db = form.find('input[name=db]').val();
    data.search = form.find('#search').val();
    return data;
}

function load_post_search(form) {
    load_post__progressbar(0);
    //form.submit(function(event){
    //    post_search__run_query();
    //    event.preventDefault();
    //});
    var obj_input_text = form.find('#search');
    //obj_input_text.change(function(){
    //    post_search__run_query();
    //});
    obj_input_text.keyup(function(){
        post_search__run_query();
    });
}

function load_post__progressbar(show) {
    if (show) {
        $('#progressbar').show();
    }else{
        $('#progressbar').hide();
    }
    //squaresWaveG
}