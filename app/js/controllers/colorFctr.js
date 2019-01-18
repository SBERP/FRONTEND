
/**=========================================================
 * Module: ColorsService.js
 * Services to retrieve global colors
 =========================================================*/
 
App.factory('colors', ['appColors', function(appColors) {
  'use strict';
  return {
    byName: function(name) {
      return (appColors[name] || '#fff');
    }
  };

}]);