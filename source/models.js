define([
  './postChannel'
],function(
  postchannel
){
  
  var ret = {};

  var task_progress  = ret.task_progress = function( id ) {
    if( arguments.length == 0 ){

      this.id = '';

      this.create_at = Infinity;
      this.finished_at = Infinity;

      this.parent_id = '';
      this.content = '';
      this.status = 'inprogress';

    } else if ( typeof id == 'string' ){

      this.id = id;

      this.create_at = Infinity;
      this.finished_at = Infinity;

      this.parent_id = '';
      this.content = '';
      this.status = 'inprogress';

    } else {
      
      this.id = id.id;

      // readonly
      this.create_at = id.create_at;
      this.finished_at = id.finished_at;

      this.parent_id = id.parent_id;
      this.content = id.content;
      this.status = id.status;
    }


  };


  var tpp = task_progress.prototype;
  tpp.toJSON = function() {
    return {
      id = this.id,
      content = this.content,
      status = this.status
    };
  };

  tpp.save = function( done ) {
    var self = this;

    postchannel({
      command : '/task_progress/save',
      data : this.toJSON()
    }, function( err, data ) {
      if( err ){
        done(err);
      } else {
        done();
      }
    });

  };

  tpp.done = function( done ) {
    var self = this;
    this.status = 'done';
    this.save(done);
  };

  tpp.undone = function( done ) {
    var self = this;
    this.status = 'inprogress';
    this.save(done);
  };


  var task = ret.task = function( id ) {
    if( arguments.length == 0 ){

      this.id = '';
      this.name = '';
      this.backgound = '';
      /**
       * open
       * close
       */
      this.status = 'open';

      this.create_at = Infinity;
      this.finished_at = Infinity;

    } else if ( typeof id == 'string' ){

      this.id = id;
      this.name = '';
      this.backgound = '';
      this.status = '';

      this.create_at = Infinity;
      this.finished_at = Infinity;

    } else {
      
      this.id = id.id;
      this.name = id.name;
      this.backgound = id.backgound;
      this.status = id.status;

      this.create_at = id.create_at;
      this.finished_at = id.finished_at;

    }

    this.show_childs = false;
    this.histories = [];
  };

  var tp = task.prototype;
  bp.toJSON = function() {
    var self = this;
    return {
      id : this.id,
      name : this.name,
      backgound : this.backgound,
      status : this.status,
    };
  };

  bp.init = function( done ) {
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

  bp.create = function( done ) {
    var self = this;
    postchannel({
      command : '/tasks/create'
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

  bp.save = function( done ) {
    var self = this;
    postchannel({
      command : '/tasks/save'
      data : self.toJSON()
    }, function( err, data ) {
      if( err ){
        done(err);
      } else {
        done();
      }
    });
  };

  bp.load_history = function( done ) {
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

  bp.add_progress = function( progress, done ) {
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


  ret.get_all_todos = function( done ) {
    postchannel({
      command : '/tasks/list',
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