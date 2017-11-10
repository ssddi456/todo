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

// var pastes_store = storage('tasks', 'events');

router.get('/', function(req, resp, next) {
    resp.render('calender', {});
});