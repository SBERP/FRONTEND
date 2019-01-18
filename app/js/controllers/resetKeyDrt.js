
/**=========================================================
 * Module: ResetKeyDirective.js
 * Removes a key from the browser storage via element click
 =========================================================*/

App.directive('resetKey',  ['$state', '$rootScope', function($state, $rootScope) {
  'use strict';

  return {
    restrict: 'EA',
    link: function(scope, element, attrs) {
      
      var resetKey = attrs.resetKey;

      element.on('click', function (e) {
          e.preventDefault();

          if(resetKey) {
            delete $rootScope.$storage[resetKey];
            $state.go($state.current, {}, {reload: true});
          }
          else {
            $.error('No storage key specified for reset.');
          }
      });
    }
  };

}]);