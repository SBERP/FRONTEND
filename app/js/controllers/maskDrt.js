
/**=========================================================
 * Module: MaskedDirective
 * Initializes masked inputs
 =========================================================*/

App.directive('masked', function() {
  'use strict';
  return {
    restrict: 'A',
    link: function(scope, element, attributes) {
      
      if($.fn.inputmask)
        element.inputmask(attributes.masked);

    }
  };
});