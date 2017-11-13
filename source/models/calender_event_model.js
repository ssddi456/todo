define([
  '../schedular',
  '../postChannel',
  '../util',
  './model'
], function(
  schedular,
  postchannel,
  util,
  model
) {
  var noop = util.noop;

  var calender_event_model = model({
    name: '',
    background: '',
    schedular: {
      autoInitial: true,
      displayFormat: JSON.parse,
      submitFormat: JSON.stringify,
      type: schedular,
    },

    create_at: {
      readonly: true,
      initial: 0,
    },

    visible: {
      viewonly: true,
      type: Boolean,
      initial: true
    },

    reward_name: '',

    reward_number: {
      type: Number,
      initial: 1
    },

  });

  var cemp = calender_event_model.prototype;
  cemp.finish = function(person) {
    person[this.reward_name] = person[this.reward_name] || 0;
    person[this.reward_name] += this.reward_number;
  }

  cemp.save = function(done) {
    var self = this;
    done = done || noop;
    postchannel({
      method: 'POST',
      command: '/calender/save',
      data: this.toJSON(),
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

  // {
  //   day: nth_of_day,
  //   week: {
  //     weeks: nth_of_week,
  //     weekdays: [number],
  //   },
  //   month: {
  //     months: [number],
  //     dates: [number | last],
  //     week: {
  //       weeks: [number],
  //       weekdays: [number]
  //     },
  //   },
  // }

  return calender_event_model;
});