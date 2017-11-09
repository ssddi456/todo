require([
  './task_mixin',
  './util',
  './localconf',
  './misc',
  './modals',
  './models',
  './postChannel',
], function(
  task_mixin,
  util,
  localconf,
  misc,
  modals,
  models,
  postChannel
) {

  var weeks = [];
  var today_date = new Date();

  var today_day = today_date.getDay();
  var start_date = new Date(today_date.getTime());
  start_date.setDate(start_date.getDate() - today_date.getDay());

  var start_time = start_date.getTime();
  var today;
  for (var weekCount = 0; weekCount < 3; weekCount++) {
    var week = [];
    weeks.push(week);
    for (var dayCount = 0; dayCount < 7; dayCount++) {
      var day_date = new Date(start_time);
      day_date.setDate(start_date.getDate() + weekCount*7 + dayCount);
      var day = {
        time: day_date.getTime(),
        date: day_date,
        day: dayCount,
        date: day_date.getDate(),
        month: day_date.getMonth() + 1,
        year: day_date.getFullYear(),
        events: [],
        is_today: false,
      };

      if( 
        day_date.getFullYear() === today_date.getFullYear() 
        && day_date.getMonth() === today_date.getMonth() 
        && day_date.getDate() === today_date.getDate()
      ){
        day.is_today = true;
        today = day;
      }


      init_events_for_day(day);
      week.push(day);
    }
  }

  function init_events_for_day(day) {

  }

  var nav_vm = new Vue({
    el: '#nav',
    data: {
      filter_text: '',
    },
    methods: {
      add_task: function() {},
    },
    watch: {
      filter_text: function(filter_text) {

      }
    }
  });

  var main_vm = new Vue({
    el: '#main',
    data: {
      today: today,
      weeks: weeks,

      tasks: []
    },
    mixins: [task_mixin],
    methods: {
      init_calender: function() {

      },
    },
  });

  main_vm.init_calender();
});