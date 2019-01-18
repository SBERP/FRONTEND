
/**=========================================================
 * Module: DemoToasterController.js
 * Demos for toaster notifications
 =========================================================*/

App.controller('ToasterDemoCtrl', ['$scope', 'toaster', function($scope, toaster) {
  'use strict';
  $scope.toaster = {
      type:  'success',
      title: 'Title',
      text:  'Message'
  };

  $scope.pop = function() {
    toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
  };

}]);