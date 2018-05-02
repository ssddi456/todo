define([
  './task_progress_model',
  '../postChannel',
  '../util',
  './model'
], function(
  task_progress_model,
  postchannel,
  util,
  model
) {
  var noop = util.noop;
  var toggle = util.toggle;

  //
  //   so i should learn json schema
  //   and export json schema from typescript
  // 
  var task_model = model({
    name: '',
    background: '',
    status: 'open',

    emergency: {
      initial: 0,
      type: Number
    },

    important: {
      initial: 0,
      type: Number
    },

    create_at: {
      readonly: true,
      initial: 0
    },

    lastest_update: {
      readonly: true,
      initial: 0
    },

    finished_at: {
      readonly: true,
      initial: 0
    },

    status_change: {
      readonly: true,
      initial: {}
    },
    visible: {
      viewonly: true,
      type: Boolean,
      initial: true
    },
  });

  var task = function(id) {
    if (arguments.length == 0) {
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

    this.filter_progress = function(status) {
      if (status == 'inprogress') {
        return self.show_unfinished;
      } else if (status == 'finished') {
        return self.show_finished;
      }
      return true;
    };

    this.from_create = util.format_time((this.lastest_update || Date.now()) - this.create_at);

    this.change_status = this.change_status.bind(this);
  };

  var tp = task.prototype;
  tp.toJSON = task_model.prototype.toJSON;

  tp.init = function(done) {
    var self = this;
    postchannel({
      method: 'GET',
      command: '/tasks/load',
      data: {
        task_id: self.id
      }
    }, function(err, data) {
      if (err) {
        done(err);
      } else {
        task.call(self, data.data);
        done();
      }
    });
  };

  tp.create = function(done) {
    var self = this;
    postchannel({
      method: 'POST',
      command: '/tasks/create',
      data: self.toJSON()
    }, function(err, data) {
      if (err) {
        done(err);
      } else {
        data = data.data;

        self.id = data.id;
        self.create_at = data.create_at;

        done();
      }
    });
  };

  var status_list = [
    'hole',
    'open',
    'finished'
  ];
  // 这个现在应该是一个select
  // 需要改一下。
  tp.change_status = function(status, done) {
    if (status_list.indexOf(status) == -1) {
      console.error(status, 'is not a valide status');
      return;
    }
    this.status = status;

    this.save(done);
  };

  tp.save = function(done) {
    var self = this;
    done = done || noop;

    postchannel({
      method: 'POST',
      command: '/tasks/save',
      data: self.toJSON()
    }, function(err, data) {
      // 应该把data还原到本身上
      if (err) {
        done(err);
      } else {
        done();
      }
    });
  };

  tp.load_history = function(done) {
    var self = this;
    postchannel({
      method: 'GET',
      command: '/tasks/load_history',
      data: {
        task_id: this.id
      }
    }, function(err, data) {
      if (err) {
        done(err);
      } else {
        data = data.data;

        var args = [0, self.histories.length].concat(data.map(function(node) {
          return new task_progress_model(node);
        }));

        self.histories.splice.apply(self.histories, args);
        done();
      }
    });
  };

  tp.get_time_scale = function() {
    // 定义域
    var start = this.create_at || 0;
    var end = Date.now();
    var allProcessFinished = true;
    var latestTime = 0;

    this.histories.forEach(function(progress) {

      if(progress.status != 'finished' ) {
        allProcessFinished = false;
      }

      var deadline = progress.deadline;
      if (deadline) {
        latestTime = Math.max(latestTime, deadline);
      }

      if (start === 0 && (progress.create_at || 0) !== 0) {
        start = progress.create_at;
      }

      if (progress.create_at) {
        start = Math.min(start, progress.create_at);
      }

      var deadline_change = progress.deadline_change || {};
      for (var k in deadline_change) {
        if (deadline_change.hasOwnProperty(k)) {
          latestTime = Math.max(latestTime, deadline_change[k]);
        }
      }

      var status_change = progress.status_change || {};
      for (var k in status_change) {
        if (status_change.hasOwnProperty(k)) {
          latestTime = Math.max(latestTime, parseInt(k));
        }
      }
    });

    if(latestTime === 0){
      latestTime = Date.now();
    }
    if(allProcessFinished) {
      end = Math.max(start + 1, latestTime);
    }

    var define_delta = end - start;

    // 值域
    var min = 0;
    var max = 100;
    var value_delta = max - min;

    return function(input_time) {
      var delta = input_time - start;
      console.log(delta, define_delta, Math.floor(delta / define_delta));
      return Math.floor(delta / define_delta * value_delta) + min;
    }
  };

  tp.add_progress = function(progress, done) {
    var self = this;
    progress = new task_progress_model(progress);
    progress.parent_id = this.id;
    progress.save(function(err) {
      if (err) {
        done(err);
      } else {
        self.histories.push(progress);
        done();
      }
    });
  };

  return task;
});