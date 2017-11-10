define([

],function(

){


    var model = function(def) {

        var update_keys = [];
        var all_keys = [];
        var defaults = {};
        var type = {};

        for (var k in def) {
            if (k != 'id' && k != '_id' && def.hasOwnProperty(k)) {

                all_keys.push(k);

                if (typeof def[k] != 'object') {
                    defaults[k] = def[k];
                    update_keys.push(k);
                } else {

                    if ('initial' in def[k]) {
                        defaults[k] = def[k].initial;
                        if (def[k].type) {
                            if (typeof def[k].type != 'function') {
                                throw new Error('illegal type decleration');
                            }
                            type[k] = def[k].type;
                        }
                    } else if (def[k] && typeof def[k] == 'object' && ('autoInitial' in def[k])) {
                        // 没有默认值
                    } else {
                        defaults[k] = def[k];
                    }

                    if (def[k].readonly) {
                        // 不接受客户端上传的改动
                    } else if( def[k].viewonly){
                        // 只在界面上用
                    } else {
                        update_keys.push(k);
                    }
                }
            }
        }

        var ret = function(id) {
            if (arguments.length == 0) {
                this.create();
            } else if (typeof id == 'string') {
                this.create();
                this.id = id;
            } else {
                this.create(id);
            }
        };
        // looks strange
        ret.prototype.create = function(obj) {
            var i = 0;
            var len = all_keys.length;
            var k;
            obj = obj || defaults;
            var self = this;

            function set_k(k) {
                if( def[k].viewonly){
                    self[k] = def[k].initial;
                } else if (type[k]) {
                    self[k] = type[k](obj[k]);
                } else if (def[k] && typeof def[k] == 'object' && ('displayFormat' in def[k])) {
                    if(k in obj){
                        self[k] = def[k].displayFormat(obj[k]);
                    } else {
                        self[k] = def[k].type();
                    }
                } else {
                    self[k] = obj[k];
                }
            }

            for (; i < len; i++) {
                k = all_keys[i];
                set_k(k);
            }


            if (obj.id) {
                this.id = obj.id;
            }
        };

        ret.prototype.toJSON = function() {
            var ret = {};
            var i = 0;
            var len = update_keys.length;
            var k;
            for (; i < len; i++) {
                k = update_keys[i];
                if (def[k] && typeof def[k] == 'object' && ('submitFormat' in def[k])) {
                    ret[k] = def[k].submitFormat(this[k]);
                } else {
                    ret[k] = this[k];
                }
            }

            if (this.id) {
                ret.id = this.id;
            }

            return ret;
        };

        return ret;
    }

    return model;
  
});