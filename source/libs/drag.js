define([

],function(

){

  function drag ( el, before_drag, dragging, after_drag ) {
    el.on('mousedown',function(e) {
      var drag_data = {
        start_pos_x : e.screenX
      };

      function moving( e ) {
        drag_data.delta = e.screenX - drag_data.start_pos_x;
        typeof after_drag == 'function' && dragging.call(el[0], drag_data, e);
      }

      document.body.addEventListener('mousemove',moving,true);

      document.body.addEventListener('mouseup',function() {

        document.body.removeEventListener('mousemove',moving,true);
        document.body.removeEventListener('mouseup',arguments.callee,true);

        typeof after_drag == 'function' && after_drag.call( el[0], drag_data );
      },true);

      typeof before_drag == 'function' && before_drag.call( el[0], drag_data );
    });

    el.on('click',function() {
      console.log( el );    
    });

  }

  return drag;

});