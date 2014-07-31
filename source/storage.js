define([
  'jquery',
  'underscore'
],function(
  $,
  __
){

  // to auto sync data to storage 
  // 
  // debounce run store process
  // 
  // add/update
  // query
  // delete
  // 

  function storage () {
    var self = this;
    this.type = "localstorage";
    this.store_path = "";

    this.internal = 300;
    this.data = {};
    this.save = _.throttle( function() {
                  self.save_immediate();
                },this.internal);
  };


  function get ( key ) {
    var ret = this.data;
    var keys = key.split('.');
    var k;
    for(var i = 0; k = keys[i]; i++){
      ret = ret[k];
      if( ret == undefined || ret == null ){
        return ret;
      }
    }
    return ret;
  }
  function set ( key, val ) {
    var ret = this.data;
    var keys = key.split('.');
    var k;
    for(var i = 0; k = keys[i]; i++){
      if( i == (keys.length-1) ){
        ret[k] = val;
      } else if( ret[k] == undefined || ret[k] == null ){
        ret = ret[k] = {};
      } else {
        ret = ret[k];
      }
    }
    this.save();
  }
  function del ( key ){
    var ret = this.data;
    var keys = key.split('.');
    var k;
    for(var i = 0; k = keys[i]; i++){
      if( i == (keys.length-1) ){
        ret[k] = undefined;
      } else if( ret[k] == undefined || ret[k] == null ){
        return;
      }
    }
    this.save();
  }
  function load () {
    var self = this;
    if( this.type == 'localstorage' ){
      this.data = JSON.parse(localStorage.getItem( this.store_path )||'{}');
    } else {
      $.get(this.store_path,function( e ) {
        this.data = JSON.parse(e ||'{}');
      });
    }
  }
  function save() {
    if( this.type == 'localstorage' ){
      localStorage.setItem( this.store_path, JSON.stringify(this.data));
    } else {
      $.post(this.store_path,{ data : this.data});
    }
  }



  $.extend(storage.prototype,{
    get  : get,
    set  : set,
    del  : del,
    load : load,
    save_immediate : save
  });
  ['push','pull','shift','unshift'].forEach(function( arr_act, idx ) {
    storage.prototype[arr_act] = function( key, val ) {
      var ret = this.data;
      var keys = key.split('.');
      var k;
      for(var i = 0; k = keys[i]; i++){
        if( i == (keys.length-1) ){
          if( ret[k] == undefined || ret[k] == null ){
            ret[k] = [];
          } else if( !ret[k].slice ){
            throw new Error('target is not array');
          }
          ret = ret[k][arr_act]( val );
          this.save();      
          return ret; 
        } else if( ret[k] == undefined || ret[k] == null ){
          ret = ret[k] = {};
        } else {
          ret = ret[k];
        }
      }
    };
  });
  return storage
});