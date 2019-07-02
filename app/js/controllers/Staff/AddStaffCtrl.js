
/**=========================================================
 * Module: AddStaffController.js
 * Controller for input components
 =========================================================*/

App.controller('AddStaffController', AddStaffController);

function AddStaffController($scope,$rootScope,toaster,apiCall,apiPath,$state,apiResponse,validationMessage,getSetFactory,stateCityFactory) {
  'use strict';

	var vm = this;
	$scope.addStaff = [];
	$scope.insertPermissionArray = [{"configuration":{"dashboard":true,"companies":true,"branches":true,"staff":true,"invoiceNumber":true,"quotationNumber":true,"template":true,"setting":true},"accounting":{"sales":true,"purchase":true,"salesOrder":true,"quotation":true,"creditNote":true,"debitNote":true,"specialJournal":true,"payment":true,"receipt":true,"statements":true,"taxation":true,"ledger":true},"inventory":{"brand":true,"category":true,"product":true,"barcodePrint":true,"stockRegister":true,"stockSummary":true},"crm":{"jobcard":true,"clients":true},"analyzer":{"reports":true},"pricelist":{"tax":true},"quickMenu":{"taxInvoice":true,"taxPurchase":true}}];
	var formdata = new FormData();
	
	$scope.allowedType = $rootScope.$storage.authUser.userType; //Logged user Type (Admin/Staff)
	$scope.allowedId = $rootScope.$storage.authUser.userId; //Logged user Type (Admin/Staff)
	
		if($scope.allowedType == 'staff') {
			$state.go('app.Staff');
		}
	
	$scope.updatedId;
	/* VALIDATION */
		$scope.errorMessage = validationMessage; //Error Messages In Constant
	/* VALIDATION END */
	
	//Get State
	// vm.statesDrop=[];
	// apiCall.getCall(apiPath.getAllState).then(function(response3){
		
		// vm.statesDrop = response3;
	
	// });
	
	//User Type 
	vm.userTypeDrop = ['admin','staff','salesman'];
	
	function loadCompanyData(companyId,callback)
	{
		//Get Documents Images
		apiCall.getCall(apiPath.getAllCompany+'/'+companyId).then( function (response) {
			callback(response);
		});
	}

	$scope.defaultCompany = function(){
		
		//Company Dropdown data
		vm.companyDrop = [];
		
		apiCall.getCall(apiPath.getAllCompany).then(function(responseCompanyDrop){
			
			vm.companyDrop = responseCompanyDrop;
			
			//Set default Company
			var defaultCompanyData = apiCall.getDefaultCompanyFilter(responseCompanyDrop);
				
				$scope.addStaff.company = defaultCompanyData;
				$scope.addStaff.defaultCompany = defaultCompanyData;
				
				formdata.set('companyId',defaultCompanyData.companyId);
				formdata.set('defaultCompanyId',defaultCompanyData.companyId);
				
				vm.branchDrop = [];
				var getAllBranch = apiPath.getOneBranch+defaultCompanyData.companyId;
				//Get Branch
				apiCall.getCall(getAllBranch).then(function(response4){
					
					vm.branchDrop = response4;
						
				});
		});
		
	}
	
	 //Update Set
	if(Object.keys(getSetFactory.get()).length > 0){
	//if(getSetFactory.get() > 0){
		
		var editStaffData = getSetFactory.get();
		getSetFactory.blank();
		
		$scope.addStaff.getSetStaffId = editStaffData.userId;
		
		$scope.updatedId = $scope.addStaff.getSetStaffId;
		
		var getOneStaff = apiPath.getOneStaff+$scope.addStaff.getSetStaffId;
		
		//apiCall.getCall(getOneStaff).then(function(response){
		
			//Company Dropdown data
			vm.companyDrop = [];
			
			apiCall.getCall(apiPath.getAllCompany).then(function(responseCompanyDrop){
				
				vm.companyDrop = responseCompanyDrop;
				
			});
			
			$scope.addStaff.company = editStaffData.company;
			
			if (editStaffData.defaultCompanyId != 0){
				loadCompanyData(editStaffData.defaultCompanyId,function(responseComapny){
					$scope.addStaff.defaultCompany = responseComapny;
				});
			}
			

			vm.branchDrop = [];
			var getAllBranch = apiPath.getOneBranch+editStaffData.company.companyId;
			//Get Branch
			apiCall.getCall(getAllBranch).then(function(response4){
				
				vm.branchDrop = response4;
				
				$scope.addStaff.branch = editStaffData.branch;
			
			});

			//Staff Name
			$scope.addStaff.name = editStaffData.userName;
			//Staff EmailID
			$scope.addStaff.emailId = editStaffData.emailId;
			//Staff Password
			// $scope.addStaff.password = editStaffData.password;
			//Staff Contact
			$scope.addStaff.contact = editStaffData.contactNo;
			//Staff Address
			$scope.addStaff.address = editStaffData.address;
			//Staff Pincode
			$scope.addStaff.pincode = editStaffData.pincode;
			// user Type
			$scope.addStaff.userType = editStaffData.userType;
			
			 vm.statesDrop=[];
			 vm.cityDrop=[];
			stateCityFactory.getState().then(function(response3){
				toaster.clear();
				vm.statesDrop = response3;
				  $scope.addStaff.stateDropDown = editStaffData.state;
				vm.cityDrop = stateCityFactory.getDefaultStateCities(editStaffData.state.stateAbb);
				$scope.addStaff.cityDropDown = editStaffData.city;
			});
			
		//});
	}
	else{
		
		$scope.addStaff.userType = 'staff';
		formdata.set('userType','staff');
		
		$scope.defaultCompany();
		
		 vm.statesDrop=[];
		 vm.cityDrop=[];
		stateCityFactory.getState().then(function(response3){
			toaster.clear();
			vm.statesDrop = response3;
			  $scope.addStaff.stateDropDown = stateCityFactory.getDefaultState($rootScope.defaultState);
			  if(formdata.has('stateAbb')){
				formdata.delete('stateAbb');
			}
			formdata.set('stateAbb',$scope.addStaff.stateDropDown.stateAbb);
			vm.cityDrop = stateCityFactory.getDefaultStateCities($rootScope.defaultState);
			$scope.addStaff.cityDropDown = stateCityFactory.getDefaultCity($rootScope.defaultCity);
			if(formdata.has('cityId')){
				formdata.delete('cityId');
			}
			formdata.set('cityId',$scope.addStaff.cityDropDown.cityId);
		});
			
	}
	
	  
	$scope.changeCompany = function(Fname,state)
	{
		vm.branchDrop = [];
		var getAllBranch = apiPath.getOneBranch+state;
		//Get Branch
		apiCall.getCall(getAllBranch).then(function(response4){
			vm.branchDrop = response4;
		});
		
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		formdata.set(Fname,state);
	}

	$scope.ChangeState = function(Fname,state)
	{
		//console.log(apiPath.getAllCity+state);
		var getonecity = apiPath.getAllCity+state;
		//Get City
		vm.cityDrop = stateCityFactory.getDefaultStateCities(state);
		
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		formdata.set(Fname,state);
	}
	
	//Changed Data When Update
	$scope.changeStaffData = function(Fname,value){
		
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		formdata.set(Fname,value);
	}
 
	$scope.addUpStaff = function(){
		
		if($scope.addStaff.getSetStaffId){
			
			var addEditPath = apiPath.getOneStaff+$scope.addStaff.getSetStaffId;
			var popUp = "Update Successfully";
		}
		else{
			formdata.set('permissionArray',angular.toJson($scope.insertPermissionArray));

			var addEditPath = apiPath.getAllStaff;
			var popUp = "Insert Successfully";
		}
		
		apiCall.postCall(addEditPath,formdata).then(function(response5){
		
			//console.log(response5);
			if(apiResponse.ok == response5){
				
				apiCall.getCall(addEditPath).then(function(resStaff){
					if(angular.isObject(resStaff))
					{
						if(resStaff.userType=='staff')
						{
							$rootScope.$storage.permissionArray = resStaff.permissionArray;
							$rootScope.$storage.authUser = resStaff;
						}

						if(resStaff.userType=='admin'){
							$rootScope.$storage.authUser = resStaff;
						}
					}

					$scope.addStaff = [];
					toaster.pop('success', 'Title', popUp);
					$state.go("app.Staff");
				});
			}
			else{
				
				toaster.pop('warning', 'Opps!!', response5);
			}
		});
	}
	
	$scope.cancel = function(){
		
		$scope.addStaff = [];
		
		// Delete formdata  keys
		for (var key of formdata.keys()) {
		   formdata.delete(key); 
		}
		
		
		$scope.addStaff.userType = 'staff';
		
		if(formdata.has('userType')){
			
			formdata.delete('userType');
		}
		formdata.set('userType','staff');
		
		$scope.defaultCompany();
		
		stateCityFactory.getState().then(function(response3){
			
			vm.statesDrop = response3;
			  $scope.addStaff.stateDropDown = stateCityFactory.getDefaultState($rootScope.defaultState);
			  if(formdata.has('stateAbb')){
				formdata.delete('stateAbb');
			}
			formdata.set('stateAbb',$scope.addStaff.stateDropDown.stateAbb);
			vm.cityDrop = stateCityFactory.getDefaultStateCities($rootScope.defaultState);
			$scope.addStaff.cityDropDown = stateCityFactory.getDefaultCity($rootScope.defaultCity);
			if(formdata.has('cityId')){
				formdata.delete('cityId');
			}
			formdata.set('cityId',$scope.addStaff.cityDropDown.cityId);
		});
		
	}
	
  // Datepicker
  // ----------------------------------- 

  this.today = function() {
    this.dt = new Date();
  };
  this.today();

  this.clear = function () {
    this.dt = null;
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

  this.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  this.initDate = new Date('2016-15-20');
  this.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  this.format = this.formats[0];

  // Timepicker
  // ----------------------------------- 
  this.mytime = new Date();

  this.hstep = 1;
  this.mstep = 15;

  this.options = {
    hstep: [1, 2, 3],
    mstep: [1, 5, 10, 15, 25, 30]
  };

  this.ismeridian = true;
  this.toggleMode = function() {
    this.ismeridian = ! this.ismeridian;
  };

  this.update = function() {
    var d = new Date();
    d.setHours( 14 );
    d.setMinutes( 0 );
    this.mytime = d;
  };

  this.changed = function () {
    console.log('Time changed to: ' + this.mytime);
  };

  this.clear = function() {
    this.mytime = null;
  };

  // Input mask
  // ----------------------------------- 

  this.testoption = {
        "mask": "99-9999999",
        "oncomplete": function () {
            console.log();
            console.log(arguments,"oncomplete!this log form controler");
        },
        "onKeyValidation": function () {
            console.log("onKeyValidation event happend! this log form controler");
        }
    };

  //default value
  this.test1 = new Date();

  this.dateFormatOption = {
      parser: function (viewValue) {
          return viewValue ? new Date(viewValue) : undefined;
      },
      formatter: function (modelValue) {
          if (!modelValue) {
              return "";
          }
          var date = new Date(modelValue);
          return (date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate()).replace(/\b(\d)\b/g, "0$1");
      },
      isEmpty: function (modelValue) {
          return !modelValue;
      }
  };

  this.mask = { regex: ["999.999", "aa-aa-aa"]};

  this.regexOption = {
      regex: "[a-zA-Z0-9._%-]+@[a-zA-Z0-9-]+\\.[a-zA-Z]{2,4}"
  };

  this.functionOption = {
   mask: function () {
      return ["[1-]AAA-999", "[1-]999-AAA"];
  }};

  // Bootstrap Wysiwyg
  // ----------------------------------- 
 
  this.editorFontFamilyList = [
    'Serif', 'Sans', 'Arial', 'Arial Black', 'Courier',
    'Courier New', 'Comic Sans MS', 'Helvetica', 'Impact',
    'Lucida Grande', 'Lucida Sans', 'Tahoma', 'Times',
    'Times New Roman', 'Verdana'
  ];
  
  this.editorFontSizeList = [
    {value: 1, name: 'Small'},
    {value: 3, name: 'Normal'},
    {value: 5, name: 'Huge'}
  ];
}
AddStaffController.$inject = ["$scope","$rootScope","toaster","apiCall","apiPath","$state","apiResponse","validationMessage","getSetFactory","stateCityFactory"];