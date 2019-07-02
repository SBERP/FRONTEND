
App.controller('permissionModalController', permissionModalController);

function permissionModalController($rootScope,$scope,$modalInstance,apiCall,apiPath,apiResponse,userData,toaster,getSetFactory,$modal,productFactory,fetchArrayService) {
  'use strict';
  
  var vm = this;
  
	var changeFlag = 0;
	
	var userData = userData;
	$scope.permissionArray = [{"configuration":{},"accounting":{},"inventory":{},"crm":{},"analyzer":{},"pricelist":{},"quickMenu":{}}];
	if(userData.permissionArray != null && userData.permissionArray.length > 0){
		$scope.permissionArray[0].configuration = userData.permissionArray[0].configuration;
		$scope.permissionArray[0].accounting = userData.permissionArray[0].accounting;
		$scope.permissionArray[0].inventory = userData.permissionArray[0].inventory;
		$scope.permissionArray[0].crm = userData.permissionArray[0].crm;
		$scope.permissionArray[0].analyzer = userData.permissionArray[0].analyzer;
		$scope.permissionArray[0].pricelist = userData.permissionArray[0].pricelist;
		$scope.permissionArray[0].quickMenu = userData.permissionArray[0].quickMenu;
	}

	
	// $scope.permissionArray = $rootScope.$storage.permissionArray;

	$scope.clientForm = [];	
	$scope.commissionArray = {};
	$scope.commissionArray.commissionStatus = false;
	$scope.commissionArray.commissionType = null;
	$scope.commissionArray.commissionRate = 0;
	$scope.commissionArray.commissionRateType = null;
	$scope.commissionArray.commissionCalcOn = null;
	$scope.commissionArray.categoryDrop = [];
	$scope.commissionArray.productBrandDrop = [];
	$scope.commissionArray.commissionRateTypeDrop = ['Flat','Percentage'];
	$scope.commissionArray.commissionCalcDrop = ['Sales Price','MRP','None'];

	$scope.changeRateType = function(){
		if ($scope.commissionArray.commissionRateType == 'Flat') {
			$scope.commissionArray.commissionCalcOn = 'None';
		}
	}
	/**
	* Get Commission Data
	*/
	/**
	* Enable disable Commission module for User
	*/
	if (!$scope.commissionArray.categoryDrop.length) {
			apiCall.getCall(apiPath.getAllCategory).then(function(responseDrop){
				$scope.commissionArray.categoryDrop = responseDrop;
			});
		}
		if (!$scope.commissionArray.productBrandDrop.length) {
			apiCall.getCall(apiPath.getAllGroup).then(function(responseDrop){
				$scope.commissionArray.productBrandDrop = responseDrop;
			});
		}
	$scope.enableDisableCommission = function(){
		if ($scope.commissionArray.commissionStatus) {
			
		}
	}
	apiCall.getCall(apiPath.getStaffCommission+userData.userId).then(function(responseDrop){
		if (angular.isObject(responseDrop)) {
			$scope.commissionArray.commissionStatus = responseDrop.commissionStatus == 'on' ? true : false;
			$scope.commissionArray.commissionType = responseDrop.commissionType;
			$scope.commissionArray.commissionRateType = responseDrop.commissionRateType.charAt(0).toUpperCase() + responseDrop.commissionRateType.substr(1).toLowerCase();
			$scope.commissionArray.commissionRate = responseDrop.commissionRate;
			$scope.commissionArray.commissionCalcOn = responseDrop.commissionCalcOn;
			if (responseDrop.commissionType == 'categoryWise') {
				$scope.commissionArray.category = JSON.parse(responseDrop.commissionFor);
			}else if (responseDrop.commissionType == 'brandWise') {
				$scope.commissionArray.brand = JSON.parse(responseDrop.commissionFor);
			}
		}
	});
	 var dateFormats = $rootScope.dateFormats; //Date Format
	/* Insert or Update Button*/
	/**
	* Enable disable Commission module for User
	*/
		$scope.clickSave = function(){
			var commissionFormData = undefined;
			commissionFormData = new FormData();
			commissionFormData.set('userId',userData.userId);
			if ($scope.commissionArray.commissionStatus) {
				commissionFormData.set('commissionStatus','on');
				commissionFormData.set('commissionType',$scope.commissionArray.commissionType);
				commissionFormData.set('commissionRate',$scope.commissionArray.commissionRate);
				commissionFormData.set('commissionRateType',$scope.commissionArray.commissionRateType);
				commissionFormData.set('commissionCalcOn',$scope.commissionArray.commissionCalcOn);
				switch($scope.commissionArray.commissionType)
				{
					case 'general':
						commissionFormData.set('commissionFor',angular.toJson([]));
					break;
					case 'categoryWise':
						commissionFormData.set('commissionFor',angular.toJson($scope.commissionArray.category));
					break;
					case 'brandWise':
						commissionFormData.set('commissionFor',angular.toJson($scope.commissionArray.brand));
					break;
					case 'itemWise':
						commissionFormData.set('commissionFor',angular.toJson([]));
						commissionFormData.set('commissionRate','1');
						commissionFormData.set('commissionRateType','Percentage');
						commissionFormData.set('commissionCalcOn','Sales Price');
					break;
					default:
						commissionFormData.set('commissionFor',angular.toJson([]));
					break;
				}
			}else{
				commissionFormData.set('commissionStatus','off');
			}
			apiCall.postCall(apiPath.getStaffCommission+userData.userId,commissionFormData).then(function(response){
			});
			var formdata = undefined;
			 	formdata = new FormData();

			/*angular.forEach($scope.permissionArray[0],function(value,key){
				angular.forEach(value,function(subValue,subKey){
					if(subValue == false){
						delete $scope.permissionArray[0][key][subKey];
					}
				});
			});*/

			formdata.set('permissionArray',angular.toJson($scope.permissionArray));

			apiCall.postCall(apiPath.getOneStaff+userData.userId,formdata).then(function(response){
				if(response==apiResponse.ok)
				{
					$modalInstance.close();
				}
				else
				{
					$modalInstance.dismiss();
					// toaster.clear();
					// toaster.pop('warning', response);
				}
				// }
			});
		}
	/* End */
	
    $scope.cancel = function () {
		$modalInstance.dismiss();
    };


  // Datepicker
  // ----------------------------------- 
	this.minStart = new Date('1990-01-01');

  this.today = function() {
    this.birthDate = new Date();
    this.anniversaryDate = new Date();
  };


  this.clear = function () {
    //this.birthDate = null;
  };

  // Disable weekend selection
  this.disabled = function(date, mode) {
    return false; //( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  };

  this.toggleMin = function() {
    this.minDate = this.minDate ? null : new Date();
  };
  this.toggleMin();

  this.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    this.opened = true;
  };
	
	this.openStartBirth = function($event) {
	  
    $event.preventDefault();
    $event.stopPropagation();

    this.openedStartBirth = true;
  };

  this.openStartAnivarSary = function($event) {
	  
    $event.preventDefault();
    $event.stopPropagation();

    this.openedStartAnivarSary = true;
  };
  
  this.dateOptions = {
    formatYear: 'yy',
    startingDay: 1,
    initDate : new Date('1990-01-01')
  };

  // this.formats = ['dd-MMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  this.format = dateFormats;

  
}
permissionModalController.$inject = ["$rootScope","$scope", "$modalInstance","apiCall","apiPath","apiResponse","userData","toaster"];