define([
  'ko'
],function(
  ko
){
  return function( app ){
    var views = app.views = [
      ko.observable(true),
      ko.observable(false),
      ko.observable(false)
    ];

    app.getView=function(viewname){
      return app.views[viewname]();
    };

    app.toggleView=function(viewname){
      if( viewname == 0){
        app.curTodo('');
      } 
      views.forEach(function(view,i){
        view(i==viewname);
      });
    };
    app.isNext=function(viewname){
      var i = 0, len = views.length;
      for(;i<viewname;i++){
        if( views[i]() ){
          return true;
        }
      }
    };
    app.isPrev=function(viewname){
      var i = viewname+1, len = views.length;
      for(;i<len;i++){
        if( views[i]() ){
          return true;
        }
      }
    };
  }
})