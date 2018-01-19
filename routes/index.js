var path = require('path');
var debug_name = path.basename(__filename, '.js');
if (debug_name == 'index') {
    debug_name = path.basename(__dirname);
}
(require.main === module) && (function() {
    process.env.DEBUG = '*';
})()
var debug = require('debug')(debug_name);


var express = require('express');
var router = module.exports = express.Router();

var storage = require('../libs/storage');

var task_store = storage('tasks', 'tasks');
var task_progress_store = storage('tasks', 'task_progress');
var mongodb = require('mongodb');
var model = require('../libs/model');

var task_model = model({
    name: '',
    background: '',
    status: 'open',

    emergency: {
        initial: 0,
        type: Number
    },

    important: {
        initial: 0,
        type: Number
    },

    create_at: {
        readonly: true,
        initial: 0
    },

    lastest_update: {
        readonly: true,
        initial: 0
    },

    finished_at: {
        readonly: true,
        initial: 0
    },
    status_change: {
        readonly: true,
        initial: {}
    },
});
var wrap_task = task_model.wrap;
var unwrap_task = task_model.unwrap;

var task_progress_model = model({
    parent_id: '',
    content: '',
    status: '',

    emergency: {
        initial: 0,
        type: Number
    },

    important: {
        initial: 0,
        type: Number
    },

    create_at: {
        readonly: true,
        initial: 0,
    },

    lastest_update: {
        readonly: true,
        initial: 0
    },

    finished_at: {
        readonly: true,
        initial: 0,
    },

    status_change: {
        readonly: true,
        initial: {}
    },


    deadline_change: {
        readonly: true,
        initial: {}
    },

    deadline: {
        initial: Infinity,
        type: Number
    }

});

var wrap_task_progress = task_progress_model.wrap;
var unwrap_task_progress = task_progress_model.unwrap;


router.post('/task_progress/save', function(req, resp, next) {
    /**
     * 创建或者更新task_progress
     * 没有id的参数时表示创建
     */

    var query = req.query;
    var body = req.body;

    if (!body.parent_id) {
        throw new Error('illegal create/update task_progress request');
    }

    if (!body.deadline) {
        throw new Error('illegal create/update task_progress request');
    }

    var task_progress = unwrap_task_progress(body);

    if (!body.id) {

        debug('do save task_progress, insert');
        task_progress.doc.create_at = Date.now();


        task_progress_store.insert(
            task_progress.doc,
            function(err, ops) {

                if (!err) {
                    resp.json({
                        err: 0,
                        data: wrap_task_progress(ops.ops[0])
                    });
                } else {
                    next(err);
                }

            });

    } else {
        debug('do save task_progress, update');

        task_progress_store.findOne(
            task_progress.query,
            function(err, doc) {

                if (err) {
                    resp.json({
                        err: 0
                    });
                } else if (!doc) {
                    next(new Error('recode not found'));
                } else {
                    // 状态变化
                    var old_status = doc.status;
                    var new_status = task_progress.doc.status;

                    if (old_status != new_status) {
                        task_progress.doc['status_change.' + Date.now()] = new_status;
                    } else {
                        task_progress.doc['status_change.' + Date.now()] = 'edit';
                    }

                    // 结束点变化
                    var old_deadline = doc.deadline;
                    var new_deadline = task_progress.doc.deadline;
                    if (new_deadline && old_deadline != new_deadline) {
                        task_progress.doc['deadline_change.' + Date.now()] = old_deadline;
                    }

                    task_progress.doc.lastest_update = Date.now();

                    task_progress_store.update(
                        task_progress.query, {
                            $set: task_progress.doc
                        },
                        function(err) {
                            if (err) {
                                next(err);
                            } else {
                                resp.json({
                                    err: 0
                                });
                            }
                        });
                }
            });
    }

});

router.get('/', function(req, resp, next) {
    resp.render('index', {});
});

router.get('/task/:task_id', function(req, resp, next) {
    var query = req.query;
    var params = req.params;

    task_store.findOne({
        _id: mongodb.ObjectId(params.task_id)
    }, function(err, task) {
        if (err) {
            next(err);
        } else {
            if (task) {
                resp.render('project', {
                    main_task: {
                        id: params.task_id
                    }
                });
            } else {
                next();
            }
        }
    });
});


router.get('/tasks/list', function(req, resp, next) {

    var query = req.query;
    var filter = {};

    if (query.status) {
        filter.status = query.status;
    } else {}

    task_store.find(filter, {
            _id: 1
        })
        .sort({
            create_at: -1
        })
        .exec(function(err, tasks) {

            if (!err) {
                resp.json({
                    err: 0,
                    tasks: tasks.map(wrap_task)
                });
            } else {
                next(err);
            }

        });

});


router.get('/tasks/load', function(req, resp, next) {
    var query = req.query;
    var body = req.body;
    var task_id = query.task_id;

    task_store.findOne({

            _id: mongodb.ObjectId(task_id)

        },
        function(err, doc) {

            if (doc) {
                resp.json({
                    err: 0,
                    data: wrap_task(doc)
                });
            } else if (!doc) {
                next(new Error('tasks not found'));
            } else {
                next();
            }

        });

});

router.post('/tasks/create', function(req, resp, next) {
    var query = req.query;
    var body = req.body;

    var task = unwrap_task(body);

    task.doc.create_at = Date.now();

    task_store.insert(task.doc, function(err, ops) {
        if (!err) {
            resp.json({
                err: 0,
                data: wrap_task(ops.ops[0])
            });
        } else {
            next(err);
        }
    });

});

router.post('/tasks/save', function(req, resp, next) {
    var query = req.query;
    var body = req.body;


    if (!body.id) {
        next(new Error('illegal task'));
        return;
    }

    var task = unwrap_task(body);

    task_store.findOne(
        task.query,
        function(err, doc) {

            if (err) {
                resp.json({
                    err: 0
                });
            } else if (!doc) {
                next(new Error('recode not found'));
            } else {

                var old_status = doc.status;
                var new_status = task.doc.status;

                if (old_status != new_status) {
                    task.doc['status_change.' + Date.now()] = new_status;
                } else {
                    task.doc['status_change.' + Date.now()] = 'edit';
                }

                task.doc.lastest_update = Date.now();

                task_store.update(
                    task.query, {
                        $set: task.doc
                    },
                    function(err) {
                        if (err) {
                            next(err);
                        } else {
                            resp.json({
                                err: 0
                            });
                        }
                    });
            }

        });

});

router.get('/tasks/load_history', function(req, resp, next) {
    var query = req.query;
    var body = req.body;
    var task_id = query.task_id;

    task_progress_store.find({
        parent_id: task_id
    }, function(err, doc) {
        if (!err) {
            resp.json({
                err: 0,
                data: doc.map(wrap_task_progress)
            });
        } else {
            next(err);
        }
    });

});



var day = 24 * 60 * 60 * 1000;
router.get('/change_of_week', function(req, resp, next) {
    var today = new Date();
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var weekday = today.getDay();
    var startOfWeek = new Date(today.getTime() - weekday * day + 1).getTime();
    var endOfWeek = new Date(today.getTime() + (7 - weekday) * day - 1).getTime();

    task_progress_store.find({
        $or: [{
            create_at: {
                $gte: startOfWeek,
                $lte: endOfWeek
            }
        }, {
            lastest_update: {
                $gte: startOfWeek,
                $lte: endOfWeek
            }
        }, {
            deadline: {
                $gte: startOfWeek,
                $lte: endOfWeek
            }
        }, ]
    }, function(err, doc) {
        if (!err) {
            resp.json({
                err: 0,
                data: doc.map(wrap_task_progress)
            });
        } else {
            next(err);
        }
    });
});