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

var model = require('../libs/model');
var storage = require('../libs/storage');

var calender_store = storage('tasks', 'calender');



var calender_model = model({
  name: '',
  background: '',
  schedular: {
    initial: '',
    type: String,
  },

  create_at: {
    readonly: true,
    initial: Infinity,
  },

  visible: {
    viewonly: true,
    type: Boolean,
    initial: true
  },

  reward_name: '',

  reward_number: {
    type: Number,
    initial: 1
  },
});

var wrap_calender = calender_model.wrap;
var unwrap_calender = calender_model.unwrap;


router.get('/', function(req, resp, next) {
  resp.render('calender', {});
});

router.post('/save', function(req, resp, next) {
  var body = req.body;
  var calender = calender_model.unwrap(body);
  if (!body.id) {
    calender.doc.create_at = Date.now();
    calender_store.insert(
      calender.doc,
      function(err, ops) {
        if (err) {
          next(err);
        } else {
          resp.json({
            err: 0,
            data: calender_model.wrap(ops.ops[0])
          });
        }
      })
  } else {
    calender_store.findOne(
      calender.query,
      function(err, doc) {
        if (err) {
          next(err);
        } else if (!doc) {
          next(new Error('calender event not found'));
        } else {

          calender_store.update(
            calender.query, {
              $set: calender.doc
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

router.get('/list', function(req, resp, next) {
  calender_store.find({})
    .exec(function(err, docs) {
      if (err) {
        next(err);
      } else {
        resp.json({
          err: 0,
          events: docs.map(calender_model.wrap)
        });
      }
    });
});