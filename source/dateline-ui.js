define([
  './dateline'
],function(
  dateline
){
  function dateline_ui () {
    
  }

  dateline_ui.create = function( el, current ) {
    var _dateline = dateline.create(el, current);

    var start_offset;
    var change;
    var start_pos_x;

    function mouse_move ( e ) {
      delta = e.screenX - start_pos_x;
      _dateline.offset = start_offset + delta;
      _dateline.update();
    }

    el.on('mousedown',function(e) {
      var self = this;
      
      start_offset = _dateline.offset;
      start_pos_x = e.screenX;

      document.body.addEventListener('mousemove',mouse_move,true);

      document.body.addEventListener('mouseup',function() {
        document.body.removeEventListener('mousemove',mouse_move,true);
        self.style.cursor = 'auto';
      },true);

      this.style.cursor = 'e-resize';
    });

    el.on('dblclick',function(e) {
      _dateline.reset();
    });

    el.on('mousewheel',function( e ) {
      e.stopPropagation();
      e.preventDefault();
      
      var e = e.originalEvent;
      _dateline.scale += e.deltaY / 1000;
      _dateline.update();

    });

    return _dateline;
  };

  return dateline_ui
});