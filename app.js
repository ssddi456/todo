var path    = require('path');
var debug_name = path.basename(__filename,'.js');
if( debug_name == 'index'){
  debug_name = path.basename(__dirname);
}
(require.main === module) && (function(){
    process.env.DEBUG = '-storage,-send,-express:*,*';
})()
var debug = require('debug')(debug_name);

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var express = require('express');

var fs = require('fs');
var path = require('path');
var less = require('less');
var async = require('async');

var app = express();

app.set('views',path.join(__dirname,'./views') );
app.set('view engine', 'jade');

app.use('/source',express.static(path.join(__dirname,'./source')));
app.use('/public',express.static(path.join(__dirname,'./public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

      var css = less.render(less_code,{
        paths : [less_folder],
        filename: file
      },done);

    }],function( err, css) {
      if(err){
        return next(err);
      }

      resp.end(css.css);
    });
  } else {
    debug('less_file', less_file);
    next(new Error('unknown ext : ' + ext));
  }
});

var routes = require('./routes');
app.use(routes);

app.get('/:template',function( req, resp, next) {
  resp.render( req.params.template );
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    var data = {
      message: err.message,
      error: err,
      err : 1,
      msg : err.message
    };
    if( req.xhr ){
      res.json(data)
    } else {
      res.render('error', data);
    }
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  var data = {
      message: err.message,
      error: {},
      err : 1,
      msg : err.message
    };
    if( req.xhr ){
      res.json(data)
    } else {
      res.render('error', data);
    }
});



app.listen(1338);
console.log( 'listen on 1338');