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

  var person_model = model({
    attrs: {
      autoInitial: true,
      displayFormat: JSON.parse,
      submitFormat: JSON.stringify,
      type: function(n) {
        return n || {};
      }
    },
    finish_events: {
      autoInitial: true,
      displayFormat: JSON.parse,
      submitFormat: JSON.stringify,
      type: function(n) {
        return n || [];
      }
    }
  });

  var pp = person_model.prototype;
  pp.finish = function(schedular){
    this.attrs[schedular.reward_name] = this.attrs[schedular.reward_name] || 0;
    this.attrs[schedular.reward_name] += schedular.reward_number;
    this.finish_events.push(schedular);
  };

  return person_model;
});