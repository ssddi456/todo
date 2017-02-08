define([
  './postChannel'
],function(
  postchannel
){

  function toggle ( obj, name ) {
      obj[name] = !obj[name];
  }
  
  var ret = {};
  var noop = function() {};

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

    this.change_status = this.change_status.bind(this);

  };


  var tpp = task_progress.prototype;
  tpp.toJSON = function() {
    var ret = {
      content : this.content,
      status : this.status,
      parent_id : this.parent_id,
    };
    if( this.id ){
      ret.id = this.id;
    }
    return ret;
  };
  tpp.change_status = function( done ) {
    if( this.status == 'inprogress' ){
      this.status = 'finished';
    } else {
      this.status = 'inprogress';
    }

    this.save(function() {
        
    })    
  };

  tpp.save = function( done ) {
    var self = this;

    postchannel({
      method : 'POST',
      command : '/task_progress/save',
      data : this.toJSON()
    }, function( err, data ) {
      if( err ){
        done(err);
      } else {

        if( !self.id && data.data ){
          selfid = data.data.id;
        }
        if( !self.create_at && data.data ){
          selfcreate_at = data.data.create_at;
        }

        done();
      }
    });

  };


  var task = ret.task = function( id ) {
    if( arguments.length == 0 ){

      this.id = '';
      this.name = '';
      this.background = '';
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
      this.background = '';
      this.status = '';

      this.create_at = Infinity;
      this.finished_at = Infinity;

    } else {
      
      this.id = id.id;
      this.name = id.name;
      this.background = id.background;
      this.status = id.status;

      this.create_at = id.create_at;
      this.finished_at = id.finished_at;

    }

    this.show_detail = false;
    this.show_finished = true;
    this.show_unfinished = true;

    this.histories = [];

    var self = this;

    this.toggle_detail = function() {
      toggle(self, 'show_detail');
    };

    this.toggle_filter_finish = function() {
      toggle(self, 'show_finished');
    };

    this.toggle_filter_unfinish = function() {
      console.log('call');
      toggle(self, 'show_unfinished');
    };

    this.filter_progress = function( status ) {
      console.log( 'filter!!!', status);

      if( status == 'inprogress' ){
        return self.show_finished;
      } else if ( status == 'finished' ){
        return self.show_unfinished;
      }
      return true;
    };
  };

  var tp = task.prototype;


  tp.toJSON = function() {
    var self = this;
    var ret = {
      name : this.name,
      background : this.background,
      status : this.status,
    };
    if( this.id ){
      ret.id = this.id;
    }
    return ret;
  };

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

  tp.save = function( done ) {
    var self = this;
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


  ret.get_all_todos = function( done ) {
    postchannel({
      method : 'GET',
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