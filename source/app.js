require([
  './misc',
  './modals',
  './models',
  './postChannel',
],function(
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
      }
    }
  });

  var insert_into_arr= function  ( arr_origin, start, remove, arr) {
      var args = [start, remove].concat(arr);

      arr_origin.splice.apply(arr_origin, args);
  };


  models.get_all_todos( function( err, tasks ) {
    if( err  ) {
      console.log( err );
      return;
    }

    insert_into_arr( main_vm.tasks, 0, 0, tasks);

    tasks.forEach(function( task ) {
      task.init(function() {
        task.load_history(function() {
          console.log(  'task.init', task.id );
        })
      });
    });
  });

});