console.log('load test..');

var run_test_count = 0;
function run_test(){
  console.log('run_test()');
  run_test_count++;
  
  var test_var_value = 0;
  module.exports.set_var_value = function(new_var_value){
    test_var_value = new_var_value;
  }
  
  module.exports.get_info = function(info_name){
    console.log(info_name+': run_test_count=='+run_test_count+'; test_var_value=='+test_var_value);
  }
}

run_test();



//module.exports = function (type){}
  
