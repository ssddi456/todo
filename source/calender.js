require([
  './schedular',
  './task_mixin',
  './util',
  './localconf',
  './misc',
  './modals',
  './models',
  './postChannel',
], function(
  schedular,
  task_mixin,
  util,
  localconf,
  misc,
  modals,
  models,
  postChannel
) {


  var create_at = Date.now();
  var three_day_events = new models.calender_event();
  three_day_events.create_at = create_at;
  three_day_events.name = '每日任务 - 三天一次';
  three_day_events.schedular = {
    day: 3
  };
  var saturday_and_sunday = new models.calender_event();
  saturday_and_sunday.create_at = create_at;
  saturday_and_sunday.name = '每周任务 - 周六周日';
  saturday_and_sunday.schedular = {
    week: {
      weeks: 1,
      weekdays: [0, 6]
    }
  };
  var twoweek_wed_fri = new models.calender_event();
  twoweek_wed_fri.create_at = create_at;
  twoweek_wed_fri.name = '双周任务 - 周三周五';
  twoweek_wed_fri.schedular = {
    week: {
      weeks: 2,
      weekdays: [3, 5]
    }
  };
  var nov_20 = new models.calender_event();
  nov_20.create_at = create_at;
  nov_20.name = '十一月二十';
  nov_20.schedular = {
    month: {
      months: [11],
      dates: [20]
    }
  };

  var events = [
    three_day_events,
    saturday_and_sunday,
    twoweek_wed_fri,
    nov_20,
  ];


  function init_events_for_day(day) {
    events.forEach(function(event) {
      if (schedular.match(event, day)) {
        console.log('yes we found a event');
        day.events.push(event);
      }
    });
  }



  var weeks = [];
  var today_date = new Date();

  var today_day = today_date.getDay();
  var start_date = new Date(today_date.getTime());
  start_date.setDate(start_date.getDate() - today_date.getDay());

  var start_time = start_date.getTime();
  var today;
  var start_day;
  var day_names = [
    '星期天',
    '星期一',
    '星期二',
    '星期三',
    '星期四',
    '星期五',
    '星期六'
  ];

  for (var weekCount = 0; weekCount < 3; weekCount++) {
    var week = [];
    weeks.push(week);
    for (var dayCount = 0; dayCount < 7; dayCount++) {
      var day_date = new Date(start_time);
      day_date.setDate(start_date.getDate() + weekCount * 7 + dayCount);
      var day = {
        date_info: day_date,
        time: day_date.getTime(),
        day: dayCount,
        display_day: day_names[dayCount],
        date: day_date.getDate(),
        display_date: '',
        month: day_date.getMonth() + 1,
        year: day_date.getFullYear(),
        events: [],
        is_today: false,
      };
      day.display_date = day.month + '-' + day.date;

      if (
        day_date.getFullYear() === today_date.getFullYear() &&
        day_date.getMonth() === today_date.getMonth() &&
        day_date.getDate() === today_date.getDate()
      ) {
        day.is_today = true;
        today = day;
      }

      if (weekCount === 0 &&
        dayCount === 0
      ) {
        start_day = day
        start_day.display_date = day.year + '-' + day.month + '-' + day.date;
      } else {
        if (day.year != start_day.year) {
          day.display_date = day.year + '-' + day.month + '-' + day.date;
        }
      }

      init_events_for_day(day);
      week.push(day);
    }
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


  new models.person();

  var main_vm = new Vue({
    el: '#main',
    data: {
      today: today,
      weeks: weeks,
      select_day: today,
      person: new models.person(),
      tasks: []
    },
    mixins: [],
    methods: {
      add_events: function() {
        var calender_event = new models.calender_event();
        modals.calender_event_edit(calender_event, function() {
            
        });
      },
      init_calender: function() {

      },
    },
  });

  console.log( main_vm.person );

  main_vm.init_calender();
});