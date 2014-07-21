define([
  'knockout',
  'jquery'
],function(
  ko,
  $
){
  var date_format = { 
                      'y+' : function ( date ){
                        return date.getFullYear();
                      },
                      'M+' : function ( date ){
                        return date.getMonth() + 1;
                      },
                      'd+' : function ( date ){
                        return date.getDate();
                      },
                      'h+' : function ( date ){
                        return date.getHours();
                      },
                      'm+' : function ( date ){
                        return date.getMinutes();
                      },
                      's+' : function ( date ){
                        return date.getSeconds();
                      },
                      'q+' : function ( date ){
                        return Math.floor((date.getMonth() + 3) / 3);
                      },
                      'S'  : function ( date ){
                        return date.getMilliseconds();
                      }
                    };
  var util = {
    format_datetime : function( datetime, tpl ) {
      var date = new Date( datetime );
      var tpl = tpl || 'yyyy-MM-dd';

      var res = tpl;
      var val, poly_val, matched;

      for (var key in date_format) {
        if ( RegExp("(" + key + ")").test( tpl ) ) {
          val = date_format[key](date);
          matched = RegExp.$1;
          poly_val= '000' + val;
          res = res.replace(matched, 
                            matched.length == 1 ?
                              val : 
                              poly_val.slice( poly_val.length - matched.length ) );
        }
      }
      return res;
    }
  };

  var derive_binding = function() {
    var args = [].slice.call(arguments);
    args.unshift(this);
    return util.derive.apply(null, args);
  };

  util.derive = function( sup, sub, proto ) {
    if( arguments.length == 2 && typeof sub != 'function' ){
      $.extend(sup.prototype, sub);
      return sup
    }

    var ret = function() {
      sup.apply( this, arguments );
      sub.apply( this, arguments );
    }
    ret.derive = derive_binding;

    $.extend( ret.prototype, sup.prototype, proto );
    return ret;
  };

  util.koModule = function( properties, skips, prototype ) {
    var keys = Object.keys(properties); 
    skips = skips ||[];
    var ret = function( init ) {
      var data = $.extend({}, properties, init);
      var self =  this;
      keys.forEach(function( k ){
        if( skips.indexOf(k) != -1 ){
          self[k] = data[k];
        } else {
          self[k] = $.isArray(data[k]) ? 
                      ko[ 'observableArray' ]( data[k].slice(0) ) :
                      ko[ 'observable' ]( data[k] );
        }
      });
    }

    ret.derive = derive_binding;
    $.extend( ret.prototype, prototype);
    return ret;
  };

  var day = 1e3 * 60 * 60 * 24;

  util.n_days = function( n ) {
    return n * day;      
  }

  util.clamp = function( cur, min, max) {
    return Math.max(min,Math.min(cur,max));
  }
  return util;

});