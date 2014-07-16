require.config({
  paths : {
    knockout     : 'http://cdn.staticfile.org/knockout/3.1.0/knockout-debug',
    jquery       : 'http://cdn.staticfile.org/jquery/1.10.0/jquery',
    'underscore' : 'http://cdn.staticfile.org/underscore.js/1.6.0/underscore'
  },
  map :{
    '*' :{
      ko : 'knockout'
    }
  }
})

require([
  './util',
  './dateline-ui',
  './timeline',
  'knockout',
  'jquery'
],function(
  util,
  dateline,
  timeline,
  ko,
  $
){
  

  
  var dateline = dateline.create( $('.timeline-head'), new Date() );
  var vm =  { 
              projects : ko.observableArray(),
            };
  var now = Date.now();
  var projects = [{
      name  : '123',
      start : now - util.n_days(3),
      end   : now + util.n_days(1)
    },{
      name  : '456',
      start : now - util.n_days(3),
      end   : now + util.n_days(2)
    }];

  projects = projects.map(function( project ) {
              var _timeline = new timeline( project );

              _timeline.update( dateline.ticks );

              vm.projects.push( _timeline );
              return _timeline;
            });

  dateline.container.on('dateline-change',function( e, data ) {
    projects.forEach(function( _timeline ) {
      _timeline.update(data);
    });
  });

  ko.applyBindings(vm);

});