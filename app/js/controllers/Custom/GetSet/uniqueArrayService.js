App.service('uniqueArrayService',[function() {
	 'use strict';
	 
	function getUniqueData(userData,uniqueKey,secondUniqueyKey = null) {
		var uniqueArray = userData.map(function(obj) { return secondUniqueyKey === null ? obj[uniqueKey] : obj[uniqueKey][secondUniqueyKey]; });
		uniqueArray = uniqueArray.filter(function(v,i) { return uniqueArray.indexOf(v) == i; });
		return uniqueArray;
	}

	return {
		getUniqueData: getUniqueData
	}

}]);