define([
  '../bower_components/ko_custom_bindings/libs/drag',
  './dateline'
],function(
  drag,
  dateline
){
  function dateline_ui () {
    
  }

  dateline_ui.create = function( el, current ) {
    var _dateline = dateline.create(el, current);

    drag(el,
      function( drag_data ) {
        this.style.cursor = 'e-resize';
        drag_data.start_offset = _dateline.offset;
      },
      function( drag_data, e) {
        _dateline.offset = drag_data.start_offset + drag_data.delta;
        _dateline.update();
      },
      function( drag_data ) {
        this.style.cursor = 'auto';
      });

    el.on('dblclick',function(e) {
      _dateline.reset();
    });

    el.on('mousewheel',function( e ) {
      e.stopPropagation();
      e.preventDefault();
      
      var scale_center  = e.offsetX;

      _dateline.change_scale( _dateline.scale + e.originalEvent.deltaY / 1000, scale_center )

      _dateline.update();

    });

    return _dateline;
  };

  return dateline_ui
});