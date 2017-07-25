require([
  './misc',
  './modals'
],function(
  misc,
  modals
){
  
  var paste_add = modals.modal('#paste_add');

  var nav_vm = new Vue({
    el : '#nav',
    methods : {  
      add_paste: function() {
          
        var callback = function( err, data ) {
          $.post('/pastes/add', data, function( json ) {
              if( !json.err ){
                main_vm.pastes.unshift(data);
                misc.toast('添加成功');
              }
          });
        };

        paste_add({ data : {content:''} }, callback );
      }
    }
  });

  var main_vm = new Vue({
    el: '#main',
    data: {
      pastes: [],
      current_paste: undefined
    },
    methods: {
      copy_paste: function(vm) {
          this.current_paste = vm;
          console.log(arguments);
          document.execCommand('copy');
          misc.toast('复制成功');
          this.current_paste = undefined;
      }
    }
  });
  window.addEventListener('copy', function(e) {
      if (main_vm.current_paste) {
        e.clipboardData.setData('text/plain', main_vm.current_paste.content);
        e.preventDefault()
      }
  })

  $.getJSON('/pastes/list', function( json ) {
      if (!json.err) {
          for (var i=0; i < json.pastes.length; i++) {
              main_vm.pastes.push(json.pastes[i]);
          }
      }
  });

});