define([
  './modals'
],function(
  modals
){
  
  return {
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
    }
  }
});