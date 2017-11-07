require([
  './task_mixin',
  './util',
  './localconf',
  './misc',
  './modals',
  './models',
  './postChannel',
],function(
  task_mixin,
  util,
  localconf,
  misc,
  modals,
  models,
  postChannel
){

  var nav_vm = new Vue({
    el : '#nav',
    data: {
      show_all: false
    },
    methods : {
      add_task : function() {

        // 
        // 弹个窗口或者切换view 
        // 
        var task = new models.task();
        task.show_details = true;

        var callback = function( err, data ) {
          task.create(function( err ) {
            if( !err ){
              main_vm.tasks.unshift(task);
            }
          });
        };

        modals.task_edit({ data : task }, callback );

      },
      switch_show_all: function(e) {
          this.show_all = e.target.value;
      }
    },
    watch: {
      show_all: function(show_all, old) {
        localconf.set('show_all', 1 * show_all);

        main_vm.init_task_list();
      }
    }
  });

  var main_vm = new Vue({
    el : '#main',
    data : {
      tasks : [],
    },
    mixins : [task_mixin],
    methods : {

      init_task_list : function() {
          
        var show_all = localconf.get('show_all');
        var init_method;
        var self = this;

        if( show_all ){
          init_method = 'get_all_todos';
        } else {
          init_method = 'get_open_todos'
        }

        models[init_method]( function( err, tasks ) {
          if( err  ) {
            console.log( err );
            return;
          }

          util.insert_into_arr( self.tasks, 0, self.tasks.length, tasks);

          tasks.forEach(function( task ) {
            task.init(function() {
              task.load_history(function() {
                console.log(  'task.init', task.id );
              })
            });
          });
        });
      }
    },
  });


  main_vm.init_task_list();

});