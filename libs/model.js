var mongodb = require('mongodb');
var model = module.exports =  function( def ) {

    var update_keys = [];
    var all_keys = [];
    var defaults = {};
    var type = {};

    for(var k in def){
      if( k!= 'id' && k!= '_id' && def.hasOwnProperty(k)){

        all_keys.push(k);

        if( typeof def[k] != 'object' ){
          defaults[k] = def[k];
          update_keys.push(k);
        } else {

          if( 'initial' in def[k] ){
            defaults[k] = def[k].initial;
            if( def[k].type ){
              if( typeof def[k].type != 'function' ){
                throw new Error('illegal type decleration');
              }
              type[k] = def[k].type;
            }

            if( def[k].readonly ){
              // 不接受客户端上传的改动
            } else {
              update_keys.push(k);
            }
          } else {
            defaults[k] = def[k];
            update_keys.push(k);
          }
        }
      }
    }
    var ret = {};

    /**
     * 创建一个数据副本
     */
    ret.create = function() {
      var ret = {};
      var i =0;
      var len = all_keys.length;
      var k;
      for(;i< len;i++){
        k = all_keys[i];
        ret[ k ] = defaults[ k ];
      }
      return ret;
    };

    /**
     * 将数据输出给客户端
     */
    ret.wrap = function( data ) {
      var ret = {};

      if( data._id ){
        ret.id = data._id;
      }

      var i =0;
      var len = all_keys.length;
      var k;
      for(;i< len;i++){
        k = all_keys[i];
        ret[ k ] = data[ k ];
      }

      return ret;
    };

    /**
     * 读取客户端的可更新数据
     */
    ret.unwrap = function( data ) {
      var ret = {};
      ret.query = {
        _id : mongodb.ObjectId(data.id)
      };
      var doc = ret.doc = {};

      var i =0;
      var len = update_keys.length;
      var k;

      for(;i< len;i++){
        k = update_keys[i];
        if( type[k] ){
          doc[ k ] = type[k]( data[ k ] );
        } else {
          doc[ k ] = data[ k ];
        }
      }

      return ret;
    };

    return ret;
}

;(require.main === module) && (function(){
  var task_model = model({
    name : '',
    background : '',
    status : '',
    create_at : {
      readonly : true,
      initial : 0
    },
    finished_at : {
      readonly : true,
      initial : 0
    },
    status_change : {
      readonly : true,
      initial : {}
    },
  });

  console.log( task_model.wrap(

        {
            "_id": "589aade02e7feb30221a3c27",
            "name": "分散认证，安全升级",
            "background": "防重放&封堵漏洞\n\nwpad 会导致url参数泄露\n重放可导致登录token泄露",
            "status": "open",
            "create_at": null,
            "finished_at": null
        }
    ));

  console.log( task_model.unwrap(

        {
            "id": "589aade02e7feb30221a3c27",
            "name": "分散认证，安全升级",
            "background": "防重放&封堵漏洞\n\nwpad 会导致url参数泄露\n重放可导致登录token泄露",
            "status": "open",
            "create_at": null,
            "finished_at": null
        }
    ));


})();