App.factory('stateCityFactory',['apiCall','apiPath','$q','fetchArrayService', function(apiCall,apiPath,$q,fetchArrayService) {
	 'use strict';
	 
	 var savedData = null;
	 var cityData = null;
	 var whileRunning_state = 0;
	 var whileRunning_city = 0;

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
	
	function getDefaultStateCities(stateId) {
		// console.log("stateid..",stateId);
		if (!whileRunning_state) {
			return (function innerFunc(){
				whileRunning_state = 1;
				// console.log("call state..",stateId);
				if (cityData !== null) {
					whileRunning_state = 0;
					// console.log("Done call State..",stateId);
					return fetchArrayService.getfilteredArray(cityData,stateId,'state','stateAbb');
				}
				innerFunc();
			})();
		}
		return;
		// console.log("whileRunning_state..",whileRunning_state);
		// if (!whileRunning_state) {
		// 	whileRunning_state = 1;
		// 	while(true) {
		// 		if (cityData !== null) {
		// 			whileRunning_state = 0;
		// 			return fetchArrayService.getfilteredArray(cityData,stateId,'state','stateAbb');
		// 		}
		// 	}
		// }
		// return;
		// return continueExec(stateId);
	}
	
	function getDefaultCity(cityId) {
		// console.log("cityid..",cityId);
		if (!whileRunning_city) {
			return (function innerFunc1(){
				whileRunning_city = 1;
				// console.log("call city..",cityId);
				if (cityData !== null) {
					whileRunning_city = 0;
					// console.log("Done call City..",cityId);
					return fetchArrayService.getfilteredSingleObject(cityData,cityId,'cityId');
				}
				innerFunc1();
			})();
		}
		return;
		// console.log("whileRunning_city..",whileRunning_city);
		// if (!whileRunning_city) {
		// 	whileRunning_city = 1;
		// 	while(true) {
		// 		if (cityData !== null) {
		// 			whileRunning_city = 0;
		// 			return fetchArrayService.getfilteredSingleObject(cityData,cityId,'cityId');
		// 		}
		// 	}
		// }
		// return;
		// return continueExecForDefault(cityId);
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