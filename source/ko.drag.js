define([
  'jquery',
  './libs/drag',
  'knockout'
],function(
  $,
  drag,
  ko
){
  ko.bindingHandlers.drag = {
    'init' : function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var settings = valueAccessor();
      

      drag($(element),
        function( drag_data ) {
          drag_data.start_offset = settings.val();
        },
        function( drag_data ) {
          settings.val( drag_data.start_offset + drag_data.delta );
        },
        function( drag_data ) {
          settings.dragend.call(viewModel, drag_data);
        });
    }
  }
});