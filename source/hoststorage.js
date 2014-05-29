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
  }

  e.source.postMessage( echo, '*');
}