define([
  './util',
  'jquery'
],function(
  util,
  $
){

  var day = 1e3 * 60 * 60 * 24;

  //roadmap
  //  label and ticks
  //  move 

  function dateline( el, current ){
    this.current   = current;// date

    this.scale     = 1;
    this.offset    = 0;

    this.max_tick  = 7;
    
    this.container = el;
    this.ticks     = [];
  }

  var fn = dateline.prototype;

  fn.update = function() {
    
    this.scale = Math.max(Math.min( 2, this.scale ),0.3);
    var max_tick = this.max_tick * this.scale;

    var total_width = this.container.width();

    var middle = total_width / 2;
    var interval = total_width / max_tick;

    var middle = middle + this.offset;
    var range = [0, total_width];

    var start_pos = ( interval / 2 + this.offset ) % interval;

    if(start_pos < 0){
      start_pos = start_pos + interval;
    }

    var tick = [];
    var _ticks = this.ticks;
    _ticks.length = 0;

    var left, timestamp;

    var current = this.current.getTime();
    current = current - current % day;

    // canculate pos by pixal to secs
    var start_time = current - Math.floor((middle - start_pos) / interval) * day;
    
    for( var i = 0; i < max_tick+1 ; i++ ){
      left = start_pos + i * interval;
      timestamp = start_time + i * day;

      tick.push('<div class="tick" style="left:' + left + 'px;"></div>');
      tick.push('<div class="date" style="left:'+ (left - 70) +'px;">' + 
                  util.format_datetime ( timestamp, 'MM 月 dd 日' ) +
                '</div>');

      _ticks.push([left,timestamp]);
    }

    this.container
      .html( tick.join('') )
      .trigger('dateline-change', [this.ticks]);
  };
  fn.reset = function() {
    this.offset = 0;
    this.scale  = 1;
    this.update();
  }
  dateline.create = function( el, current ) {
    var ret = new dateline( el, current );
    ret.update();
    return ret;
  };

  return dateline

});