var jade = require('jade');
var fs   = require('fs');
var path = require('path');
var less = require('less');
var _    = require('underscore');

var configures = [{
  root     : '../views',
  entrance : 'index.jade',
  output   : '../index.html',
  ext      : '.jade',
  render   : function( file, conf, done ) {
    jade.renderFile( file, done );
  }
},{
  root     : '../skin',
  entrance : 'app.less',
  output   : '../skin/app.css',
  ext      : '.less',
  render   : function( file, conf, done ) {
    fs.readFile(file, 'utf8', function( err, code) {
      if( err ){
        return done(err);
      }
      var parser  = new less.Parser({ 
                      filename : path.basename(file),
                      paths    : [conf.root]
                    });
      parser.parse(code,function(err, tree) {
        done(err, tree && tree.toCSS());
      })
    })
  }
}];

configures.forEach(function( conf ) {
  var renderFunc =  _.debounce(function( e ) {
                      if( e == 'change' ){
                        console.log( arguments );
                        console.time('compile');
            
                        var data = conf.render( conf.root + '/' + conf.entrance, conf,
                            function(err, data) {
                              console.timeEnd('compile');
                              console.log( Date.now(), ' compile finish err : ', err);
                              fs.writeFile( conf.output, data,function( e ) {
                                console.log( Date.now(), ' write finish err : ', err);
                              });
                            });
                      }
                    },100);

  function watch ( root ) {
    fs.readdir(root,function( err, files ) {
      files.forEach(function( source ){
        var extname = path.extname( source ); 
        var filepath= path.join( root, source);
        if( extname == conf.ext ){
          fs.watch ( filepath, renderFunc );
        } else if( extname == '' ){
          fs.stat(filepath, function(err, state ) {
            if( !err && state.isDirectory() ){
              watch(filepath);
            }
          })
        }
      });
    });
  }
  watch( conf.root );

});
