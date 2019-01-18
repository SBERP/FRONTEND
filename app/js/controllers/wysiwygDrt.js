
/**=========================================================
 * Module: WysiwygDirective.js
 * Initializes the Wysiwyg editor
 =========================================================*/

App.directive('wysiwyg', ["$timeout", function($timeout) {
  'use strict';

  return {
    restrict: 'EA',
    controllerAs: 'editor',
    priority: 2001,
    link: function(scope, element, attrs) {
      
      element.css({
        'overflow':     'scroll',
        'height':       attrs.height || '250px',
        'max-height':   attrs.maxHeight || '300px'
      });

      $timeout(function() {
        element.wysiwyg();
      });
    }
  };

}]);