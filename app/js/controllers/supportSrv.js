
/**=========================================================
 * Module: SupportService.js
 * Checks for features supports on browser
 =========================================================*/

App.service('support', ["$document", "$window", function($document, $window) {
  'use strict';
  var support = {};
  var doc = $document[0];

  // Check for transition support
  // ----------------------------------- 
  support.transition = (function() {

      var transitionEnd = (function() {

          var element = doc.body || doc.documentElement,
              transEndEventNames = {
                  WebkitTransition: 'webkitTransitionEnd',
                  MozTransition: 'transitionend',
                  OTransition: 'oTransitionEnd otransitionend',
                  transition: 'transitionend'
              }, name;

          for (name in transEndEventNames) {
              if (element.style[name] !== undefined) return transEndEventNames[name];
          }
      }());

      return transitionEnd && { end: transitionEnd };
  })();

  // Check for animation support
  // ----------------------------------- 
  support.animation = (function() {

      var animationEnd = (function() {

          var element = doc.body || doc.documentElement,
              animEndEventNames = {
                  WebkitAnimation: 'webkitAnimationEnd',
                  MozAnimation: 'animationend',
                  OAnimation: 'oAnimationEnd oanimationend',
                  animation: 'animationend'
              }, name;

          for (name in animEndEventNames) {
              if (element.style[name] !== undefined) return animEndEventNames[name];
          }
      }());

      return animationEnd && { end: animationEnd };
  })();

  // Check touch device
  // ----------------------------------- 
  support.touch                 = (
      ('ontouchstart' in window && navigator.userAgent.toLowerCase().match(/mobile|tablet/)) ||
      ($window.DocumentTouch && document instanceof $window.DocumentTouch)  ||
      ($window.navigator['msPointerEnabled'] && $window.navigator['msMaxTouchPoints'] > 0) || //IE 10
      ($window.navigator['pointerEnabled'] && $window.navigator['maxTouchPoints'] > 0) || //IE >=11
      false
  );

  return support;
}]);