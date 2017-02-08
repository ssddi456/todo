define([

],function(

){
  
  var ret = {};
  var $toast = $('#toast');

  var toast_fadeout_timer;

  ret.toast = function( msg, failed ) {
    
    // 弄一个toast
    $toast.text(msg);

    if( failed ){
      $toast.removeClass('alert-success').addClass('alert-danger');
    } else {
      $toast.removeClass('alert-danger').addClass('alert-success');
    }

    $toast.stop().fadeIn(100);
    if( $toast.css('display') != 'none'){
      clearTimeout(toast_fadeout_timer);
    }
    toast_fadeout_timer = setTimeout(function () {
      console.log( 'fadeOut!!!!');
      $toast.fadeOut(100);
    }, 2e3);

  };

  return ret;
});