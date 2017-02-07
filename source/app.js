require([
  './models',
  './postChannel',
],function(
  models,
  postChannel
){

  var main_vm = new Vue({
    el : '#main',
    data : {

      tasks : [],
    },
    methods : {

      add_task : function() {

        // 
        // 弹个窗口或者切换view 
        // 
        var task = new models.task();

        var callback = function() {
          task.create(function() {
            main_vm.tasks.unshif(task);
          });
        };

      },

      add_progress : function( task ) {

        //
        // 弹个窗口
        //
        var task_progress = new models.task_progress();
        var callback = function() {
          task_progress.save(function() {
            task.histories.unshif( task_progress );
          });
        };

      }
    }
  });

  var insert_into_arr= function  ( arr_origin, start, remove, arr) {
      var args = [start, remove].concat(arr);

      arr_origin.splice.apply(arr_origin, args);
  };

  var test_task = new models.task({
    name : '测试',
    background : 'ui测试'
  });

  var test_progress = new models.task_progress({
    content : '测试进度'
  })

  test_task.histories.push(test_progress);
  main_vm.tasks.push(test_task);


  models.get_all_todos( function( err, tasks ) {
    if( err  ) {
      console.log( err );
      return;
    }

    insert_into_arr( main_vm.tasks, 0, 0, tasks);

    tasks.forEach(function( task ) {
      task.init(function() {
        console.log( task.id, 'task.init' );
      });
    });
  });

});