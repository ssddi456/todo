define([
  'underscore',
  './util',
  'ko'
],function(
  __,
  util,
  ko
){
  
  return util.koModule({
    start : 0,
    end   : 0,
    name  : '',
    left  : 0,
    width : 0
  },['start','end'],{
    update : function( ticks ) {
      var self = this;
      var left, width;
      var start, end; 

      var start_datetime =util.format_datetime(self.start);
      var end_datetime = util.format_datetime(self.end);

      // find the tick
      ticks.forEach(function(tick) {
        var datetime =  util.format_datetime(tick[1]);
        if( datetime == start_datetime ){
          start = tick;
        }
        if( datetime == end_datetime ){
          end = tick
        }
      });

      if( start ){
        left = start[0];
      } else {
        left = 0;
      }

      if( end ){
        width =  end[0] - left;
      } else {
        width = '100%'
      }
      // if not fount, check if out of range
      if( !start && !end ){
        if( this.end < _.last(ticks)[1] || this.start > _.first(ticks)[1] ){
          width = 0;
        }
      }
      // update view
      this.left( left );
      this.width( width );
    }
  });
});