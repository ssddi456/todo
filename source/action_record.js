define([
  './postChannel'
],function(
  postChannel
){

  function action_record ( modify_record, action ){
    var record = (modify_record.parent() || 'root')  + ' :: ' + modify_record.id() + ' < ' + modify_record.content() + ' > @' + action + ':' + new Date().getTime();
    console.log( record );
    postChannel({
      type : 'pushItem',
      name : 'action_record',
      data : record
    },function(err , data ) {
      console.log( data );
    });
  };

  function history_parser ( record ) {
    var ret = { origin : record };
    
    var next_pointer = record.indexOf( ' :: ' );
    ret.parent_id = record.slice(0, next_pointer);
    record = record.slice( next_pointer + 4 );
    
    next_pointer = record.indexOf(' < ');

    ret.id = record.slice( 0, next_pointer );
    record = record.slice( next_pointer+3 );

    var rlast = /\s>\s@([^:]+):?(\d*)$/;
    ret.content = record.replace(rlast,function( $, $1, $2 ) {
      ret.type = $1;
      ret.timestamp = $2;
      return '';
    });
    return ret;
  }

  function get_all_history ( done ) {
    postChannel({
      type : 'getArray',
      name : 'action_record'
    },function( err, data ) {

      var records = JSON.parse( data );

      done( err, err || records.map(history_parser) );

    });
  }

  return action_record;

});