

var load_ajax__data = {get:function(id){
	if (!this[id]) {
	    alert('load_ajax__data ERROR: id form: "'+id+'" not found!');
	    return 0;
	}
	return this[id];
    }
};

function load_ajax_search(form) {
    var id = form.attr('id');
    load_ajax__data[id] = {
	jq_form: '#'+id,
	//arr_input_objects: [],
	get_form_data: load_ajax__get_form_data,
	prev_send_data: {},
	jq_data: '#'+id+'_data',
	jq_progressbar:'#'+id+'_progressbar',
	show_progressbar: function(){},
	hide_progressbar: function(){}
    };
    var p = load_ajax__data[id];
    
    var obj = $(p.jq_progressbar);
    if (!obj) {
	load_ajax__data[id].jq_progressbar = null;
	delete load_ajax__data[id].jq_progressbar;
    }else{
	p.show_progressbar = function(){
	    $(this.jq_progressbar).show();
	}
	p.hide_progressbar = function(){
	    $(this.jq_progressbar).hide();
	}
    }

    p.hide_progressbar();
    
    
    var objs = form.find('input');
    
    objs.keyup(function(){
        load_ajax__run_query(id);
    });
    

    
}

function load_ajax__get_form_data() {
    var form = $(this.jq_form);
    if (!form) {
	alert('load_ajax__get_form_data ERROR: obj: "'+this.jq_form+'" not found!');
	return {};
    }
    var objs = form.find('input');
    if (!objs) {
	alert('load_ajax__get_form_data ERROR: not found input elements!');
	return {};
    }
    
    var data = {};
    for(var i=0;i<objs.length;i++){
        var obj = objs.eq(i);
	var name = obj.attr('name');
	var value = obj.val();
	data[name] = $.trim(value);
    }
    
    data.ajax = 1;
    return data;
}

function load_ajax__run_query(id) {
    var p = load_ajax__data.get(id);
    
    var data = p.get_form_data();
    
    if(_.isEqual(p.prev_send_data,data)){
        //если данные не менялись то запрос не отправляем
        return null;
    }
    p.prev_send_data = data;
    
    p.show_progressbar();
    
    var form = $(p.jq_form);
    var ajax_options = {
          type: form.attr('method'),
          url: form.attr('action'),
          data: data,
          success: function(html,textStatus,jqXHR){ // после получения результатов выводим список (новый список, и удаляем старый)
               var obj = $(p.jq_data);
              if (!obj) {
                alert('not found object '+p.jq_data);
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
    
    send_ajax_query_timeout(id,ajax_options,delay=100);
}

