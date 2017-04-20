require([
  './localconf',
  './misc',
  './modals',
  './models',
  './postChannel',
],function(
  localconf,
  misc,
  modals,
  models,
  postChannel
){

  var nav_vm = new Vue({
    el : '#nav',
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
      toggle_task_filter : function() {

          var show_all = localconf.get('show_all');
          if( show_all ){
            show_all = 0;
          } else {
            show_all = 1;
          }

          localconf.set('show_all', show_all);

          main_vm.init_task_list();

      }
    }
  });

  var main_vm = new Vue({
    el : '#main',
    data : {
      tasks : [],
    },
    methods : {


      edit_task : function( task ) {
        var callback = function( err, data ) {
          task.save(function() { });
        };

        modals.task_edit({ data : task }, callback );

      },
      
      add_task_progress : function( task ) {

        //
        // 弹个窗口
        //

        var task_progress = new models.task_progress();
        task_progress.parent_id = task.id;

        var callback = function( err, data ) {

          task_progress.save(function() {
            if( !err ){
              task.histories.unshift( task_progress );
            }
          });
        };

        modals.task_progress_edit({ data : task_progress }, callback );

      },

      edit_task_progress : function( task_progress ) {
        var callback = function( ) {
          task_progress.save(function() {
              
          });
        };

        modals.task_progress_edit({ data : task_progress }, callback );
      },
      init_task_list : function() {
          
        var show_all = localconf.get('show_all');
        var init_method;

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

          insert_into_arr( main_vm.tasks, 0, main_vm.tasks.length, tasks);

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

  var insert_into_arr= function  ( arr_origin, start, remove, arr) {
      var args = [start, remove].concat(arr);

      arr_origin.splice.apply(arr_origin, args);
  };


  main_vm.init_task_list();

});