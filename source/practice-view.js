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
  '../bower_components/ko_custom_bindings/ko.drag',
  './util', 
  'knockout'
],function(
  kodrag,
  util,
  ko
){

  var practices = util.koModule({
        name : '[',
        v_number : 1
      }).derive(function( ) {
        this.number = ko.computed({
                          read : function() {
                                  return Math.round( this.v_number() * 10 );
                                },
                          write : function( val ) {
                            val = util.clamp(val,0,1000);
                            this.v_number( Math.round(val / 10));
                          },
                          owner : this
                        });
      },{
        update_number : function() {}
      });

  var vm = {
    date_items : ko.observableArray(),
    current_day : {
      practices : [ new practices()]
    }
  }
  var now = Date.now();
  for(var i = 6; i > 0;i--){
    vm.date_items.push({
      day : util.format_datetime(now -  util.n_days(i))
    });
  }
  ko.applyBindings(vm);
});