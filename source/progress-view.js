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
  './ko.drag',
  './ko.editable_text',
  './util',
  './dateline-ui',
  './timeline',
  'knockout',
  'jquery'
],function(
  kodrag,
  koeditable_text,
  util,
  dateline,
  timeline,
  ko,
  $
){
  
  var now = Date.now();

  
  var dateline = dateline.create( $('.timeline-head'), new Date() );
  
  var vm =  { 
              projects : ko.observableArray(),
              new_project : {
                name  : ko.observable(''),
                start : now,
                end   : now + util.n_days(1)
              },
              create_new : function() {
                console.log(  ko.toJS( this.new_project ) );
                var _timeline =  new timeline( ko.toJS( this.new_project ) );
                _timeline.update(dateline.ticks);
                console.log( ko.toJS(_timeline) );
                
                this.projects.push( _timeline );

                this.new_project.name('');
              }
            };
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
    vm.projects().forEach(function( _timeline ) {
      _timeline.update(data);
    });
  });

  ko.applyBindings(vm);

});