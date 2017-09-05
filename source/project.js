require([
    './util',
    './task_mixin',
    './localconf',
    './misc',
    './modals',
    './models',
    './postChannel',
], function(
    util,
    task_mixin,
    localconf,
    misc,
    modals,
    models,
    postChannel
) {

    var main_vm = new Vue({
        el: '#main',
        mixins: [task_mixin],
        data: {
            task: new models.task(main_task),
        },
        methods: {

        }
    });

    var color_map = {
        'start': 'white',
        'finished': 'green',
        'edit': 'blue',
    };

    main_vm.task.init(function() {
        main_vm.task.load_history(function() {
            console.log('task.init', main_vm.task.id);
            var scale = main_vm.task.get_time_scale();

            main_vm.task.show_detail = true;
            main_vm.task.show_finished = true;

            main_vm.task.histories.forEach(function(task_progress) {
                var start = task_progress.create_at;
                var changes = Object.keys(task_progress.status_change || {})
                    .map(Number)
                    .filter(Boolean)


                var times = [{
                        time: start,
                        type: 'start'
                    }].concat(changes.map(function(time) {
                        return {
                            time: time,
                            type: task_progress.status_change[time]
                        };
                    }))
                    .sort(function(a, b) {
                        return b.time - a.time;
                    })
                    .map(function(node) {
                        console.log(node);

                        node.percent = scale(node.time);
                        node.bgc = color_map[node.type];
                        node.label = util.format_date(node.time) + ' ' + node.type;
                        return node;
                    });

                task_progress.time_info = times;
                var deadline_info = task_progress.deadline_info = [];
                if (task_progress.deadline) {
                    deadline_info.push({
                        percent: scale(task_progress.toJSON().deadline),
                        label: '预期完成于 ' + task_progress.deadline,
                        type: 'deadline'
                    });
                }
                for (var k in task_progress.deadline_change) {
                    if (task_progress.deadline_change.hasOwnProperty(k) && task_progress.deadline_change[k]) {
                        deadline_info.push({
                            percent: scale(task_progress.deadline_change[k]),
                            label: '曾经希望完成于 ' + models.formatDate(task_progress.deadline_change[k]),
                            type: 'prev_deadline'
                        });
                    }
                }

                console.log(times);

            });

            main_vm.task.histories = main_vm.task.histories.sort(function(a, b) {
                return a.create_at - b.create_at;
            });

        });
    });

});