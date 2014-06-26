define([
  'ko'
],function(
  ko
){
  
  var timeline = {
    range : ko.observableArray(),
  }

  function last_three_weeks () {
    var ret = [new Date()];
    var now = ret[0].getTime();

    var len = 3 * 7;
    var day = 24*60*60;

    for(var i = 0; i < len; i++ ){
      ret.unshift( new Date( now -= day ));
    }
    return ret;
  }

  console.log( last_three_weeks () );
});