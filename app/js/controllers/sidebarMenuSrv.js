
App.service('sidebarMemu', ["$rootScope", "$http","userPermisionKey", function($rootScope, $http,userPermisionKey) {
  'use strict';
  var menuJson = 'server/sidebar/sidebar-items.json',
      menuURL  = menuJson + '?v=' + (new Date().getTime()); // jumps cache
	  

  return {
    load: function(pURL = null) {
      //console.log(pURL);
      var baseUrl;
      
      if(pURL != null ){
        baseUrl = pURL;
      }
      else{
        baseUrl = menuURL;
      }

      $http.get(baseUrl)
        .success(function(items) {
          //console.log('service..');
           $rootScope.menuItems = items;
           $rootScope.permissionKey = userPermisionKey.configuration;

        })
        .error(function(data, status, headers, config) {

          alert('Failure loading menu');

        });
    }
  };

}]);