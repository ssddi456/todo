define([
  './misc'
],function(
  misc
){
  var postChannel = function( optn, callback ) {
    var params = {};
    for(var k in optn){
      if( k == 'command' ){
        params.url = optn[k];
      } else if( optn.hasOwnProperty(k) ){
        params[k] = optn[k];
      }
    }
    console.log( params );
    params.success = function( data ) {
      if( data.msg ){
        misc.toast(data.msg, data.err);
      }

      if( data.err == 0 ){
        callback(null, data);
      } else {
        callback(data);
      }
    }

    params.error = function(e) {

      if( e.responseText ){
        try{
          var data = JSON.parse(e.responseText);
        } catch(_e){
          callback(e);
          return;
        }
        params.success(data);
      } else {
        callback(e);
      }
    }

    $.ajax(params);
  };
  return postChannel;
});