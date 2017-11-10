define([

], function(

) {

  var ret = function(m) {
    return m || {
      day: 1,
    };
  }

  var hour = 60 * 60 * 1000;
  var day = 24 * hour;
  var week = 7 * day;

  function match_day(delta_time, schedular) {
    var days = Math.floor(delta_time / day);
    return (days % schedular.day) === 0;
  }

  function match_week(delta_time, date_info, schedular) {
    var weeks = Math.floor(delta_time / week);
    var weekday = date_info.day;
    if (weeks % schedular.week.weeks === 0) {
      return schedular.week.weekdays.indexOf(weekday) !== -1;
    }
    return false;
  }

  function match_month(date_info, schedular) {
    var month_start_date = new Date(date_info.date_info.getTime());
    month_start_date.setDate(1);
    var month_start_day = month_start_date.getDay();
    var week = Math.floor((date_info.date + month_start_day) / 7);

    if (schedular.month.months.indexOf(date_info.month) !== -1) {
      if (schedular.month.dates) {
        return schedular.month.dates.indexOf(date_info.date) !== -1;
      } else if (schedular.month.week) {
        if (schedular.month.week.weeks.indexOf(date_info.week) !== -1) {
          return schedular.month.week.weekdays.indexOf(date_info.day);
        }
      }
    }
    return false;
  }

  ret.match = function(schedular, date) {
    var schedular_start_date = new Date(schedular.create_at);
    var delta_time = date.date_info.getTime() - schedular_start_date;

    if (schedular.schedular.day) {
      return match_day(delta_time, schedular.schedular);
    } else if (schedular.schedular.week) {
      return match_week(delta_time + schedular_start_date.getDay() * day, date, schedular.schedular);
    } else if (schedular.schedular.month) {
      return match_month(date, schedular.schedular);
    }
  }

  return ret;
});