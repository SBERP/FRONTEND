
/**=========================================================
 * Module: EmptyAnchorDirective.js
 * Disables null anchor behavior
 =========================================================*/

App.directive('href', function() {
  'use strict';
  return {
    restrict: 'A',
    compile: function(element, attr) {
        return function(scope, element) {
          if((attr.ngClick || attr.href === '' || attr.href === '#')
              && (!element.hasClass('dropdown-toggle')) ){
            element.on('click', function(e){
              e.preventDefault();
              // e.stopPropagation();
            });
          }
        };
      }
   };
});