/**=========================================================
 * Module: DemoResponsiveTableController.js
 * Controller for responsive tables components
 =========================================================*/

App.controller("ResponsiveTableController", ['$scope', 'colors', function($scope, colors) {
  'use strict';

  $scope.sparkOps1 = {
    barColor: colors.byName('primary')
  };
  $scope.sparkOps2 = {
    barColor: colors.byName('info')
  };
  $scope.sparkOps3 = {
    barColor: colors.byName('turquoise')
  };

  $scope.sparkData1 = [1,2,3,4,5,6,7,8,9];
  $scope.sparkData2 = [1,2,3,4,5,6,7,8,9];
  $scope.sparkData3 = [1,2,3,4,5,6,7,8,9];
}]);