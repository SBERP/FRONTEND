App.factory('apiCall', ["$http","$q","apiPath","$rootScope","apiResponse","fetchArrayService", function ($http,$q,apiPath,$rootScope,apiResponse,fetchArrayService) {
	
	var apiRootPath = $rootScope.erpPath;

	return {
		 getCall : function(url){

			return $http({
				url: apiRootPath+url,
				method: 'GET',
				crossDomain:true,
				cache:false,
				//dataType: 'jsonp',
			   headers: {'Content-Type': undefined,'authenticationToken':$rootScope.$storage.authToken}
			}).then(function(response) {
				if(apiResponse.noMatch == response.data || apiResponse.tokenExpired == response.data || apiResponse.notExists == response.data){
					$rootScope.$state.go('page.login');
				}
				return response.data;
			});
		},
		postCall : function(url,formdata){
			
			return $http({
				url: apiRootPath+url,
				method: 'POST',
				processData: false,
				contentType: false,
				crossDomain:true,
				cache:false,
			   headers: {'Content-Type': undefined,'authenticationToken':$rootScope.$storage.authToken},
				data:formdata
			}).then(function(response) {
				if(apiResponse.noMatch == response.data || apiResponse.tokenExpired == response.data || apiResponse.notExists == response.data){
					$rootScope.$state.go('page.login');
				}
				return response.data;
			});
		},
		patchCall : function(url,formdata){
			
			return $http({
				url: apiRootPath+url,
				method: 'PATCH',
				processData: false,
				contentType: false,
				crossDomain:true,
				cache:false,
			   headers: {'Content-Type': undefined,'authenticationToken':$rootScope.$storage.authToken},
				data:formdata
			}).then(function(response) {
				if(apiResponse.noMatch == response.data || apiResponse.tokenExpired == response.data || apiResponse.notExists == response.data){
					$rootScope.$state.go('page.login');
				}
				return response.data;
			});
		},
		getCallHeader : function(url,headerData){
			
			//var headerDataIn = headerData;
			headerData.authenticationToken = $rootScope.$storage.authToken;
			
			return $http({
				url: apiRootPath+url,
				method: 'GET',
				processData: false,
				contentType: false,
				crossDomain:true,
				cache:false,
			   headers: headerData
			}).then(function(response) {
				if(apiResponse.noMatch == response.data || apiResponse.tokenExpired == response.data || apiResponse.notExists == response.data){
					$rootScope.$state.go('page.login');
				}
				return response.data;
			}).catch(function (reason) {
				
			 return  reason;
			  
		   });
		},
		postCallHeader : function(url,headerData,formdata){
			
			headerData.authenticationToken = $rootScope.$storage.authToken;
			
			return $http({
				url: apiRootPath+url,
				method: 'POST',
				processData: false,
				contentType: false,
				crossDomain:true,
				cache:false,
			   headers: headerData,
				data:formdata
			}).then(function(response) {
				if(apiResponse.noMatch == response.data || apiResponse.tokenExpired == response.data || apiResponse.notExists == response.data){
					$rootScope.$state.go('page.login');
					
				}
				
				return response.data;
			}).catch(function (reason) {
				
			 return reason;
			  
		   });
		},
		deleteCall : function(url){
			 
			return $http({
				url: apiRootPath+url,
				method: 'DELETE',
				headers: {'Content-Type': undefined,'authenticationToken':$rootScope.$storage.authToken},
			}).then(function(response) {
				
				if(apiResponse.noMatch == response.data || apiResponse.tokenExpired == response.data || apiResponse.notExists == response.data){
					$rootScope.$state.go('page.login');
				}
				return response.data;
			});

		},
		deleteCallHeader : function(url,headerData){
			 
			headerData.authenticationToken = $rootScope.$storage.authToken;
			
			return $http({
				url: apiRootPath+url,
				method: 'DELETE',
				processData: false,
				crossDomain:true,
				cache:false,
				headers: headerData,
			}).then(function(response) {
				
				if(apiResponse.noMatch == response.data || apiResponse.tokenExpired == response.data || apiResponse.notExists == response.data){
					$rootScope.$state.go('page.login');
				}
				return response.data;
				
			});
		},
		getDefaultCompany : function(){
			
			if ($rootScope.$storage.authUser.defaultCompanyId != 0)
			{
				var defaultCompanyId = $rootScope.$storage.authUser.defaultCompanyId;
			}
			else{
				if (angular.isObject($rootScope.$storage.authUser.company)) {
					var defaultCompanyId = $rootScope.$storage.authUser.company.companyId;
				} else {
					var defaultCompanyId = $rootScope.$storage.authUser.companyId;
				}
			}

			// var deferred = $q.defer();
			
			return $http({
				url: apiRootPath+apiPath.getAllCompany+'/'+defaultCompanyId,
				method: 'GET',
				processData: false,
				crossDomain:true,
				cache:false,
			   headers: {'Content-Type': undefined,'authenticationToken':$rootScope.$storage.authToken},
			}).then(function(response) {
				
				if(apiResponse.noMatch == response.data || apiResponse.tokenExpired == response.data || apiResponse.notExists == response.data){
					$rootScope.$state.go('page.login');
				}
				return response.data;
				// var companyCnt = response.data.length;
				// var j=0;
				// while(j<companyCnt){
				// 	if(response.data[j].isDefault == 'ok')
				// 	{
				// 		deferred.resolve(response.data[j]);
				// 		break;
				// 	}
				// 	j++;
				// }
			});

			// return deferred.promise;
			
		},
		getDefaultCompanyFilter : function(companyData){
			
			if (angular.isArray(companyData))
			{
				if (companyData.length > 0) {
					if ($rootScope.$storage.authUser.defaultCompanyId != 0)
					{
						var defaultCompanyId = $rootScope.$storage.authUser.defaultCompanyId;
					}
					else{
						if(angular.isObject($rootScope.$storage.authUser.company)){
							var defaultCompanyId = $rootScope.$storage.authUser.company.companyId;
						}
						else{
							var defaultCompanyId = $rootScope.$storage.authUser.companyId;
						}
					}
					return fetchArrayService.getfilteredSingleObject(companyData,defaultCompanyId,'companyId');
				}
			}
			return {};
			
		},
		getDefaultBranch : function(){
			 
			var deferred = $q.defer();
			
			$http({
				url: apiRootPath+apiPath.getAllBranch,
				method: 'GET',
				processData: false,
				crossDomain:true,
				cache:false,
			   headers: {'Content-Type': undefined,'authenticationToken':$rootScope.$storage.authToken},
			}).then(function(response) {
				
				if(apiResponse.noMatch == response.data || apiResponse.tokenExpired == response.data || apiResponse.notExists == response.data){
					$rootScope.$state.go('page.login');
				}
				var branchCnt = response.data.length;
				var i=0;
				while(i<branchCnt){
					if(response.data[i].isDefault == 'ok')
					{
						deferred.resolve(response.data[i]);
						break;
					}
					i++;
				}
			});

			return deferred.promise;
			
		}
			
	};
}]);