var path    = require('path');
var debug_name = path.basename(__filename,'.js');
if( debug_name == 'index'){
  debug_name = path.basename(__dirname);
}
(require.main === module) && (function(){
    process.env.DEBUG = '*';
})()
var debug = require('debug')(debug_name);


var path = require('path');
var mongoclient = require('mongodb').MongoClient;
var events = require('events');
var util = {
  slice : function(arr) {
    return Array.prototype.slice.call(arr);
  }
};
var dbs = {};

/*
  实例化时自动连接mongodb
  方法调用先压入队列, 连接完成后调用队列。
*/

var config = require('../config');

function get_connect_url( dbname ) {

  var db_info = config.db[dbname] || {};

  return 'mongodb://'+( db_info.user 
                          ? ( db_info.user + ':' + db_info.pass +'@') 
                          : '')
                + ( db_info.host ||'localhost' )
                + ':' 
                + (db_info.port || '27017') +'/' + dbname
}

function mongo_collection( dbname, name ) {
  this.name = name;
  this.queue = [];
  
  this.ready = false;
  this.closed = false;

  this.db = null;
  this.collection = null;
  var self = this;
  var db_url = get_connect_url(dbname);
  mongoclient.connect( db_url, function( err, db ) {

    if( err ){
      debug(err);
      return;
    }
    debug('db connected', name);
    if( self.closed ){
      db.close();
      return;
    }
    self.ready = true;
    var collection = db.collection(name);
    self.db = db;
    self.collection = collection;
    self.queue.forEach(function( task ) {
      debug(name, typeof task);
      if (typeof task == 'function'){
        task(collection);
      } else{
        collection[task[0]].apply(collection, task[1]);
      }
    });
    self.queue = null;
  });
}
var proxy_methods = [
  'find',
  'findOne',
  'insert',
  'update',
  'updateOne',
  'updateMany',
  'drop'
];
proxy_methods.forEach(function( method ) {
  mongo_collection.prototype[method] = function() {
    var self = this;
    if( this.closed ){
      return;
    }

    var args = util.slice(arguments);
    debug('call method', this.name, method, args);
    var collection = this.collection;


    if( method == 'find' ){
      var rest = args.slice(0, -1);
      var last = args[args.length - 1];

      if( typeof last == 'function' ){
        var call = function( collection ) {
          collection.find.apply(collection, rest).toArray( last );
        }
        if( self.ready ){
          call( collection );
        } else {
          self.queue.push(call);
        }
      } else {
        var _callback;
        var _sort;
        var _limit;
        var _skip;
        var call = function( collection ) {
          var cursor = collection.find.apply(collection, args);
          if( _sort ){
            cursor = cursor.sort(_sort);
          }
          if( _limit ){
            cursor = cursor.limit.apply(cursor, _limit)
          }
          cursor.toArray(_callback);
        }
        var ret = {
          sort : function( sort ) {
            _sort = sort;
            return ret;
          },
          limit : function( limit ) {
            _limit = limit;
            return ret;  
          },
          exec : function( callback ) {
            _callback = callback;
            if( self.ready ){
              call( collection );
            } else {
              self.queue.push(call);
            }
          },
          skip : function( skip ) {
            _skip = skip;
            return ret;
          }
        };
        return ret;
      }
    } else {
      if( this.ready ){
        return collection[method].apply( this.collection, args);
      } else {
        this.queue.push([method, args]);
      }
    }
  }
});

mongo_collection.prototype.get_collection = function(handle) {
  if( this.closed ){
    return;
  }
  if( this.ready ){
    handle(this.collection);
  } else {
    this.queue.push(handle);
  }
};

mongo_collection.prototype.close = function() {
  if( this.ready ){ 
    this.db.close();
  }
  this.closed = true;
};

module.exports = function( dbname, collection_name ) {
  var name = dbname + '::' + collection_name;

  if( !dbs[name] ){
    dbs[name] = new mongo_collection( dbname, collection_name );
  }

  return dbs[name];
}
