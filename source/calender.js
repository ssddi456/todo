require([
    './schedular',
    './task_mixin',
    './util',
    './localconf',
    './misc',
    './modals',
    './models',
    './postChannel',
  ],
  function(
    schedular,
    task_mixin,
    util,
    localconf,
    misc,
    modals,
    models,
    postChannel
  ) {

    function init_events_for_day(events, day) {
      events.forEach(function(event) {
        if (schedular.match(event, day)) {
          console.log('yes we found a event');
          day.events.push(event);
        }
      });
    }

    var day_names = [
      '星期天',
      '星期一',
      '星期二',
      '星期三',
      '星期四',
      '星期五',
      '星期六'
    ];

    var weeks = [];
    var days = [];
    var today;

    function setup_weeks() {
      var today_date = new Date();

      var today_day = today_date.getDay();
      var start_date = new Date(today_date.getTime());
      start_date.setDate(start_date.getDate() - today_date.getDay());

      var start_time = start_date.getTime();
      var start_day;

      for (var weekCount = 0; weekCount < 3; weekCount++) {
        var week = [];
        weeks.push(week);
        for (var dayCount = 0; dayCount < 7; dayCount++) {
          var day_date = new Date(start_time);
          day_date.setDate(start_date.getDate() + weekCount * 7 + dayCount);
          var day = {
            date_info: day_date,
            time: day_date.getTime(),
            day: dayCount + '',
            display_day: day_names[dayCount],
            date: day_date.getDate() + '',
            display_date: '',
            month: (day_date.getMonth() + 1) + '',
            year: day_date.getFullYear() + '',
            events: [],
            is_today: false,
            is_past: false,
          };
          day.display_date = day.month + '-' + day.date;

          if(day.time < today_date.getTime()){
            day.is_past = true;
          }

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


          week.push(day);
          days.push(day);
        }
      }
    };

    setup_weeks();

    var edit_event_mixin = {
      methods: {
        check_if_checked: function(arr, value) {
          return arr ? arr.indexOf(value) !== -1 : false;
        },
        toggle_checkbox_arr: function(arr, val, e) {
          var index = arr.indexOf(val);
          var checked = e.target.checked;

          if (checked && index < 0) {
            arr.push(val);
          } else if (!checked && index >= 0) {
            arr.splice(index, 1);
          }
        }
      },
      watch: {
        schedular: function(val) {
          console.log(val);
        },
        month_type: function() {
          var month = this.schedular.month;
          if (!month.week) {
            month.dates = undefined;
            month.week = {
              weeks: ['1'],
              weekdays: ['1']
            };
          } else {
            month.week = undefined;
            month.dates = ['1'];
          }
        }
      }
    };



    var nav_vm = new Vue({
      el: '#nav',
      data: {
        filter_text: '',
      },
      methods: {
        add_event: function() {
          var calender_event = new models.calender_event();

          calender_event.tab = 'day';
          calender_event.month_type = 'date';


          var modal_vm = new Vue({
            el: '#calender_event_edit',
            data: calender_event,
            mixins: [edit_event_mixin],
          });

          modals.calender_event_edit({
            data: calender_event,
            vm: modal_vm
          }, function() {
            calender_event.save(function() {
              main_vm.events.push(calender_event);
              main_vm.days.forEach(function(day) {
                if (schedular.match(calender_event, day)) {
                  day.events.push(day);
                }
              });
            });

          });
        },
      },
      watch: {
        filter_text: function(filter_text) {

        }
      }
    });

    var person = new models.person();
    var main_vm = new Vue({
      el: '#main',
      data: {
        days: days,
        events: [],
        today: today,
        weeks: weeks,
        select_day: today,
        person: person,

        events_of_the_week: []
      },
      mixins: [],
      methods: {
        edit_event: function(event) {

          event.tab = event.schedular.day ? 'day' : event.schedular.week ? 'week' : 'month';
          event.month_type = event.tab == 'month' ?
            (event.schedular.month.dates ? 'date' : 'week') : 'date';

          var modal_vm = new Vue({
            el: '#calender_event_edit',
            data: event,
            mixins: [edit_event_mixin],
          });

          modals.calender_event_edit({
            data: event,
            vm: modal_vm
          }, function() {
            event.save(function() {
              main_vm.days.forEach(function(day) {
                var eventIdx = day.events.indexOf(event);
                if (schedular.match(event, day)) {
                  if(eventIdx == -1){
                    day.events.push(event);
                  }
                } else {
                  if(eventIdx != -1){
                    day.events.splice(eventIdx, 1);
                  }
                }
              });
            });

          });

        },
        init_calender: function() {
          var self = this;
          models.get_events_from_remote(function(err, events) {
            if (err) {
              console.error(err);
            } else {
              events.forEach(function(event) {
                self.events.push(event);
              });

              days.forEach(function(day) {
                init_events_for_day(events, day);
              });
            }
          })
        },
        init_events: function() {
          var self = this;
          $.get('/change_of_week', function( data ) {
            if(data.data){
              data.data.sort().forEach(function( event ) {
                self.events_of_the_week.push(event);
              });
            }
          });
        }
      },
    });
    
    main_vm.init_calender();
    main_vm.init_events();

    function renew_today () {
        var today_date = new Date();
        var next_date =  new Date(today_date.getTime());
        next_date.setDate(next_date.getDate() + 1);
        next_date = new Date( next_date.getFullYear(), next_date.getMonth(), next_date.getDate());
        var to_next_day = next_date.getTime() - today_date.getTime();

        setTimeout(function() {
          weeks.splice(0, weeks.length);
          days.splice(0, weeks.length);
          setup_weeks();
          setTimeout(function() {
            renew_today();
          }, 100);
        }, to_next_day);
    }

    renew_today();

  });