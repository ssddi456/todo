var path    = require('path');
var debug_name = path.basename(__filename,'.js');
if( debug_name == 'index'){
  debug_name = path.basename(__dirname);
}
(require.main === module) && (function(){
    process.env.DEBUG = '*';
})()
var debug = require('debug')(debug_name);


var express = require('express');
var router = module.exports = express.Router();

var storage = require('../libs/storage');

var task_store = storage('tasks', 'tasks');
var task_progress_store = storage('tasks', 'task_progress');
var mongodb = require('mongodb');

var wrap_task = function( doc ) {

  var ret = {
    id : doc._id,
    name : doc.name,
    backgound : doc.backgound,
    status : doc.status,
    create_at : doc.finished_at,
    finished_at : doc.finished_at,
  };

  return ret;
};

var unwrap_task = function( doc ) {

  var query = {
    _id : mongodb.objectId(doc.id),
  };

  var ret = {
    name : doc.name,
    backgound : doc.backgound,
    status : doc.status,
    create_at : doc.finished_at,
    finished_at : doc.finished_at,
  };

  return {
    query : query,
    doc   : ret
  };
};


var wrap_task_progress = function( doc ) {

  var ret = {
    id : doc._id,
    parent_id : doc.parent_id,
    content : doc.content,
    status : doc.status,
    create_at : doc.finished_at,
    finished_at : doc.finished_at,
  };

  return ret;
};


var unwrap_task_progress = function( doc ) {
  var query = {
    _id : mongodb.objectId(doc.id),
  };

  var ret = {
    parent_id : doc.parent_id,
    content : doc.content,
    status : doc.status,
    create_at : doc.finished_at,
    finished_at : doc.finished_at,
  };

  return { 
    query : query,
    doc : ret
  };
};


router.post( '/task_progress/save', function( req, resp, next ) {
  var query = req.query;
  var body = req.body;
  
  var task_progress = unwrap_task_progress(body);

  if( body.id ){

    task_progress_store.insert(
      task_progress.doc,
      function(err, ops ) {

        if( !err ){
          resp.json({
            err : 0,
            data : ops.ops[0]
          });
        } else {
          next(err);
        }

      });

  } else {

    task_progress_store.update(
      task_progress.query, 
      { $set : task_progress.doc }, 
      function(err) {

        if( !err ){
          resp.json({ err : 0 });
        } else {
          next(err);
        }

      });

  }

});

router.get('/', function( req, resp, next ) {
  resp.render('index', {});
});

router.get('/tasks/list', function( req, resp, next ) {

  var query = req.query;
  var filter = {};
  if( query.status ){
    filter.status = query.status;
  } else {
    filter.status =  'open';
  }

  task_store.find(filter, { _id : 1 }, function( err, tasks ) {

    if( !err ) {
      resp.json({ 
        err : 0,
        tasks : tasks.map(wrap_task)
      });
    } else {
      next(err);
    }

  });

});


router.get( '/tasks/load', function( req, resp, next ) {
  var query = req.query;
  var body = req.body;
  var task_id = query.task_id;

  task_store.findOne({

      _id : mongodb.objectId(task_id) 

    }, 
    function( err, doc ) {
      
      if( doc ) {
        resp.json({ err : 0, data: wrap_task(doc)  });
      } else if( !doc ){
        next(new Error('tasks not found'));
      } else {
        next();
      }

    });

});

router.post( '/tasks/create', function( req, resp, next ) {
  var query = req.query;
  var body = req.body;

  var task = unwrap_task(body);
  
  task.doc.create_at = Date.now();

  task_store.insert( task.doc, function( err, doc ) {
    if( !err )    {
      resp.json({
        err : 0,
        data : ops.ops[0]
      });
    } else {
      next(err);
    }
  });

});

router.post( '/tasks/save', function( req, resp, next ) {
  var query = req.query;
  var body = req.body;
    
  var task = unwrap_task(body);

  if( !body.id ){
    next(new Error('illegal task'));
    return;
  }
  task_store.update(task.query, { $set : task.doc },function( err, doc ) {
    if( !err )    {
      resp.json({
        err : 0
      });
    } else {
      next(err);
    }
  });
});

router.post( '/tasks/load_history', function( req, resp, next ) {
  var query = req.query;
  var body = req.body;
  var task_id = query.task_id;

  task_progress_store.find({ parent_id : task_id }, function( err, doc ) {
    if( !err ){
      resp.json({
        err : 0,
        data : doc
      });
    } else {
      next(err);
    }
  });

});
