function getArray( name ) {
  var length = localStorage.getItem( name +'::length');
  var ret = [];
  for(var i = 0; i < length; i++){
    ret.push( localStorage.getItem ( name +'::' + i ));
  }
  return JSON.stringify( ret );
}
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
      break;
    case 'getArray' : 
      echo.data = getArray( ac.name );
      break;
  }

  e.source.postMessage( echo, '*');
}