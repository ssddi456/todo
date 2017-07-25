var path    = require('path');
var debug_name = path.basename(__filename,'.js');
if( debug_name == 'index'){
  debug_name = path.basename(__dirname);
}
(require.main === module) && (function(){
    process.env.DEBUG = '-storage,-send,-express:*,*';
    // process.env.DEBUG = '-send,-express:*,*';
    process.env.DEBUG_COLORS = 0;
})()

var debug = require('debug');
var debug_root = path.join(__dirname, './log/');
var util = require('util');

function pad2( num ) {
  num = num + '';
  if( num.length < 2 ){
    return '0' + num;
  }
  return num;
}
debug.log = function() {
  var res = [].map.call(arguments,function( d ) {
    if( typeof d =='string' ){
      return d;
    } else {
      return util.inspect(d);
    }
  }).join(' ') + '\n';
  if( !this._log_file_prefix ){
    var prefix = path.join(debug_root, (this.namespace.replace(':', '_') || 'log'))
    this._log_file_prefix = prefix;
  }
  var now = new Date();
  var hour = now.getFullYear() +  pad2(now.getMonth() + 1) + 
            pad2( now.getDate() ) + "_" + pad2( now.getHours() );

  fs.appendFile( this._log_file_prefix + '.' + hour + '.log', res);
};

debug = debug(debug_name);

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

app.get('/favicon.ico', function( req, resp ) {
    resp.status(404);
    resp.end();
});

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
var pastes = require('./routes/pastes');
app.use(routes);
app.use('/pastes', pastes);

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