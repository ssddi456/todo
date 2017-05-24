define([
  './util',
  './postChannel'
],function(
  util,
  postchannel
){
  var noop =function() {};


  var model = function( def ) {

    var update_keys = [];
    var all_keys = [];
    var defaults = {};
    var type = {};

    for(var k in def){
      if( k!= 'id' && k!= '_id' && def.hasOwnProperty(k)){

        all_keys.push(k);

        if( typeof def[k] != 'object' ){
          defaults[k] = def[k];
          update_keys.push(k);
        } else {

          if( 'initial' in def[k] ){
            defaults[k] = def[k].initial;
            if( def[k].type ){
              if( typeof def[k].type != 'function' ){
                throw new Error('illegal type decleration');
              }
              type[k] = def[k].type;
            }
            if( def[k].readonly ){
              // 不接受客户端上传的改动
            } else {
              update_keys.push(k);
            }
          } else {
            defaults[k] = def[k];
            update_keys.push(k);
          }
        }
      }
    }

    var ret = function( id ) {
      if( arguments.length == 0 ){
        this.create();
      } else if( typeof id == 'string' ){
        this.create();
        this.id = id;
      } else {
        this.create(id);
      }
    };
    // looks strange
    ret.prototype.create = function( obj ) {
      var i = 0;
      var len = all_keys.length;
      var k;
      obj = obj || defaults;
      for(;i<len;i++){
        k = all_keys[i];

        if( type[k] ){
          this[k] = type[k](obj[k]);
        } else {
          this[k] = obj[k];
        }
      }
      if( obj.id ){
        this.id = obj.id;
      }
    };

    ret.prototype.toJSON = function() {
      var ret = {};
      var i = 0;
      var len = update_keys.length;
      var k;
      for(;i<len;i++){
        k = update_keys[i];
        ret[k] = this[k];
      }

      if( this.id ){
        ret.id = this.id;
      }

      return ret;
    };

    return ret;
  }


  function toggle ( obj, name ) {
    if( obj[name] === 0 ){ 
      obj[name] = 1;
    } else if( obj[name] === 1 ){
      obj[name] = 0;
    } else {
      obj[name] = !obj[name];
    }
  }
  
  var ret = {};
  var noop = function() {};

  var task_progress_model = model({
      parent_id : '',
      content : '',
      status : 'inprogress',

      emergency : {
        initial : 0,
        type    : Number
      },

      important : {
        initial : 0,
        type    : Number
      },

      create_at : {
        readonly : true,
        initial : 0,
      },

      lastest_update : {
        readonly : true,
        initial : Infinity
      },

      finished_at : {
        readonly : true,
        initial : 0,
      },
      status_change : {
        readonly : true,
        initial : {}
      },
  });

  var task_progress  = ret.task_progress = function( id ) {
    if( arguments.length == 0 ){
      task_progress_model.prototype.create.call(this);
    } else {
      task_progress_model.prototype.create.call(this, id);
    }
    this.change_status = this.change_status.bind(this);

    this.show_update_past = function() {
      if( this.status == 'finished' ){
        return false;
      }
      var lastest_update = this.get_last_update();
      if( lastest_update ){
        var delta = Date.now() - lastest_update;

        if( delta < util.day ){
          return false;
        } else {
          return true;
        }
      }
      return false;
    };

    this.time_info = undefined;

    this.last_update_past = function() {
      var delta = Date.now() - this.get_last_update();
      return util.format_time(delta);
    };
  };


  var tpp = task_progress.prototype;
  tpp.toJSON = task_progress_model.prototype.toJSON;

  tpp.change_status = function( done ) {
    if( this.status == 'inprogress' ){
      this.status = 'finished';
    } else {
      this.status = 'inprogress';
    }

    this.save(done)
  };
  tpp.get_last_update = function() {
      return this.lastest_update || this.create_at;
  }

  tpp.save = function( done ) {
    var self = this;
    done = done || noop;
    postchannel({
      method : 'POST',
      command : '/task_progress/save',
      data : this.toJSON()
    }, function( err, data ) {
      if( err ){
        done(err);
      } else {

        if( !self.id && data.data ){
          self.id = data.data.id;
        }
        if( !self.create_at && data.data ){
          self.create_at = data.data.create_at;
        }

        done();
      }
    });

  };


  var task_model = model({
    name : '',
    background : '',
    status : 'open',

    emergency : {
      initial : 0,
      type    : Number
    },

    important : {
      initial : 0,
      type    : Number
    },

    create_at : {
      readonly : true,
      initial : Infinity
    },

    lastest_update : {
      readonly : true,
      initial : Infinity
    },

    finished_at : {
      readonly : true,
      initial : Infinity
    },

    status_change : {
      readonly : true,
      initial : {}
    },
  });

  var task = ret.task = function( id ) {
    if( arguments.length == 0 ){
      task_model.prototype.create.call(this);
    } else {
      task_model.prototype.create.call(this, id);
    }

    this.show_detail = false;
    this.show_finished = false;
    this.show_unfinished = true;

    this.histories = [];

    var self = this;

    this.toggle_important = function() {
      toggle(self, 'important');
      self.save(function() {
          
      });
    };

    this.toggle_emergency = function() {
      toggle(self, 'emergency');
      self.save(function() {
          
      });
    };

    this.toggle_detail = function() {
      toggle(self, 'show_detail');
    };

    this.toggle_filter_finish = function() {
      toggle(self, 'show_finished');
    };

    this.toggle_filter_unfinish = function() {
      toggle(self, 'show_unfinished');
    };

    this.filter_progress = function( status ) {
      if( status == 'inprogress' ){
        return self.show_unfinished;
      } else if ( status == 'finished' ){
        return self.show_finished;
      }
      return true;
    };

    this.from_create = util.format_time((this.lastest_update || Date.now()) - this.create_at);

    this.change_status = this.change_status.bind(this);
  };

  var tp = task.prototype;
  tp.toJSON = task_model.prototype.toJSON;

  tp.init = function( done ) {
    var self = this;
    postchannel({
      method : 'GET',
      command : '/tasks/load',
      data : {
        task_id : self.id
      }
    }, function( err, data ) {
      if( err ){
        done(err);
      } else {
        task.call(self, data.data);
        done();
      }
    });
  };

  tp.create = function( done ) {
    var self = this;
    postchannel({
      method : 'POST',
      command : '/tasks/create',
      data : self.toJSON()
    }, function( err, data ) {
      if( err ){
        done(err);
      } else {
        data = data.data;

        self.id = data.id;
        self.create_at = data.create_at;

        done();
      }
    });
  };

  tp.change_status = function( done ) {
    if( this.status == 'open' ){
      this.status = 'finished';
    } else {
      this.status = 'open';
    }

    this.save(done);
  };

  tp.save = function( done ) {
    var self = this;
    done = done || noop;

    postchannel({
      method : 'POST',
      command : '/tasks/save',
      data : self.toJSON()
    }, function( err, data ) {
      if( err ){
        done(err);
      } else {
        done();
      }
    });
  };

  tp.load_history = function( done ) {
    var self = this;
    postchannel({
      method : 'GET',
      command : '/tasks/load_history',
      data : {
        task_id : this.id
      }
    }, function( err, data ) {
      if( err ){
        done(err);
      } else {
        data = data.data;

        var args = [0, self.histories.length].concat(data.map(function( node ) {
            return new task_progress(node);
        }));

        self.histories.splice.apply(self.histories, args);
        done();
      }
    });
  };

  tp.get_time_scale = function() {
      // 定义域
      var start = this.create_at;
      var end = Date.now();
      var define_delta = end - start;

      // 值域
      var min = 0;
      var max = 100;
      var value_delta = max - min;

      return function( input_time ) {
          var delta = input_time - start;
          console.log( delta, define_delta, Math.floor(delta/define_delta) );
          return Math.floor( delta / define_delta * value_delta ) + min;
      }
  };

  tp.add_progress = function( progress, done ) {
    var self = this;
    progress = new task_progress(progress);
    progress.parent_id = this.id;
    progress.save(function(err) {
      if( err ){
        done(err);
      } else {
        self.histories.push(progress);
        done();
      }
    });
  };


  ret.get_open_todos = function( done ) {
    postchannel({
      method : 'GET',
      command : '/tasks/list',
      data   : {
        status : 'open'
      }
    }, function( err, data ) {

      if( err ){
        done(err);
      } else {
        done(null, data.tasks.map(function( node ) {
          return new task(node);
        }))
      }
    });
  };


  ret.get_all_todos = function( done ) {
    postchannel({
      method : 'GET',
      command : '/tasks/list'
    }, function( err, data ) {

      if( err ){
        done(err);
      } else {
        done(null, data.tasks.map(function( node ) {
          return new task(node);
        }))
      }
    });
  }

  return ret;

});