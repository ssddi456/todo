define([
    './models/person_model',
    './models/calender_event_model',
    './models/task_progress_model',
    './models/task_model',
    './postChannel'
], function(
    person_model,
    calender_event_model,
    task_progress_model,
    task_model,
    postchannel
) {

    var ret = {};

    function get_tasks_from_remote(status) {
        return function(done) {
            postchannel({
                method: 'GET',
                command: '/tasks/list',
                data: {
                    status: status
                }
            }, function(err, data) {

                if (err) {
                    done(err);
                } else {
                    done(null, data.tasks.map(function(node) {
                        return new task_model(node);
                    }))
                }
            });
        }
    }

    ret.task = task_model;
    ret.task_progress = task_progress_model;
    ret.calender_event = calender_event_model;
    ret.person = person_model;

    ret.get_open_todos = get_tasks_from_remote('open');
    ret.get_hole_toods = get_tasks_from_remote('hole');
    ret.get_finish_toods = get_tasks_from_remote('finished');
    ret.get_all_todos = get_tasks_from_remote('');

    ret.get_events_from_remote = function(done) {
        postchannel({
            method: 'GET',
            command: '/calender/list',
        }, function(err, data) {
            if (err) {
                done(err);
            } else {
                done(null, data.events.map(function(node) {
                    return new calender_event_model(node);
                }))
            }
        });
    }
    return ret;

});