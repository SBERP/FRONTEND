
/**=========================================================
 * Module: DemoButtonsController.js
 * Provides a simple demo for buttons actions
 =========================================================*/

App.controller('ButtonsCtrl', ["$scope", function ($scope) {
  'use strict';
  $scope.singleModel = 1;

  $scope.radioModel = 'Middle';

  $scope.checkModel = {
    left: false,
    middle: true,
    right: false
  };

}]);