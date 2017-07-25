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

var pastes_store = storage('pastes', 'pastes');

router.get('/', function(req, resp, next) {
    resp.render('pastes', {});
});

router.get('/list', function(req, resp, next) {
    pastes_store.find({}, function(err, docs) {
        if(err){
            return next(err);
        }
        resp.json({ err: 0, pastes: docs});
    });

});

router.post('/add', function(req, resp, next) {
    var content = req.body.content;
    if (!content || !content.trim()) {
        return next(new Error('illegal input'));
    }

    content = content.trim();
    pastes_store.insert({ content: content }, function(err) {
        if (err){
            return next(err);
        }
        resp.json({ err: 0 });
    })
});