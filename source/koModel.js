define([
  'ko'
],function(
  ko
){

  function koModel ( model ) {
    this.model = model;
    this.names = _.keys(model);
    this.subscribed = [];
    this.oncreate = undefined;

    this.trigger = this.trigger.bind(this);
  }
  var kmproto = koModel.prototype;

  kmproto.trigger=function() {
    var self = this;
    var args = arguments;
    _.each(self.subscribed,function(handle) {
      handle.apply(self,args);
    });
  }
  kmproto.subscribe=function(handle) {
    this.subscribed.push(handle);
  }
  
  kmproto.create = function(data) {
    var self = this;
    if( "function" === typeof data ){
      this.oncreate = data;
      return this;
    }
    if(_.isArray(data)){
      return data.map(function( data ){
         return self.create(data);
      });
    }
    var ret = {};
    _.each(this.model,function(defv, key) {
      var properkey = 'observable';
      if( defv == 'observableArray' ){
        properkey = 'observableArray';
        defv   = [];
      } else if( _.isArray(defv) ){
        properkey = 'observableArray';
      }
      ret[key] =  data.hasOwnProperty(key) ?
                    data[key]:
                    defv;
    });
    if( this.oncreate != undefined ){
      this.oncreate.call(ret,data);
    }
    return ret;
  }
  kmproto.createBind = function(data) {
    if(_.isArray(data)){
      return data.map(function( data ){
         return self.createBind(data);
      });
    }
    var self= this;
    var ret = {};
    _.each(this.model,function(defv, key) {
      var properkey = 'observable';
      if( defv == 'observableArray' ){
        properkey = 'observableArray';
        defv   = [];
      } else if( _.isArray(defv) ){
        properkey = 'observableArray';
      }
      ret[key] =  ko[properkey](
                    data.hasOwnProperty(key) ?
                      data[key]:
                      defv);
    });
    if( this.oncreate != undefined ){
      this.oncreate.call(ret,data);
    }

    ret.subscribe=function(handle) {
      var me = this;
      _.each(self.names,function(name) {
        me[name].subscribe(function() {
          handle(name, me);
        });
      });
      return this;
    }
    ret.subscribe(self.trigger);
    return ret;
  }
  kmproto.toKoArray  = function(data) {
    var self = this;
    return data.map(function(data){
      return self.createBind(data);
    });
  }
  kmproto.toDataArray= function(data) {
    var ret = [],r, self = this;
    _.each(data,function(data) {
      r = {};
      _.each(self.names,function(name) {
        r[name] = data[name]();
      });
      ret.push(r);
    });
    return ret;
  }
  
  return koModel
});