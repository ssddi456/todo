define([
  './postChannel'
],function(
  postChannel
){

  function action_record ( modify_record, action ){
    var record = (modify_record.parent() || 'root')  + ' :: ' + modify_record.id() + ' < ' + modify_record.content() + ' > @' + action;
    console.log( record );
    postChannel({
      type : 'pushItem',
      name : 'action_record',
      data : record
    },function(err , data ) {
      console.log( data );
    });
  };

  return action_record;

});