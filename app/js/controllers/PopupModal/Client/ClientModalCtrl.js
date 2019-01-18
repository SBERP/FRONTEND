
App.controller('ClientModalController', ClientModalController);

function ClientModalController($rootScope,$scope,$modalInstance,apiCall,apiPath,validationMessage,stateCityFactory,toaster,apiResponse,clientFactory,apiDateFormate) {
  'use strict';
  
  var vm = this;
  
	// var clientEditData = clientEditData;
	var changeFlag = 0;
	
	var formdata = new FormData();
	$scope.clientForm = [];	
	 

	 var dateFormats = $rootScope.dateFormats; //Date Format

	//  $scope.enableDisableColor = false;
	// $scope.enableDisableSize = false;
	// $scope.enableDisableFrameNo = false;

	$scope.enableDisableAddress = false;
	$scope.enableDisableWorkNo = false;
	$scope.enableDisableState = false;
	$scope.enableDisableCity = false;
	$scope.enableDisableEmailId = false;
	$scope.enableDisableProfession = false;
	
	// $scope.divTag = false;
	// $scope.colspanValue = '6';
	// $scope.colspanAdvanceValue = '7';
	// $scope.totalTd = '13';
	var settingResponse = [];
	//get setting data
	$scope.getOptionSettingData = function(){
		toaster.clear();
		apiCall.getCall(apiPath.settingOption).then(function(response){
			settingResponse = response;
			getSettingData(response);
		});
	}
	$scope.getOptionSettingData();

	function getSettingData(response)
	{
		var responseLength = response.length;
		// console.log("setting response",response);
		for(var arrayData=0;arrayData<responseLength;arrayData++)
		{
			if(angular.isObject(response) || angular.isArray(response))
			{
				if(response[arrayData].settingType=="client")
				{
					var arrayData1 = response[arrayData];
					$scope.enableDisableAddress = arrayData1.clientAddressStatus=="enable" ? true : false;
					$scope.enableDisableWorkNo = arrayData1.clientWorkNoStatus=="enable" ? true : false;
					$scope.enableDisableState = arrayData1.clientStateStatus=="enable" ? true : false;
					$scope.enableDisableCity = arrayData1.clientCityStatus=="enable" ? true : false;
					$scope.enableDisableEmailId = arrayData1.clientEmailIdStatus=="enable" ? true : false;
					$scope.enableDisableProfession = arrayData1.clientProfessionStatus=="enable" ? true : false;
					if(arrayData1.clientStateStatus=="disable")
					{
						$scope.clientForm.stateDropDown = {};
					}
					if(arrayData1.clientCityStatus=="disable")
					{
						$scope.clientForm.cityDrop = {};
					}
				}
			}
		}
	}

	
	vm.professionDrop = [];
	clientFactory.getProfession().then(function(responseDrop){
		console.log("profession drop",responseDrop);
		vm.professionDrop = responseDrop;
	});
	// /* VALIDATION */
	// $scope.errorMessage = validationMessage; //Error Messages In Constant
	// /* VALIDATION END */
	// //1990-02-09T00:00:00+05:30

	// if(angular.isObject(clientEditData)){

	// 	$scope.clientForm.clientContact = clientEditData.contactNo == null || clientEditData.contactNo == '' || clientEditData.contactNo == 'NULL' ? '': clientEditData.contactNo;
	// 	$scope.clientForm.getSetClientId = clientEditData.clientId;  // Client ID
	// 	$scope.clientForm.clientName = clientEditData.clientName;
	// 	$scope.clientForm.emailId = clientEditData.emailId;
	// 	$scope.clientForm.gst = clientEditData.gst;
	// 	$scope.clientForm.address1 = clientEditData.address1;
	// 	vm.birthDate = moment(clientEditData.birthDate,apiDateFormate).format() == 'Invalid date' ? null : new Date(moment(clientEditData.birthDate,apiDateFormate).format('YYYY-MM-DD'));
	// 	vm.anniversaryDate = moment(clientEditData.anniversaryDate,apiDateFormate).format() == 'Invalid date' ? null : new Date(moment(clientEditData.anniversaryDate,apiDateFormate).format('YYYY-MM-DD'));
		

	// 	clientFactory.getProfession().then(function(response){
	// 		vm.professionDrop = response;
	// 		$scope.clientForm.professionDropDown = clientEditData.profession;
	// 	});
		
	// 	/** State/City **/
		// stateCityFactory.getState().then(function(response){
		// 	vm.statesDrop = response;
		// 	$scope.clientForm.stateDropDown = clientEditData.state;
			
		// 	vm.cityDrop = stateCityFactory.getDefaultStateCities(clientEditData.state.stateAbb);
		// 	$scope.clientForm.cityDrop = clientEditData.city;
		// });
		/** End **/
	// }
	//Auto Suggest Client Contact Dropdown data
	$scope.clientGetAllFunction = function(){
		
		vm.clientSuggest = [];
		vm.clientWorkSuggestion = [];
		clientFactory.getClient().then(function(responseDrop){
			vm.clientSuggest = responseDrop;
			// console.log(responseDrop);
			var responseLength = responseDrop.length;
			for(var arrayData=0;arrayData<responseLength;arrayData++)
			{
				if(responseDrop[arrayData].contactNo1 !='' && responseDrop[arrayData].contactNo1 !='null' && responseDrop[arrayData].contactNo1 !=null)
				{
					vm.clientWorkSuggestion.push(responseDrop[arrayData]);	
				}
			}
			
		});
		
		vm.professionDrop = [];
		clientFactory.getProfession().then(function(responseDrop){
			vm.professionDrop = responseDrop;
		});
	}
	
	
	$scope.clientGetAllFunction();	
	$scope.getInitStateCity = function(){
		
		stateCityFactory.getState().then(function(response){
			vm.statesDrop = response;
			$scope.clientForm.stateDropDown = stateCityFactory.getDefaultState($rootScope.defaultState);
			formdata.delete('stateAbb');
			formdata.set('stateAbb',$rootScope.defaultState);
			vm.cityDrop = stateCityFactory.getDefaultStateCities($rootScope.defaultState);
			$scope.clientForm.cityDrop = stateCityFactory.getDefaultCity($rootScope.defaultCity);
			formdata.delete('cityId');
			formdata.set('cityId',$rootScope.defaultCity);
		});
	}
	$scope.getInitStateCity();
	$scope.ChangeState = function(Fname,state)
	 {
		//Get City
		vm.cityDrop = stateCityFactory.getDefaultStateCities(state);
			if(formdata.has(Fname))
			{
				formdata.delete(Fname);
			}
			formdata.set(Fname,state);
	}
	
	// //Changed Data When Update
	$scope.changeInClientData = function(Fname,value){
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		formdata.set(Fname,value);
		changeFlag = 1;
	}
	
	// //Changed Date
	$scope.changeDate = function(Fname,value){
	
		if(value == null){
			formdata.set(Fname,'00-00-000');
		}
		else{
			formdata.set(Fname,moment(value).format(apiDateFormate));
		}
		changeFlag = 1;
	}

    $scope.clickSave = function () {
	
		vm.buttonHidden = true;
		
		if(changeFlag == 0){
			
			vm.errorMsg = 'Plese Change Some Data Then Click Update';
			return false;
		}
		var clientId = null;
		
		// if($scope.clientForm.getSetClientId){
			
		// 	var clientId = $scope.clientForm.getSetClientId;
		// }
		
		clientFactory.insertAndSetNewClient(formdata).then(function(response){
		
			// console.log("redddddddd",response);
			if(angular.isObject(response))
			{
				$modalInstance.close(response);
			}
			else
			{
				toaster.clear();
				toaster.pop('warning','Enter Proper Data');
			}
		});
		
    };

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
ClientModalController.$inject = ["$rootScope","$scope", "$modalInstance","apiCall","apiPath","validationMessage","stateCityFactory","toaster","apiResponse","clientFactory","apiDateFormate"];