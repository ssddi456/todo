process.env.DEBUG = 'app';
var express = require('express');

var fs = require('fs');
var path = require('path');
var less = require('less');
var async = require('async');

var app = express();
var debug = require('debug')('app');

app.set('views',path.join(__dirname,'./views') );
app.set('view engine', 'jade');

app.use('/source',          express.static(path.join(__dirname,'./source')));
app.use('/bower_components',express.static(path.join(__dirname,'./bower_components')));

app.use(express.bodyParser());
app.use(express.errorHandler());

var less_folder =  path.join(__dirname,'skin');
app.get('/skin/:styles',function(req,resp, next) {
  var less_file = req.params.styles;
  var ext = path.extname(less_file);
  if( ext == '.css'
    || ext == '.less'
  ){
    var file = path.basename(less_file,ext) + '.less';
    async.waterfall([function( done) {
      fs.readFile( path.join( less_folder, file),
        'utf8',done);
    },function( less_code, done ) {
      less.render(less_code,{
        paths : [less_folder],
        filename: file
      },done)
    }],function( err, css) {
      if(err){
        return next(err);
      }
      resp.end(css);
    });
  }
});

app.get('/:template',function( req, resp, next) {
  resp.render( req.params.template );
});

app.listen(1338);
console.log( 'listen on 1338');