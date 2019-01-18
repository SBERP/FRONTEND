

/**=========================================================
 * Module: SummaryController.js
 * Handles app setting
 =========================================================*/

App.controller('SummaryController', ["$scope", "colors", function($scope, colors) {
  'use strict';
  $scope.sparkOps1 = {
    barColor: colors.byName('primary'),
    height: 20
  };
  $scope.sparkOps2 = {
    barColor: colors.byName('info'),
    height: 20
  };
  $scope.sparkOps3 = {
    barColor: colors.byName('turquoise'),
    height: 20
  };

  $scope.sparkData1 = [1,2,3,4,5,6,7,8,9];
  $scope.sparkData2 = [1,2,3,4,5,6,7,8,9];
  $scope.sparkData3 = [1,2,3,4,5,6,7,8,9];

}]);