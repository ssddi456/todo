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
      initial: Infinity,
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
  cemp.finish = function( person ) {
      person[this.reward_name] = person[this.reward_name] || 0;
      person[this.reward_name] += this.reward_number;
  }

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