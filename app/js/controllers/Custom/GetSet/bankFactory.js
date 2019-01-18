App.factory('bankFactory',['apiCall','apiPath','$q','fetchArrayService', function(apiCall,apiPath,$q,fetchArrayService) {
	 'use strict';
	 
	var bankData = null;
	var branchData = null;
	var Url = apiPath.getAllBank,branchUrl = apiPath.getAllBankBranch;
	var UrlBy = Url+'/',branchUrlBy = branchUrl+'/';
	
	function getBank() {
		if(bankData !== null) {
			var deferredMenu = $q.defer();
				deferredMenu.resolve(bankData);
			return deferredMenu.promise;
		} else {
			//getAllBankBranch();
			return apiCall.getCall(Url).then(function(data) {
				if(angular.isArray(data)){
					bankData = data;
				}
				return data;
			});
		}
	}
 
	function getSingleBank(bankId){
		if(bankData !== null) {
			var deferredMenu = $q.defer();
			 	deferredMenu.resolve(fetchArrayService.myIndexOfObject(bankData,bankId,'bankId'));
			 return deferredMenu.promise;
		} else {
			getBank();
			return apiCall.getCall(UrlBy+bankId).then(function(data) {
				if(angular.isArray(data))
					return fetchArrayService.myIndexOfObject(data,bankId,'bankId');
				else
					return data;
			});
		}
	}
	
	function getBranchByBank(bankId){
		if(branchData !== null) {
			var deferredMenu = $q.defer();
				deferredMenu.resolve(fetchArrayService.getfilteredArray(branchData,bankId,'bankId'));
			return deferredMenu.promise;
		} else {
			//getAllBankBranch();
			return apiCall.getCall(branchUrlBy+bankId).then(function(data) {
				return data;
			});
		}
	}

	function getAllBankBranch(){
		apiCall.getCall(branchUrl).then(function(data) {
			if(angular.isArray(data)) branchData = data;
		});
	}
	
 return {
  getBank: getBank,
  getSingleBank: getSingleBank,
  getBranchByBank: getBranchByBank
 }

}]);
