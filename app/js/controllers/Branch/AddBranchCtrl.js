
/**=========================================================
 * Module: AddBranchController.js
 * Controller for input components
 =========================================================*/

App.controller('AddBranchController', AddBranchController);

function AddBranchController($rootScope,$scope,toaster,$http,apiCall,apiPath,$state,$location,apiResponse,validationMessage,getSetFactory,stateCityFactory,fetchArrayService) {
  'use strict';
  var vm = this;
  var formdata = new FormData();
  vm.selectBranch;
  vm.selectBranch = true;
  $scope.addBranch=[];
	/* VALIDATION */
	
		$scope.errorMessage = validationMessage; //Error Messages In Constant
		//$scope.validationPattern = validationPattern; //pattern
	
	/* VALIDATION END */
	
	/* Hide/Show Company Panel */
	
		//$rootScope.BranchModify = false;
		 $scope.$on('$locationChangeStart', function (event) {
                $rootScope.AddBranchModify = true;
            });
		
	/* End */
	
	
	//Change Branch On Select Company
	$scope.changeCompany = function(state)
	{
		 vm.branchDrop = [];
		var getAllBranch = apiPath.getOneBranch+state;
		//Get Branch
		apiCall.getCall(getAllBranch).then(function(response4){
			vm.branchDrop = response4;
				
		});
	}
	
	$scope.enableSaveButton = function(){
		
		vm.selectBranch = false;
	}
	$scope.goToModify = function()
	{
		
		var id = $scope.addBranch.branchDropDown;
		  getSetFactory.set(id);
		$scope.AddEditFunction();
		//$location.path('app/AddBranch'); 
	}
	
	vm.cityDrop=[];
	//get Company
	vm.companyDrop=[];
	apiCall.getCall(apiPath.getAllCompany).then(function(response2){
		
		//console.log(response2);
		vm.companyDrop = response2;
		
		if(!$scope.addBranch.bId){
			
			//Set default Company
				var defaultCompanyData = apiCall.getDefaultCompanyFilter(response2);
				$scope.addBranch.companyDropDown = defaultCompanyData;
				$scope.addBranch.companyDropDown2 = defaultCompanyData;
				
				formdata.append('companyId',defaultCompanyData.companyId);
				
				vm.branchDrop = [];
				var getAllBranch = apiPath.getOneBranch+defaultCompanyData.companyId;
				//Get Branch
				apiCall.getCall(getAllBranch).then(function(response4){
					
					vm.branchDrop = response4;
						
				});
		}
	
	});
	
	vm.sdfg;
	$scope.AddEditFunction = function(){
		
	if(Object.keys(getSetFactory.get()).length > 0){
	//if(getSetFactory.get() > 0){
	  
	  var editBranchData = getSetFactory.get();
	   getSetFactory.blank();
	   
	  $scope.addBranch.bId = editBranchData.branchId;
	 
	  
		//Edit Branch
		var editBranch = apiPath.getAllBranch+'/'+$scope.addBranch.bId;
		
		//apiCall.getCall(editBranch).then(function(res){
			
			
			vm.sdfg = editBranchData.company.companyId;
			//console.log(vm.sdfg);
			$scope.addBranch.branchName = editBranchData.branchName;
			$scope.addBranch.fisrtAddress = editBranchData.address1;
			$scope.addBranch.secondAddress = editBranchData.address2;
			//$scope.addBranch.stateDropDown = editBranchData.state_abb;
			//$scope.addBranch.cityDropDown = editBranchData.city_id;
			
			$scope.addBranch.pincode = editBranchData.pincode;
			
			$scope.addBranch.companyDropDown = editBranchData.company;
				
			$scope.addBranch.companyDropDown2 = editBranchData.company;
			
			//Branch
			vm.branchDrop = [];
			var getAllBranch = apiPath.getOneBranch+editBranchData.company.companyId;
			//Get Branch
			apiCall.getCall(getAllBranch).then(function(response4){
				
				vm.branchDrop = response4;
					
				$scope.addBranch.branchDropDown = editBranchData;
			});
				
			 vm.statesDrop=[];
			 vm.cityDrop=[];
			stateCityFactory.getState().then(function(response3){
				toaster.clear();
				vm.statesDrop = response3;
				  $scope.addBranch.stateDropDown = editBranchData.state;
				vm.cityDrop = stateCityFactory.getDefaultStateCities(editBranchData.state.stateAbb);
				$scope.addBranch.cityDropDown = editBranchData.city;
			});
			//City DropDown
			//var cityAllDropPath = apiPath.getAllCity+editBranchData.state.stateAbb;
			//apiCall.getCall(cityAllDropPath).then(function(res5){
				
				//vm.cityDrop = res5;
				//$scope.addBranch.cityDropDown = editBranchData.city;
			//});
		//});
	  }
	  else{
		  
		  console.log('Not');
			vm.statesDrop=[];
			stateCityFactory.getState().then(function(response3){
				toaster.clear();
				vm.statesDrop = response3;
				 $scope.addBranch.stateDropDown = stateCityFactory.getDefaultState($rootScope.defaultState);
				if(formdata.has('stateAbb')){
					formdata.delete('stateAbb');
				}
				formdata.append('stateAbb',$scope.addBranch.stateDropDown.stateAbb);
		
				vm.cityDrop = stateCityFactory.getDefaultStateCities($rootScope.defaultState);
				$scope.addBranch.cityDropDown = stateCityFactory.getDefaultCity($rootScope.defaultCity);
				
				if(formdata.has('cityId')){
					formdata.delete('cityId');
				}
				formdata.append('cityId',$scope.addBranch.cityDropDown.cityId);
		
			});
	  }
	}
  
  $scope.AddEditFunction();
  
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

  
  $scope.ChangeCity = function(Fname,state)
  {
		vm.cityDrop = stateCityFactory.getDefaultStateCities(state);
		
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		formdata.append(Fname,state);
  }
  
  //Changed Data When Update
  $scope.changeBranchData = function(Fname,value){
		
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		formdata.append(Fname,value);
	}
	
  //Insert Branch

  $scope.pop = function(addBranch) {
	 // console.log(addBranch.companyDropDown2);
	// formdata.append('branchName',addBranch.branchName);
	// formdata.append('address1',addBranch.fisrtAddress);
	// formdata.append('address2',addBranch.secondAddress);
	// formdata.append('pincode',addBranch.pincode);
	// formdata.append('is_display','no');
	// formdata.append('is_default','not');
	// formdata.append('stateAbb',addBranch.stateDropDown.stateAbb);
	// formdata.append('cityId',addBranch.cityDropDown.cityId);
	// formdata.append('companyId',addBranch.companyDropDown2.companyId);
	
	
	if($scope.addBranch.bId)
	{
		var editBranch = apiPath.getAllBranch+'/'+$scope.addBranch.bId;
		
		apiCall.postCall(editBranch,formdata).then(function(response5){
		
			if(apiResponse.ok == response5){
				
				toaster.pop('success', 'Title', 'Update Successfully');
				$location.path('app/Branch');
			}
			else{
				
				toaster.pop('warning', 'Opps!!', response5);
			}
		
		});
	}
	else{
		
		formdata.append('isDefault','not');
		formdata.append('isDisplay','yes');
		
		apiCall.postCall(apiPath.getAllBranch,formdata).then(function(response5){
		
			//console.log(response5);
			
			if(apiResponse.ok == response5){
				
				toaster.pop('success', 'Title', 'Insert Successfully');
				$location.path('app/Branch');
			}
			else{
				
				toaster.pop('warning', 'Opps!!', response5);
			}
			
			formdata.delete('isDefault');
			formdata.delete('isDisplay');
		
		});
		
	}
	
  };
  
	$scope.cancel = function() {
	  
		toaster.pop('info', 'Form Reset', 'Message');
		
		formdata.delete('isDefault');
			formdata.delete('isDisplay');
			
		// Delete formdata  keys
		for (var key of formdata.keys()) {
		   formdata.delete(key); 
		}
	};
  
  
}
AddBranchController.$inject = ["$rootScope","$scope","toaster","$http","apiCall","apiPath","$state","$location","apiResponse","validationMessage","getSetFactory","stateCityFactory","fetchArrayService"];