var render  = require('../../app.js').app_fnc.render;
var pathjoin = require('path').join;

module.exports = function(route_path,app,express){
  app.get(route_path, function(req, res){
    if (req.param('ajax') ) {   //если это аякс запрос
      var filter = req.param('search');   //получаем значение которое ввел пользователь
      data = getRecords(filter)
      return res.end(data);
    }
    render( req, res, 'search.ect', {view_path: pathjoin(__dirname,'./views')} );
  });
}

var records_list = [
  "У лукоморья дуб зелёный;", // 0
  "Златая цепь на дубе том:", // 1
  "И днём и ночью кот учёный",
  "Всё ходит по цепи кругом;",
  "Идёт направо - песнь заводит,",
  "Налево - сказку говорит.",
  "Там чудеса: там леший бродит,",
  "Русалка на ветвях сидит;",
  "Там на неведомых дорожках",
  "Следы невиданных зверей;",
  "Избушка там на курьих ножках",
  "Стоит без окон, без дверей;",
  "Там лес и дол видений полны;",
  "Там о заре прихлынут волны",
  "На брег песчаный и пустой,",
  "И тридцать витязей прекрасных",
  "Чредой из вод выходят ясных,",
  "И с ними дядька их морской;"
];

function getRecords(filter) {
  var html = 'вы ввели запрос: '+filter
  html += '<table class="table table-striped table-hover">'
  for( i=0; i<records_list.length; i++ ){
    record = records_list[i];
    if (record.indexOf(filter)>=0){
      html += '<tr><td>'+record+'</td></tr>'
    }
  }
  html += '</table>'
  return html
}
