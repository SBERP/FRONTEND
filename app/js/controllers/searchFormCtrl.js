

/**=========================================================
 * Module: SearchFormController.js
 * Provides autofill for top navbar search form
 =========================================================*/

App.controller('SearchFormController', ["$scope", "$state", function ($scope, $state) {
  'use strict';
  
  var routes = $state.get(),
      blackList = ['app', 'page']; // routes that don't want to show

  $scope.routeSelected = undefined;

  $scope.states = routes.filter(function(item){

    return ( blackList.indexOf(item.name) < 0 ? true : false);

  }).map(function(item){

    return item.name;

  });

   $scope.onRouteSelect = function ($item, $model, $label) {

    // move to route when match is selected
    if($model) {
      $state.go($model);
      $scope.routeSelected = undefined;
    }

  };
  

}]);