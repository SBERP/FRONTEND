
/**=========================================================
 * Module: BranchCtrl.js
 * Controller for ngTables
 =========================================================*/

App.controller('loginController', loginController);

function loginController($rootScope,$scope,hostFrontUrl,$http,apiPath,apiCall,$state,apiResponse,vcRecaptchaService,googleSiteKey,$timeout) {
  'use strict';
  var vm = this;
 
	$scope.disableValue = false;
	
	$scope.loginData = [];
	$scope.notMatch = false; // True when Email or password will Be Wrong.
	$scope.errorCaptcha = false;
	
	var googleSiteKeys = $rootScope.googleSiteKey;
	 var hostName = "http://"+window.location.hostname+"/";
	 
	angular.forEach(hostFrontUrl, function(value, key) {
		//console.log(value);
		if(value == hostName){
			vm.googleSiteKey = googleSiteKeys[key];
		}
	});
	
	// vm.localSiteKey = "6Ld6HSYTAAAAADSDPt5td0Te37OIgB2R10JvAgQg";
	// vm.siliconSiteKey = "6LchHRoUAAAAAIZHW5kSReJ6ZLRJ1gmT4D36Kdhv";
	// vm.swaminarayanSiteKey = "6LetFRoUAAAAAESKewnFkYr88sVgYCSPxugTgo7C";
	// vm.v2erp = "6LfxfhwUAAAAAL3B7C6bI-_ZCuCYvO1vNFu4f4-6";
	
	vm.loaderIcon = false;
	
	$scope.createCallback = function(widgetId){
      $scope.widgetId = widgetId;
    };
	$scope.rightCaptcha = false;
	
	$scope.checkCaptcha = function(response){
		//console.log(response);
		//$scope.successCaptcha = response;
		if(response === ""){ //if string is empty
			//alert("Please resolve the captcha and submit!");
			
			$scope.rightCaptcha = false;
			//console.log('fail');
			
        }else {
			
			$scope.rightCaptcha = true;
			$scope.errorCaptcha = false;
			//console.log('suceess');
		}
	}
	
	$scope.login = function(){
		
		//console.log(vcRecaptchaService.getResponse($scope.widgetId));
		//return false;
			if($scope.rightCaptcha)
			{
				/**Login Code **/
					$scope.disableValue = true;
		
					 var formdata = new FormData();
					formdata.append('emailId',$scope.loginData.emailId);
					formdata.append('password',$scope.loginData.password);
					
					vm.loaderIcon = true;
					
					$http({
						url: $rootScope.erpPath+apiPath.loginAuth,
						method: 'post',
						processData: false,
					   headers: {'Content-Type': undefined},
						data:formdata
					}).success(function(response, status, headers, config) {
						
						//if($rootScope.$storage.authToken){
						if(angular.isObject(response))
						{
							//$rootScope.$storage.authToken = response.authenticationToken;
							$rootScope.$storage.authToken = response.token;
							$rootScope.$storage.authUser = response.user;
							defaultCompany();
							if(response.user['userType']=='superadmin' || response.user['userType']=='admin')
							{
								$rootScope.$storage.permissionArray = [{"configuration":{"dashboard":true,"companies":true,"branches":true,"staff":true,"invoiceNumber":true,"quotationNumber":true,"template":true,"setting":true},"accounting":{"sales":true,"purchase":true,"salesOrder":true,"purchaseOrder":true,"quotation":true,"creditNote":true,"debitNote":true,"specialJournal":true,"payment":true,"receipt":true,"statements":true,"taxation":true,"ledger":true},"inventory":{"brand":true,"category":true,"product":true,"barcodePrint":true,"stockRegister":true,"stockSummary":true},"crm":{"jobcard":true,"clients":true},"analyzer":{"reports":true},"pricelist":{"tax":true},"quickMenu":{"taxInvoice":true,"taxPurchase":true}}];
								//$rootScope.loggedUser = $rootScope.$storage.authUser;
								//console.log($rootScope.loggedUser);
								// $state.go("app.Company");
							}
							else
							{
								$rootScope.$storage.permissionArray = response.user['permissionArray'];
								$rootScope.loggedUser = $rootScope.$storage.authUser;
								//console.log($rootScope.loggedUser);
								// $state.go("app.Company");
							}

							$rootScope.$storage.settingOptionArray = [];

							apiCall.getCall(apiPath.settingOption).then(function(response2)
							{
								if (angular.isArray(response2)) {
									$rootScope.$storage.settingOptionArray = response2;
								}
							});
							$rootScope.app.sidebar.isCollapsed = true;
							$rootScope.app.sidebar.sidebar_hide = false;
							$rootScope.app.sidebar.sidebar_from_topbar = true;
							$state.go("app.dashboard");
						}
						else{
							vm.loaderIcon = false;
							$scope.disableValue = false;
							$scope.notMatch = true;
						}
					
					});
			/** End **/
			}
			else{
				
				$scope.errorCaptcha = true;
				vm.loaderIcon = false;
			}
        }
	
	
	$scope.changeIt = function(){
		
		$scope.notMatch = false;
	}

	$scope.getUserData = function()
	{
		console.log("hiopppp");
	}
	function defaultCompany()
	{
		//Company Dropdown data
		apiCall.getCall(apiPath.getAllCompany).then(function(responseCompanyDrop){
			// console.log("all company = ",responseCompanyDrop);
			//Set default Company
			$rootScope.$storage.defaultCompany = apiCall.getDefaultCompanyFilter(responseCompanyDrop);
			// console.log("default company",$rootScope.$storage.defaultCompany);	
		});
		
	}
}
loginController.$inject = ["$rootScope","$scope","hostFrontUrl","$http","apiPath","apiCall","$state","apiResponse","vcRecaptchaService","$timeout"];