
/**=========================================================
 * Module: AnimateEnabledDirective.js
 * Enable or disables ngAnimate for element with directive
 =========================================================*/

App.directive('animateEnabled', ['$animate', function ($animate) {
  'use strict';
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      scope.$watch(function () {
        return scope.$eval(attrs.animateEnabled, scope);
      }, function (newValue) {
        $animate.enabled(!!newValue, element);
      });
    }
  };
}]);