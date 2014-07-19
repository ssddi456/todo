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
    this.middle    = el.width() / 2;
    this.ticks     = [];
  }

  var fn = dateline.prototype;
  
  fn.normalize_scale = function() {
    this.scale = Math.max(Math.min( 2, this.scale ),0.3);
  };

  fn.change_scale = function( scale, center ) {

    var delta = this.middle - center;
    var temp_scale = this.scale;

    this.scale = scale;
    this.normalize_scale();

    if( this.scale == temp_scale ){
      return;
    }  

    // 
    // t = current - Math.floor((middle_1 - cur_pos) / interval_1 ) * day;
    // t = current - Math.floor((middle_2 - cur_pos) / interval_2 ) * day;
    // =>
    // (middle_1 - cur_pos) * interval_2 = (middle_2 - cur_pos) * interval_1
    // =>
    // (middle_1 - cur_pos) * scale_1 = (middle_2 - cur_pos) * scale_2
    // 
    // (middle- cur_pos + offset_1 ) * scale_1 = 
    // (middle- cur_pos + offset_2 ) * scale_2

    var offset_2 = (delta + this.offset) * temp_scale / this.scale - delta;
    this.offset = offset_2;
  };
  
  fn.update = function() {
    
    var max_tick = this.max_tick * this.scale;
    var total    = this.middle * 2
    var interval = total / max_tick;
    
    var middle = this.middle + this.offset;

    var start_pos = middle % interval;
    if( start_pos < 0 ){
      start_pos = start_pos + interval;
    }
    console.group('info');
    console.log( 'start_pos        :', start_pos);
    console.log( 'interval         :', interval);
    console.log( 'total            :', total);
    console.groupEnd();

    var tick = [];
    var _ticks = this.ticks;
    _ticks.length = 0;

    var left, timestamp;

    var current = this.current.getTime();
    current = current - current % day;
    console.log( (middle - start_pos) / interval );
    // canculate pos by pixal to secs
    var start_time = current - Math.round((middle - start_pos) / interval) * day;
    
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