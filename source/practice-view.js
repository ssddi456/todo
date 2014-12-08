require.config({
  paths : {
    knockout     : 'http://cdn.staticfile.org/knockout/3.1.0/knockout-debug',
    jquery       : 'http://cdn.staticfile.org/jquery/1.10.0/jquery',
    'underscore' : 'http://cdn.staticfile.org/underscore.js/1.6.0/underscore'
  },
  map :{
    '*' :{
      ko : 'knockout'
    }
  }
})

require([
  '../bower_components/ko_custom_bindings/ko.drag',
  './util', 
  'knockout'
],function(
  kodrag,
  util,
  ko
){
  var day    = 24*60*60*1e3;
  var week   = day *   7;
  var month  = week *  4;
  var season = month * 3;
  var year   = season *4;

  var task= util.koModule({
              finish    : false,
            });

  var date_range= util.klass({
                    current_tasks : [],
                    past_tasks    : [],
                    task_data     : {
                      name        : 'test',
                      frequency   : 'daily'
                    },
                    on_range_start : function() {
                      this.current_tasks([]);
                      this.current_tasks.push( new task( this.task_data ) );
                    },
                    on_range_end   : function() {
                      var past_tasks =
                      this.past_tasks([].concat.apply(
                                      this.past_tasks(),
                                      this.current_tasks().map(function( task ) {
                                        task.unobserve();
                                        return task;
                                      }) ));
                    },
                    last_check     : 0,
                    check_interval : day
                  }).derive(function() {
                    check_points.push(this);
                    this.current_tasks = ko.observableArray(this.current_tasks);
                    this.past_tasks    = ko.observableArray(this.past_tasks);

                    this.on_range_start();
                  });

  var check_points = [];
  function check_date_range () {
    var now = Date.now();
    check_points.forEach(function(check_point) {
      var delta = now - check_point.last_check;
      while( (delta -= check_point.check_interval) >= 0 ){
        check_point.on_range_end();
        check_point.on_range_start();
        check_point.last_check += check_point.check_interval;
      }
    });
  }

  var vm = {
    check_points : ko.observableArray([]),
    finish_task  : function( vm ) {
      vm.finish(true);
    },
    next_day     : function() {
      this.now += day;
      check_date_range();
    },
    now  : 0
  };
  Date.now  = function() {
    return vm.now;
  };
  check_points.push = function( item ) {
    Array.prototype.push.call(check_points,item);
    vm.check_points.push(item);
  }


  new date_range({
                  task_data : {
                    name      : '仰卧起坐*30',
                    frequency : 'daily'
                  }
                });
  new date_range({
                  task_data : {
                    name      : '俯卧撑*20',
                    frequency : 'daily'
                  }
                });
  new date_range({
                  task_data : {
                    name      : '两次长跑',
                    frequency : '2/7 week'
                  },
                  check_interval : week
                });
  new date_range({
                  task_data : {
                    name      : '上两天班',
                    frequency : '5/7 week'
                  },
                  check_interval : week
                });
  new date_range({
                  task_data : {
                    name      : '领工资',
                    frequency : 'monthly'
                  },
                  check_interval : month
                });
  ko.applyBindings(vm);
});