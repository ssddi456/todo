define([

],function(

){
  
  var store;
  var store_key = 'todo_conf';
  var origin_conf =  localStorage.getItem(store_key) || "{}";

  try{
    store = JSON.parse(origin_conf);
  } catch(e){
    store = {};
  }

  var update_timer;
  function update_store () {
    clearTimeout(update_timer);
    update_timer = setTimeout(function() {
      localStorage.setItem(store_key, JSON.stringify(store));
    })
  }

  // 是否需要一个服务端的存储
  var ret = {
    set : function( key, val ) {
      store[key] = val;
      update_store();
    },
    get : function( key ) {
      return store[key];
    }

  };


  return ret;
});