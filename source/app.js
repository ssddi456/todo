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

  var nav_vm = new Vue({
    el: '#nav',
    data: {
      show_all: localconf.get('show_all'),
      filter_text: '',
    },
    methods: {
      add_task: function() {

        // 
        // 弹个窗口或者切换view 
        // 
        var task = new models.task();
        task.show_details = true;

        var callback = function(err, data) {
          task.create(function(err) {
            if (!err) {
              main_vm.tasks.unshift(task);
            }
          });
        };

        modals.task_edit({
          data: task
        }, callback);

      },
      switch_show_all: function(e) {
        this.filter_text = '';
        var show_all = this.show_all = e.target.value;
        localconf.set('show_all', show_all);
        main_vm.init_task_list();
      }
    },
    watch: {
      filter_text: function(filter_text) {
        var tasks = main_vm.tasks;
        tasks.forEach(function(task) {
          if (!filter_text) {
            task.visible = true;
          }

          if(task.name.indexOf(filter_text) != -1 
            || task.background.indexOf(filter_text) != -1 
          ){
            task.visible = true;
          } else {
            task.visible = false;
          }
        });
      }
    }
  });

  var main_vm = new Vue({
    el: '#main',
    data: {
      tasks: []
    },
    mixins: [task_mixin],
    methods: {

      init_task_list: function() {

        var show_all = localconf.get('show_all');
        var init_method = {
          open: 'get_open_todos',
          hole: 'get_hole_toods',
          finished: 'get_finish_toods',
          all: 'get_all_todos',
        }[show_all];

        var self = this;

        if (!(init_method in models)) {
          console.error(init_method, 'not found');
          return;
        }

        models[init_method](function(err, tasks) {
          if (err) {
            console.log(err);
            return;
          }

          util.insert_into_arr(self.tasks, 0, self.tasks.length, tasks);

          tasks.forEach(function(task) {
            task.init(function() {
              task.load_history(function() {
                console.log('task.init', task.id);
              })
            });
          });
        });
      },


    },
  });


  main_vm.init_task_list();

});