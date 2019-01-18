App.factory('userPermissionFactory',['apiCall','apiPath','apiResponse','$q','fetchArrayService','$rootScope', function(apiCall,apiPath,apiResponse,$q,fetchArrayService,$rootScope) {
	 'use strict';
	 
	function checkPermission() {
		var userId = $rootScope.$storage.authUser.userId;
		console.log(apiPath.getOneStaff+userId);
		return apiCall.getCall(apiPath.getOneStaff+userId).then(function(data){
			console.log(data);
			return data;
			// if(angular.isObject(data)){
			// 	fetchArrayService.setUpdatedObject(savedData,data,productId,'productId');
			// }
		});
	}
 
 return {
  checkPermission: checkPermission
 }

}]);
