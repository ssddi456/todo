define([
  './storage'
],function(
  storage
){
  var ret = new storage();
  ret.store_path = 'project_process';
  ret.load();
  return ret;
});