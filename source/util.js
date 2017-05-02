define([

],function(

){
  var ret = {};


  ret.minute = 60*1e3;
  ret.hour = ret.minute * 60;
  ret.day = ret.hour * 24;
  ret.week = ret.day * 7;

  ret.format_time = function( ms, tpl ) {

    var formated = {};
    tpl = tpl || '{{weeks}}周{{days}}日{{hours}}时';

    formated.weeks = Math.floor(ms/this.week);
    formated.days = Math.floor((ms%this.week)/this.day);
    formated.hours = Math.floor((ms%this.day)/this.hour);

    return tpl.replace(/\{\{([^}]+)\}\}([^ {}]+)/g, function( $, $1, $2 ) {
      var t = formated[$1];
      if( t > 0 ){
        return t + $2;
      } else {
        return '';
      }
    });
  };
  ret.format_date = function( time, tpl ) {
    time = new Date(time);
    tpl = tpl || '{{year}}年{{month}}月{{date}}日{{hour}}时'
    var formated = {
      year : time.getFullYear(),
      month : time.getMonth() + 1,
      date  : time.getDate(),
      hour : time.getHours(),
    };

    return tpl.replace(/\{\{([^}]+)\}\}([^ {}]+)/g, function( $, $1, $2 ) {
      var t = formated[$1];
      return t + $2;
    });
  };

  ret.insert_into_arr = function  ( arr_origin, start, remove, arr) {
      var args = [start, remove].concat(arr);

      arr_origin.splice.apply(arr_origin, args);
  };

  return ret;
});