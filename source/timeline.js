define([
  './project_storage',
  'underscore',
  './util',
  'ko'
],function(
  project_storage,
  __,
  util,
  ko
){
  
  return util.koModule({
    idx   : -1,
    start : 0,
    end   : 0,
    name  : '',
    left  : 0,
    width : 0
  },['start','end', 'idx'],{
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
        width = ticks.total - left;
      }
      // if not fount, check if out of range
      if( !start && !end ){
        if( this.end < _.last(ticks)[1] || this.start > _.first(ticks)[1] ){
          width = 0;
        }
      }
      // update view
      
      this.left( left = util.clamp(left, 0, ticks.total) );
      this.width( util.clamp(width, 0, ticks.total - left) );
      this.ticks = ticks;
    },
    updatetime : function( drag_data ){
      var delta_t;

      var left= this.left();
      var width = this.width();

      var fin = drag_data.start_offset + drag_data.delta;

      if( fin == left ){

      } else {
        fin += left;
      }

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
        after = [Infinity,null];
      }

      var choosed =  fin - before[0] < after[0] - fin ? before : after;
      console.group();
      console.log( util.format_datetime(before[1],'MM dd'), fin - before[0]);
      console.log( util.format_datetime(after[1], 'MM dd'), after[0] - fin);
      console.log( choosed == before ? 'before' : 'after');

      if( fin == left ){
        delta_t = this.start - choosed[1];
        this.start = choosed[1];
        this.end = this.end - delta_t;
        this.left( left = util.clamp(choosed[0], 0, this.ticks.total));
      } else {
        if( choosed[1] <= this.start ){
          this.end = this.start + util.n_days(1);
        } else {
          this.end = choosed[1];
        }
      }

      console.log('segs', Math.round((this.end - this.start) / util.n_days(1)));

      width = Math.round((this.end - this.start) / util.n_days(1)) * this.ticks.interval;
      console.log('final width', util.clamp(width, 0, this.ticks.total - left) );
      console.groupEnd();
      
      this.width( util.clamp(width, 0, this.ticks.total - left));

    }
  })
});