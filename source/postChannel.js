define([

],function(

){
  
  var messagequeue = [];
  function postChannel ( data ,callback ){
    data.key = messagequeue.length;
    window.parent.postMessage( data, '*');
    messagequeue.push(callback);
  }
  function receiveMessage( e ){
    messagequeue[e.data.key] && 
      messagequeue[e.data.key]( null, e.data.data );
    messagequeue[e.data.key] = undefined;
  }
  window.onmessage =  receiveMessage;

  return postChannel;
});