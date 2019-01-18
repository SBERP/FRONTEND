

/**=========================================================
 * Module: VectorMapDirective
 * Init jQuery Vector Map plugin
 =========================================================*/

App.directive('vectorMap', function(){
  'use strict';

  return {
    restrict: 'EA',
    scope: {
      mapOptions: '='
    },
    compile: function(tElement, tAttrs, transclude) {
      return {
        post: function(scope, element) {
          var options     = scope.mapOptions,
              mapHeight   = options.height || '300';
          
          element.css('height', mapHeight);
          
          element.vectorMap(options);
        }
      };
    }
  };

});