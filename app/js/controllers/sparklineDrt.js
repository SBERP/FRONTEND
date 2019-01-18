
/**=========================================================
 * Module: SparklinesDirective.js
 * SparkLines Mini Charts
 =========================================================*/
 
App.directive('sparkline', ['$timeout', '$window', function($timeout, $window){
  'use strict';

  return {
    restrict: 'EA',
    scope: {
      'values': '=?',
      'options': '=?'
    },
    controller: ["$scope", "$element", function ($scope, $element) {
      var values = $scope.values;
      var runSL = function(){
        initSparkLine($element);
      };

      $timeout(runSL);
    
      function initSparkLine($element) {
        var options = $scope.options;

        options.type = options.type || 'bar'; // default chart is bar
        options.disableHiddenCheck = true;

        $element.sparkline(values, options);

        if(options.resize) {
          $($window).resize(function(){
            $element.sparkline(values, options);
          });
        }
      }
    }]
  };


}]);
