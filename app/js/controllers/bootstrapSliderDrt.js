
/**=========================================================
 * Module: BootstrapSliderDirective
 * Initializes the jQuery UI slider controls
 =========================================================*/

App.directive('bootstrapSlider', function() {
  'use strict';
  return {
    restrict: 'A',
    controller: ["$scope", "$element", function($scope, $element) {
      var $elem = $($element);
      if($.fn.slider)
        $elem.slider();
    }]
  };
});