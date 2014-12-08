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
    var ob_keys = keys.filter(function( k ) {
      return skips.indexOf(k) == -1;
    });
    var ret = function( init ) {
      var data = $.extend(this, properties, init);
      var self =  this;
      ob_keys.forEach(function( k ){
        self[k] = $.isArray(self[k]) ? 
                    ko[ 'observableArray' ]( self[k].slice(0) ) :
                    ko[ 'observable' ]( self[k] );
      });
    }

    ret.derive = derive_binding;

    $.extend( ret.prototype,{
      unobserve : function() {
        var self = this;
        self.unobserved = true;
        ob_keys.forEach(function(k) {
          try{
            self[k] = self[k]()
          } catch(e){
            console.log( e );
          }
        });
      }
    }, prototype);
    return ret;
  };
  util.klass = function( properties, prototype ) {
    var keys = Object.keys(properties); 
    var ret = function( init ) {
      var data = $.extend(this, properties, init);
      Object.keys(data).forEach(function( k ) {
        if( Array.isArray(data[k]) ){
          data[k] = data[k].slice(0);
        }
      })
    }

    ret.derive = derive_binding;
    ret.prototype = prototype;
    return ret;  
  }

  var day = 1e3 * 60 * 60 * 24;

  util.n_days = function( n ) {
    return n * day;      
  }

  util.clamp = function( cur, min, max) {
    return Math.max(min,Math.min(cur,max));
  }
  return util;

});