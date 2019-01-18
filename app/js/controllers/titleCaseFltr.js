
/**=========================================================
 * Module: TitleCaseFilter.js
 * Convert any case to title
 =========================================================*/

App.filter('titlecase', function() {
  'use strict';
  return function(s) {
      s = ( s === undefined || s === null ) ? '' : s;
      return s.toString().toLowerCase().replace( /\b([a-z])/g, function(ch) {
          return ch.toUpperCase();
      });
  };
});