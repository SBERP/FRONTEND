App.factory('stateCityFactory',['apiCall','apiPath','$q','fetchArrayService', function(apiCall,apiPath,$q,fetchArrayService) {
	 'use strict';
	 
	 var savedData = null;
	 var cityData = null;
	 
	 function getCity() {
		 return cityData;
	 }
 
	function getState() {
		var deferredMenu = $q.defer();
			if(savedData !== null && cityData !== null) {
				deferredMenu.resolve(savedData);
			} else {
				apiCall.getCall(apiPath.getAllState).then(function(data) {
					if(angular.isArray(data)){
						savedData = data;
					}
					apiCall.getCall(apiPath.getOneCity).then(function(response) {
						deferredMenu.resolve(savedData);
						if(angular.isArray(data)){
							cityData = response;
						}
					});
				});
			}
		return deferredMenu.promise;
	}
 
	 function blankState() {
	   savedData = null;
	 }
	 function blankCity() {
	   cityData = null;
	 }

	function getDefaultState(stateId){
		return fetchArrayService.getfilteredSingleObject(savedData,stateId,'stateAbb');
	}
	
	function getDefaultStateCities(stateId){
		return continueExec(stateId);
	}
	
	function getDefaultCity(cityId){
		return continueExecForDefault(cityId);
	}
	
	function continueExec(stateId) {
		//here is the trick, wait until var callbackCount is set number of callback functions
		if (cityData === null) {
			setTimeout(continueExec(stateId), 2000);
			return;
		}
		//Finally, do what you need
		return fetchArrayService.getfilteredArray(cityData,stateId,'state','stateAbb');
	}
	
	function continueExecForDefault(cityId) {
		//here is the trick, wait until var callbackCount is set number of callback functions
		if (cityData === null) {
			setTimeout(continueExecForDefault(cityId), 2000);
			return;
		}
		//Finally, do what you need
		return fetchArrayService.getfilteredSingleObject(cityData,cityId,'cityId');
	}

 return {
  getState: getState,
  getCity: getCity,
  blankState: blankState,
  blankCity: blankCity,
  getDefaultState: getDefaultState,
  getDefaultStateCities: getDefaultStateCities,
  getDefaultCity: getDefaultCity
 }

}]);