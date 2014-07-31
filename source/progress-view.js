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
  './project_storage',
  '../bower_components/ko_custom_bindings/ko.editable_text',
  '../bower_components/ko_custom_bindings/ko.drag',
  './util',
  './dateline-ui',
  './timeline',
  'knockout',
  'jquery'
],function(
  project_storage,
  koeditable_text,
  kodrag,
  util,
  dateline,
  timeline,
  ko,
  $
){
  
  var now = Date.now();
  timeline = timeline.derive(function(){
              var self = this;
              if( this.idx == -1 ){
                this.idx =  project_storage.push('projects', { 
                              name : this.name(),
                              start : this.start,
                              end  : this.end
                            }) - 1;
              }
              this.name.subscribe(function( name ) {
                project_storage.set('projects.' + this.idx + '.name', name );
              });
            });
  var timeline_prototype_updatetime = timeline.prototype.updatetime;
  timeline.prototype.updatetime = function(){
    timeline_prototype_updatetime.apply(this, arguments);      
    project_storage.set('projects.' + this.idx + '.start', this.start);
    project_storage.set('projects.' + this.idx + '.end',   this.end);
  };

  var dateline = dateline.create( $('.timeline-head'), new Date() );

  dateline.scale     = project_storage.get('ui.scale')    || dateline.scale;
  dateline.offset    = project_storage.get('ui.offset')   || dateline.offset;
  dateline.max_tick  = project_storage.get('ui.max_tick') || dateline.max_tick;


  var dateline_update = dateline.update;
  dateline.update = function(){
    dateline_update.apply(this, arguments);
    project_storage.set('ui.scale', this.scale);
    project_storage.set('ui.offset', this.offset);
  };
  dateline.update();

  var vm =  { 
              projects : ko.observableArray(),
              new_project : {
                name  : ko.observable(''),
                start : now,
                end   : now + util.n_days(1)
              },
              create_new : function() {
                var new_project = ko.toJS( this.new_project );
                if( new_project.name == '' ){
                  return;
                }

                var _timeline =  new timeline( new_project );
                _timeline.update(dateline.ticks);
                
                this.projects.push( _timeline );

                this.new_project.name('');
              }
            };
  var projects = project_storage.get('projects') || [];

  projects = projects.map(function( project, idx ) {
              project.idx = idx;
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