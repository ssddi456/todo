define([
  '../postChannel',
  '../util',
  './model'
], function(
  postchannel,
  util,
  model
) {

  var noop = util.noop;
  var formatDate = util.formatDate;

  var task_progress_model = model({
    parent_id: '',
    content: '',
    status: 'inprogress',

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
      initial: 0,
    },

    lastest_update: {
      readonly: true,
      initial: Infinity
    },

    finished_at: {
      readonly: true,
      initial: 0,
    },
    status_change: {
      readonly: true,
      initial: {}
    },

    deadline_change: {
      readonly: true,
      initial: {}
    },

    deadline: {
      autoInitial: true,
      displayFormat: formatDate,
      submitFormat: function(datestring) {
        return new Date(datestring + ' 23:59:59').getTime();
      },
      type: Number
    }
  });



  var task_progress = function(id) {
    if (arguments.length == 0) {
      task_progress_model.prototype.create.call(this);
    } else {
      task_progress_model.prototype.create.call(this, id);
    }
    this.change_status = this.change_status.bind(this);

    this.show_update_past = function() {
      if (this.status == 'finished') {
        return false;
      }
      var lastest_update = this.get_last_update();
      if (lastest_update) {
        var delta = Date.now() - lastest_update;

        if (delta < util.day) {
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

  tpp.change_status = function(done) {
    if (this.status == 'inprogress') {
      this.status = 'finished';
    } else {
      this.status = 'inprogress';
    }

    this.save(done)
  };
  tpp.get_last_update = function() {
    return this.lastest_update || this.create_at;
  }

  tpp.save = function(done) {
    var self = this;
    done = done || noop;
    postchannel({
      method: 'POST',
      command: '/task_progress/save',
      data: this.toJSON()
    }, function(err, data) {
      if (err) {
        done(err);
      } else {

        if (!self.id && data.data) {
          self.id = data.data.id;
        }
        if (!self.create_at && data.data) {
          self.create_at = data.data.create_at;
        }

        done();
      }
    });

  };

  return task_progress;
});