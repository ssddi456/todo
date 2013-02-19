require([
  'viewToggle'
  ],function(
    viewToggle
    ) {
  var Todo = new koModel({
    selected   : false,
    content    : '',
    isImportant: false,
    progress   : 0,
    isUrgent   : false,
    id         : '',
    parent     : ''
  });

  var app = {};

  app.inited= false;
  app.init = function(){
    app.getTodos();
    app.inited= true;
  }
  app.todos = ko.observableArray([]);

  app.newTodo    = ko.observable('');
  app.newSubTodo = ko.observable('');

  app.curTodo  = ko.observable('');
  app.addTodo  = function() {
    var item = Todo.createBind({content:app.newTodo()})
    item.id(tools.uuid());
    app.todos.push(item);
    //item.subscribe(app.updateCache);
    app.newTodo('');
  }
  app.addSubTodo = function(){
    var item = Todo.createBind({content:app.newSubTodo()});
    item.id(tools.uuid());
    item.parent(app.curTodo().id());
    app.todos.push(item);
    app.newSubTodo('');
  }
  app.removeTodo = function( todo ){
    app.todos.remove(todo);
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
    var res = localStorage.getItem('todo');
    res = JSON.parse(res);
    res.forEach(function(todo){
      if( todo.id == ''){
        todo.id = tools.uuid();
      }
    });
    app.todos(Todo.toKoArray(res));
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
  app.progressMin = ko.observable(0);
  app.progressMax = ko.observable(100);
// flags
  app.progressFilter   = ko.observable(false);

  app.showAll          = ko.observable(true);
  
  app.showImportant    = ko.observable(true);
  app.showNotImportant = ko.observable(true);
  
  app.showUrgent       = ko.observable(true);
  app.showNotUrgent    = ko.observable(true);

  var flagmap = {
    'a':'showAll',         

    'i':'showImportant',   
    'ni':'showNotImportant',

    'u':'showUrgent',      
    'nu':'showNotUrgent'
  }
  app.toggle = function( flag ) {
    var n = flag;
    if( flag in flagmap){
      n = flagmap[flag];
    }
    this[n](!this[n]());
  }

  
  app.todos_to_show = ko.computed(function(){
    var parent = '';
    if( app.curTodo() != '' ){
      parent = app.curTodo().id();
    }
    if(app.showAll()){
      return _.filter(app.todos(),function(todo){
        return todo.parent() == parent;
      });
    }
    var progressFilter = app.progressFilter();
    var progressMin    = app.progressMin()/100;
    var progressMax    = app.progressMax()/100;
    var showi  = app.showImportant();
    var showni = app.showNotImportant();
    var showu  = app.showUrgent();
    var shownu = app.showNotUrgent();
    return _.filter(app.todos(),function(todo){
      var progress = todo.progress();
      return ( todo.isImportant() ? showi : showni ) &&
             ( todo.isUrgent()    ? showu : shownu ) &&
             ( progressFilter ? 
                progress <= progressMax &&
                progress >= progressMin : true ) &&
             ( todo.parent() == parent )
    });
  });

  viewToggle(app);
  
  ko.applyBindings(app);
  app.init();
});