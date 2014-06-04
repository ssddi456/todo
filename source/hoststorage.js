 window.onmessage = function( e ) {
  var ac = e.data;
  var echo = { key : ac.key };
  switch( ac.type ){
    case 'setItem':
      localStorage.setItem(ac.name, ac.data);
      echo.data = 'done';
      break
    case 'getItem':
      echo.data = localStorage.getItem(ac.name);
      break;
    case 'pushItem' : 
      // atom operation
      var lastitem = localStorage.getItem(ac.name +'::length');
      localStorage.setItem ( ac.name +'::' + ( lastitem ++ ), ac.data );
      localStorage.setItem ( ac.name +'::length', lastitem ++ );
      echo.data = lastitem;
      break
  }

  e.source.postMessage( echo, '*');
}