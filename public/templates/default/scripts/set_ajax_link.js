//вместо открытия ссылки - загружает её содержимое в id_result
function set_ajax_link(id_link,id_result) {
    $('#'+id_link).click(function(e) {
        e.preventDefault();
	var href = $('#'+id_link).attr('href');
	var ajax_options = {
	      type: 'GET',
	      url: href,
	      data: null,
	      onSend: function(){
		  var obj = $('#'+id_result).html('загрузка..');
	      },
	      onWait: function(){
		  var obj = $('#'+id_result).html('запрос отправлен в очередь..');
	      },
	      success: function(html,textStatus,jqXHR){ // после получения результатов выводим список (новый список, и удаляем старый)
		  var obj = $('#'+id_result);
		  if (!obj) {
		    alert('not found object #'+id_result);
		  }else{
		    obj.html(html);
		  }
	      },
	      on_end_all: function(d,status){
		  setTimeout(function(){
		      p.hide_progressbar();
		  },100);
	      },
	      test: 0
	};
	send_ajax_query_timeout('',ajax_options,delay=100);
    });
}

