define([
  'jquery',
  'knockout'
],function(
  $,
  ko
){
  ko.bindingHandlers.editable_text = {
    'init' : function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var accessor = valueAccessor();
      var val = accessor();

      element.innerHTML = '<span>' + val + '</span>' + '<input style="display:none;" type="text" value="' + val + '"/>';

      $(element)
        .on('dblclick','span',function() {
          $(this).hide().parent().find('input').show().focus();
        })
        .on('blur','input',function() {
          accessor( this.value );
          $(this).hide().parent().find('span').show();
        });
    },
    'update':function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var val = ko.utils.unwrapObservable(valueAccessor());
      $(element)
        .find('span').text(val).end()
        .find('input').val(val);
    }
  };
});