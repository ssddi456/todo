var Service = require('node-windows').Service;
var path = require('path');

// Create a new service object
var svc = new Service({
  name:'Todo Manager',
  description: 'myself`s todo mgr service',
  script: path.join(__dirname,'../app.js')
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  console.log('install');
  console.log( arguments );
  svc.start();
});

svc.on('uninstall',function(){
  console.log('uninstall');
  console.log( arguments );
  svc.start();
});

svc.on('alreadyinstalled',function() {
  console.log( 'alreadyinstalled');
  console.log( arguments );
  console.log( svc.id );
  svc.start();
});

svc.on('invalidinstallation',function() {
  console.log( 'invalidinstallation');
  console.log( arguments );  
});

svc.on('error',function() {
  console.log( 'error');
  console.log( arguments );  
});

svc.on('stop',function() {
  console.log( 'stop');
  console.log( arguments );  
});

svc.on('start',function() {
  console.log( 'start');
  console.log( arguments );  
});


svc.install();


// svc.uninstall();
