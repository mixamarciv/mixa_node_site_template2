
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

