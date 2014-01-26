var path = require('path');
var sys = require('util');

module.exports = function (req,res,next){
  var app = req.app;
  var l = app.locals;
  var m = l.modules;
  var db = m.db;
  var dump = m.dump;
  
  var auth_try_counter = req.session.auth_try_counter;
  if(auth_try_counter==undefined) req.session.auth_try_counter = 0;
  req.session.auth_try_counter++;
  
  var last_auth_try = new Date(req.session.auth_try);
  var time_auth = ((new Date()).getTime() - last_auth_try.getTime())/(1000*60);
  if(time_auth>1) return r_function_get(req,res,next);
  var time_auth = m.mystr.time_duration_str(last_auth_try,(new Date()));
  
  var is_auth = 0;
  var login = req.param("auth_login");
  var pass  = req.param("auth_password");
  
  if(login==undefined || login=="" || pass==undefined || pass==""){
    req.info_redirect = "для авторизации введите логин и пароль";
    return r_function_get(req,res,next);
  }

  //res.end(dump.var_dump_node("m",m,{hide_functions:1}));
  var options = {
          is_auth: 1,
          render_file: __dirname +"/auth.html",
          auth_name: "авторизация не пройдена",
          info_redirect: req.info_redirect ? req.info_redirect : "",
          requery_login: 0,
          login: login,
          pass: pass,
          time_auth: time_auth, //<%= time_auth %>
          m: m,
          test: 1
  };
  if(auth_try_counter>30){
      l.reder_template(req,res,options,function(err,html){
            res.end(html);
            l.log_console_load_show(null," end load auth, bad user!!");
      });
      return 0;
  }
  
  var query_str = "SELECT CAST(t.id_user AS integer) AS id_user,t.login,";
  query_str += "t.mail,t.vizit_count,t.last_vizit,t.is_admin,t.is_moder,t.is_poster FROM uwi1_user t WHERE t.is_ban=0 AND ";
  if(login.indexOf("@")>=0){
    query_str += "UPPER(t.mail)=UPPER(TRIM('"+login+"')) ";
  }else{
    query_str += "UPPER(t.login)=UPPER(TRIM('"+login+"')) ";
  }
  query_str += " AND t.pass='"+pass+"' ";
  
  db.query(query_str,function(err, rows){
      if(err) throw err;
      //рендерим html
      var id_user = 0;
      if(rows.length>0){
        id_user = rows[0].id_user;
      }
      
      if(id_user>0){
        options.auth_name = "добро пожаловать "+rows[0].login;
        user = {};
        user.id_user      = id_user;
        user.login        = rows[0].login;
        user.mail         = rows[0].mail;
        user.last_vizit   = (new Date(Date.parse(rows[0].last_vizit))).getTime();
        user.vizit_count  = rows[0].vizit_count;
        user.is_admin     = rows[0].is_admin;
        user.is_moder     = rows[0].is_moder;
        user.is_poster    = rows[0].is_poster;
        
        user_auth_successful(req,user);
      }
      
      l.reder_template(req,res,options,function(err,html){
            res.end(html);
            l.log_console_load_show(null," end load auth");
      });
  });

}

function user_auth_successful(req,user){
  var app = req.app;
  var l = app.locals;
  var m = l.modules;
  
  l.modules_app.session.set_user_auth(req,user);
  //req.session.user = user;
  
  var db = m.db;
  var info = "ip:\""+m.ip.get_client_ip(req)+"\"";
  var query_str = "SELECT vizit_count FROM update_user_vizit("+user.id_user+",'"+info+"','"+req.session.session_id+"')";
  
  db.query(query_str,function(err, rows){
      if(err) throw err;
  });
}

function r_function_get(req,res,next){
  var app = req.app;
  var l = app.locals;
  var m = l.modules;
  
  var options = {
      is_auth: 0,
      auth_name: "авторизация",
      info_redirect: req.info_redirect ? req.info_redirect : "",
      render_file: __dirname +"/auth.html",
      time_auth: 0,
      test: 1
  };

  
  if(req.param("exit")!==undefined){
      options.is_auth = 2;
      options.auth_name = "до скорых встреч";
      //req.session.user = undefined; //удаляем пользовательскую инфу по сессиям
      l.modules_app.session.set_user_auth(req,null);
  }else{
      //если пользователь не выходит, то засчитываем попытку авторизации
      var int_auth_try = Number(req.session.auth_try);
      var last_auth_try = new Date(int_auth_try);
      //if(last_auth_try==null || !(last_auth_try instanceof Date)) last_auth_try = (new Date());
      var time_auth = m.mystr.time_duration_str(last_auth_try,(new Date()));
      
      req.session.auth_try = (new Date()).getTime();
      
      if(req.info_redirect===undefined || req.info_redirect==null) req.info_redirect = "";
  }

  options.time_auth = time_auth;

  
  l.reder_template(req,res,options,function(err,html){
        res.end(html);
        l.log_console_load_show(null," end load auth");
  });
}

