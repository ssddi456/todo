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
      this.ticks = ticks;
    },
    updatetime : function( drag_data ){
      var delta_t;

      var left= this.left();
      var width = this.width();

      var fin = drag_data.start_offset + drag_data.delta;
      var after;
      var before = _.find(this.ticks,function( tick, index, arr ) {
        var next;
        if( tick[0] <= fin ){
          if( next = arr[index+1] ){
            if( next[0] > fin ){
              after = next;
              return true;
            }
            return false;
          } else {
            return true;
          }
        }
      });
      if( !before ){
        before = this.ticks[0];
        after  = this.ticks[1];
      } else if( !after ){
        after = [null,Infinity];
      }

      var choosed =  fin - before[0] < fin - after[0] ? before : after;
      if( fin == left ){
        delta_t = this.start - choosed[1];
        this.start = choosed[1];
        this.end = this.end - delta_t;
      } else {
        this.end  = choosed[1];
      }

    }
  });
});