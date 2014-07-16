require.config({
  paths : {
    ko : 'http://cdn.staticfile.org/knockout/3.1.0/knockout-debug',
    jquery:'http://cdn.staticfile.org/jquery/1.10.0/jquery'
  }
})

require([
  'jquery',
  './timeline',
  './action_record',
  './postChannel',
  'ko',
  './koModel',
  'viewToggle'
],function(
  $,
  timeline,
  action_record,
  postChannel,
  ko,
  koModel,
  viewToggle
){

  var localStorage = {
    getItem : function( name, cb ){
      postChannel({
        type : 'getItem',
        name : name
      },cb);
    },
    setItem : function( name, data, cb){
      postChannel({
        type : 'setItem',
        data : data,
        name : name
      },cb);
    }
  }
  ko.bindingHandlers.toggleClick = {
    init: function (element, valueAccessor) {
        var value = valueAccessor();

        ko.utils.registerEventHandler(element, "click", function () {
            value(!value());
        });
    }
  };

  var tools = (function(){
    return {
      uuid : function() {
        function S4() {
           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
      }
    };
  })();

  var Todo = new koModel({
    selected   : false,
    content    : '',
    isImportant: false,
    progress   : 0,
    isUrgent   : false,
    id         : '',
    parent     : '',
    completed  : false
  });

  var app = {};

  app.init = function(){
    var flagmap = {
      'showAll'          : true,

      'showImportant'    : true,
      'showNotImportant' : true,

      'showUrgent'       : true,
      'showNotUrgent'    : true,

      'showCompleted'    : false
    };

    var settingKey = 'filterSetting';
    localStorage.getItem(settingKey,function( err, settings ) {
      settings = settings && JSON.parse(settings) || {};
      var keys = Object.keys(flagmap);
      function saving () {
        var ret = {};
        keys.forEach(function( key ) {
          ret[key] = app[key]();
        });
        localStorage.setItem(settingKey, JSON.stringify(ret));
      }
      for( var flag in flagmap ){
        app[flag] = ko.observable( settings[flag] == undefined ? 
                                    flagmap[flag]:
                                    settings[flag] );
        app[flag].subscribe(saving);
      }

      
      app.todos_to_show = ko.computed(function(){
        var parent = '';
        if( app.curTodo() != '' ){
          parent = app.curTodo().id();
        }
        var todos = _.filter(app.todos(),function(todo){
                      return todo.parent() == parent;
                    });
        if(app.showAll()){
          return todos
        }
        if(!app.showAll() && !app.showCompleted() ){
          todos = _.filter(todos,function(todo){
                    return !todo.completed();
                  });
        }
        var showi  = app.showImportant();
        var showni = app.showNotImportant();
        var showu  = app.showUrgent();
        var shownu = app.showNotUrgent();

        return _.filter( todos,function(todo){
          var progress = todo.progress();
          return ( todo.isImportant() ? showi : showni ) &&
                 ( todo.isUrgent()    ? showu : shownu )
        });
      });

      app.getTodos();
      ko.applyBindings(app);

      Todo.subscribe(function( changedname, changeditem ){
        if( changedname == 'content' ){
          action_record(changeditem, 'update');
        }
      });
    });
  };

  app.todos = ko.observableArray([]);

  app.newTodo    = ko.observable('');
  app.newSubTodo = ko.observable('');

  app.curTodo  = ko.observable('');
  app.addTodo  = function() {
    var item = Todo.createBind({content:app.newTodo()})
    action_record(item,'new');
    item.id(tools.uuid());
    app.todos.push(item);
    app.newTodo('');
  }
  app.addSubTodo = function(){
    var item = Todo.createBind({content:app.newSubTodo()});
    item.id(tools.uuid());
    item.parent(app.curTodo().id());
    app.todos.push(item);
    action_record(item,'new');
    app.newSubTodo('');
  }
  app.removeTodo = function( todo ){
    app.todos.remove(todo);
    action_record(item,'remove');
  };
  app.showSub  = function (todo){
    app.curTodo(todo);
    console.log(
      todo.parent(),
      todo.id()
    );
    app.toggleView(1);
  }
  app.getTodos = function() {
    localStorage.getItem('todo', function( err, res ){
      res = JSON.parse(res) || [];
      res.forEach(function(todo){
        if( todo.id == ''){
          todo.id = tools.uuid();
        }
      });
      app.todos(Todo.toKoArray(res));
    });
    return;
  };

  app.updateCache = function() {
    localStorage.setItem('todo',JSON.stringify(Todo.toDataArray(app.todos())));
  };
  // with all items
  Todo.subscribe(app.updateCache);
  app.todos.subscribe(app.updateCache);

  app.getProgress     = function(todo){
    return 'width:'+(Math.max(todo.progress(),0.05)*100).toFixed(1)+'%';
  };

  app.setProgress     = function( todo, e ){
    var $t = $(e.target);
    $t = $t.is('.bar')?$t.parent(): $t;
    var p = e.offsetX / $t.width();
    p = ~~((p*10)+0.5)/10;
    todo.progress(p);
  }

  viewToggle(app);
  
  app.init();
});