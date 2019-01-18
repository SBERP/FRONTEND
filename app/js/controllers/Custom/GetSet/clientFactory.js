App.factory('clientFactory',['apiCall','apiPath','apiResponse','$q','fetchArrayService', function(apiCall,apiPath,apiResponse,$q,fetchArrayService) {
	 'use strict';
	 
	var clientData = null;
	var clientProfessionData = null;
	var URL = apiPath.getAllClient;
	var professionUrl = apiPath.clientProfession;
	
	/*var channel = pusherFactory.subscribe('my-channel');
    channel.bind('my-event', function(data) {
      console.log('Here');
      console.log(data.message);
    });*/

	/** Cleint **/
		function setUpdatedClient(clientId,formdata) {
			return apiCall.postCall(URL+'/'+clientId,formdata).then(function(data){
				if(angular.isObject(data)){
					fetchArrayService.setUpdatedObject(clientData,data,clientId,'clientId');
				}
				return data;
			});
		}
	 
		function insertAndSetNewClient(formdata,cId = null,pushIt = true){
			var intUpdatePath = cId === null ? URL : URL+'/'+cId;
			return apiCall.postCall(intUpdatePath,formdata).then(function(response){
				if(angular.isObject(response)){
					if(pushIt === true){
						clientData === null ? clientData = [] : '';
						clientData.push(response);
					}
					else{
						fetchArrayService.setUpdatedObject(clientData,response,response.clientId,'clientId');
					}
				}
				return response;
			});
		}
		
		function getSetNewClientByContact(contactNo,pushIt = true){
			var headerSearch = {'Content-Type': undefined,'contactNo':contactNo};
			return apiCall.getCallHeader(URL,headerSearch).then(function(response){
				if(angular.isArray(response)){
					if(pushIt === true){
						clientData === null ? clientData = [] : '';
						clientData.push(response[0]);
					}
					else{
						fetchArrayService.setUpdatedObject(clientData,response[0],response[0].clientId,'clientId');
					}
				}
				return response;
			});
		}
		
		function getClient() {
			if(clientData !== null) {
				 var deferredMenu = $q.defer();
					deferredMenu.resolve(clientData);
				return deferredMenu.promise;
			} else {
				return apiCall.getCall(URL).then(function(data) {
					if(angular.isArray(data)){
						clientData = data;
					}
					return data;
				})
			}
		}
	 
		function blankClient() {
			clientData = null;
		}
	 
		function getSingleClient(cId){
			if(clientData !== null) {
				var deferredMenu = $q.defer();
					deferredMenu.resolve(fetchArrayService.getfilteredSingleObject(clientData,cId,'clientId'));
				return deferredMenu.promise;
			} else {
				getClient();
				return apiCall.getCall(URL+'/'+cId).then(function(data) {
					return data;
				});
			}
		}
		
		function getClientByProfession(profId){
			var deferredMenu = $q.defer();
			
			if(clientData !== null) {
				deferredMenu.resolve(fetchArrayService.getfilteredArray(clientData,profId,'profession','professionId'));
			} else {
				getClient();
			}
			return deferredMenu.promise;
		}
		
	/** End Client **/
	
	/** Cleint Profession **/
		function setGetUpdatedProfession(profId) {
			return apiCall.getCall(professionUrl+'/'+profId).then(function(data){
				if(angular.isObject(data)){
					fetchArrayService.setUpdatedObject(clientProfessionData,data,profId,'professionId');
				}
				return data;
			});
		}
		
		function getSingleProfession(profId){
			if(clientProfessionData !== null) {
				var deferredMenu = $q.defer();
					deferredMenu.resolve(fetchArrayService.getfilteredSingleObject(clientProfessionData,profId,'professionId'));
				return deferredMenu.promise;
			} else {
				getProfession();
				return apiCall.getCall(professionUrl+'/'+profId).then(function(data) {
					return data;
				});
			}
		}
		
		function getProfession() {
			if(clientProfessionData !== null) {
				var deferredMenu = $q.defer();
					deferredMenu.resolve(clientProfessionData);
				return deferredMenu.promise;
			} else {
				return apiCall.getCall(professionUrl).then(function(data) {
					if(angular.isArray(data)){
						clientProfessionData = data;
					}
					return data;
				})
			}
		}
		
		function insertAndUpdateProfession(formdata,profId = null){
				var profPath = profId === null ? professionUrl : professionUrl+'/'+profId;
				return apiCall.postCall(profPath,formdata).then(function(response){
					if(apiResponse.ok == response){
						profId === null ? blankProfession() : '';
					}
					return response;
				});
		}
		
		function blankProfession() {
			clientProfessionData = null;
		}
		
		function deleteSingleProfession(profId){
				if(profId != '' && profId != null && profId != undefined && profId != 0){
					return apiCall.deleteCall(professionUrl+'/'+profId).then(function(response){
						if(apiResponse.ok == response){
							/** Splice **/
							var index = clientProfessionData.findIndex(function(o){
								 return o.professionId == profId;
							});
							if (index !== -1) clientProfessionData.splice(index,1);
							/** Splice **/
						}
						return response;
					});
				}
				else{
					var deferredMenu = $q.defer();
						deferredMenu.resolve('Product Parameter Not Proper');
					return deferredMenu.promise;
				}
		}
	/** End Cleint Profession **/
	
 return {
  setUpdatedClient: setUpdatedClient,
  insertAndSetNewClient: insertAndSetNewClient,
  getSetNewClientByContact: getSetNewClientByContact,
  getClient: getClient,
  blankClient: blankClient,
  getSingleClient: getSingleClient,
  getClientByProfession: getClientByProfession,
  setGetUpdatedProfession: setGetUpdatedProfession,
  getSingleProfession: getSingleProfession,
  getProfession: getProfession,
  insertAndUpdateProfession: insertAndUpdateProfession,
  blankProfession: blankProfession,
  deleteSingleProfession: deleteSingleProfession
 }
}]);
