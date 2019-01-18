
/**=========================================================
 * Module: DemoTooltipController.js
 * Provides a simple demo for tooltip
 =========================================================*/
App.controller('TooltipDemoCtrl', ["$scope", function ($scope) {
  'use strict';
  $scope.dynamicTooltip = 'Hello, World!';
  $scope.dynamicTooltipText = 'dynamic';
  $scope.htmlTooltip = 'I\'ve been made <b>bold</b>!';

}]);