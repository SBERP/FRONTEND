
/**=========================================================
 * Module: FormInputController.js
 * Controller for input components
 =========================================================*/

App.controller('AddCompanyController', AddCompanyController);

function AddCompanyController($rootScope,$scope,$filter,apiCall,apiPath,$state,toaster,apiResponse,validationMessage,validationPattern,getSetFactory,maxImageSize,stateCityFactory) {
  'use strict';
  var vm = this;
   var formdata = new FormData();
   vm.selectCompany;
   vm.selectCompany = true;
	vm.sdfg;
	$scope.addCompany = [];
	
	vm.disableDecimal = false; // disable decimal when Update
	
	//$rootScope.focusFunction('txtdata');
	
	 $scope.erpPath = $rootScope.erpPath; //Erp Path
	 
	
	/* VALIDATION */
	
	$scope.errorMessage = validationMessage; //Error Messages In Constant
	$scope.validationPattern = validationPattern; //pattern
	
	/* VALIDATION END */
	
	/* Hide/Show Company Panel */

	$scope.$on('$locationChangeStart', function (event) {
		
		$rootScope.AddCompanyModify = true;
		
	});
		
	/* End */
	
	//Edit Data On Change Company
	$scope.changeCompany = function()
	{
		
		vm.selectCompany = false;
		
	}
	
	$scope.gotoModify = function(){
		
		var id = $scope.addCompany.companyDropDown2;
		// $location.path('app/AddCompany/'+id);
		  getSetFactory.set(id);
		$scope.AddEditFunction();
		
		//$state.go('app.AddCompany');
	}
	
	//get Company
	vm.companyDrop=[];
	apiCall.getCall(apiPath.getAllCompany).then(function(response2){
		
			//console.log(response2);
			vm.companyDrop = response2;
			 if(!$scope.addCompany.cId){
				//Set default Company
				//console.log('in');
				apiCall.getDefaultCompany().then(function(response){
				
					if(!$scope.addCompany.cId){
						
						$scope.addCompany.companyDropDown2 = response;
						vm.selectCompany = false;
						
						 if($rootScope.AddCompanyModify)
						  {
							   $scope.gotoModify();
						  }
						
						
					}
					
				});
			 }
	});
		
	
	
	// apiCall.getCall(apiPath.getAllState).then(function(response3){
		// vm.statesDrop = response3;
	// });
	
	$scope.ChangeState = function(Fname,state)
	{
		//console.log(apiPath.getAllCity+state);
		var getonecity = apiPath.getAllCity+state;
		//Get City
		//apiCall.getCall(getonecity).then(function(response4){
			vm.cityDrop = stateCityFactory.getDefaultStateCities(state);
			//vm.cityDrop = response4;
			
		//});
		
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		formdata.append(Fname,state);
	}
	
	//Set Data For Edit
	
	// console.log(getSetFactory.get());
	
	// getSetFactory.blank();
	$scope.AddEditFunction = function(){
		
		toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
		
		//console.log(Object.keys(getSetFactory.get()).length);
		//console.log(getSetFactory.get());
		//console.log(Object.keys(getSetFactory.get()).length);
		//if(Object.keys(getSetFactory.get()).length){
		//if(getSetFactory.get() > 0){
		if(Object.keys(getSetFactory.get()).length > 0){
	  
		var editCompanyData = getSetFactory.get();
		getSetFactory.blank();
		
		$scope.addCompany.cId = editCompanyData.companyId;
		
		
		//Edit Branch
		var editCompany = apiPath.getAllCompany+'/'+$scope.addCompany.cId;
	
		//apiCall.getCall(editCompany).then(function(res){
		
			//console.log(editCompanyData);
			vm.sdfg = editCompanyData.companyId;
			
			$scope.addCompany.companyDropDown2 = editCompanyData;
			
			//console.log(vm.sdfg);
			$scope.addCompany.Name = editCompanyData.companyName;
			$scope.addCompany.displayName = editCompanyData.companyDisplayName;
			
			$scope.addCompany.customerCare = editCompanyData.customerCare;
			$scope.addCompany.websiteName = editCompanyData.websiteName;
			$scope.addCompany.emailId = editCompanyData.emailId;
			
			$scope.addCompany.address1 = editCompanyData.address1;
			$scope.addCompany.address2 = editCompanyData.address2;
			$scope.addCompany.pincode = editCompanyData.pincode;
			$scope.addCompany.pan = editCompanyData.pan;
			$scope.addCompany.tin = editCompanyData.tin;
			$scope.addCompany.vat = editCompanyData.vatNo;
			$scope.addCompany.serviceTax = editCompanyData.serviceTaxNo;
			//$scope.addCompany.sgst = editCompanyData.sgst;
			$scope.addCompany.cgst = editCompanyData.cgst;
			
			if(editCompanyData.cess == null){
				$scope.addCompany.cess ='';
			}
			else{
				$scope.addCompany.cess = editCompanyData.cess;
			}
			
			$scope.addCompany.currency = editCompanyData.basicCurrencySymbol;
			$scope.addCompany.formalName = editCompanyData.formalName;
			
			$scope.addCompany.decimal = editCompanyData.noOfDecimalPoints;
			vm.disableDecimal = true;
			$scope.addCompany.curSymbol = editCompanyData.currencySymbol;
			if(editCompanyData.printType == ''){
				$scope.addCompany.printType = 'print';
			}
			else{
				$scope.addCompany.printType = editCompanyData.printType;
			}
			
			
			$scope.addCompany.documentUrl = undefined;
			$scope.addCompany.documentName = undefined;
				
			if(editCompanyData.logo.documentName){
				
				$scope.addCompany.documentUrl = editCompanyData.logo.documentUrl;
				$scope.addCompany.documentName = editCompanyData.logo.documentName;
			}

			/** Get Satate City **/
				vm.statesDrop=[];
				vm.cityDrop = [];
				 
				stateCityFactory.getState().then(function(response3){
					toaster.clear();
					vm.statesDrop = response3;
					 $scope.addCompany.statesDropDown = editCompanyData.state;
					vm.cityDrop = stateCityFactory.getDefaultStateCities(editCompanyData.state.stateAbb);
					$scope.addCompany.cityDropDown = editCompanyData.city;
				});
			/** End **/
			
			//$scope.addCompany.statesDropDown = editCompanyData.state;
			// console.log('stateDone');
			
			//City DropDown
			// var cityAllDropPath = apiPath.getAllCity+editCompanyData.state.stateAbb;
			// apiCall.getCall(cityAllDropPath).then(function(res5){
				
				//vm.cityDrop = res5;
				
				//$scope.addCompany.cityDropDown = editCompanyData.city;
			//});
			
	
		
		//});
	  
	  }
	  else{
		  toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
		
		  vm.disableDecimal = false;
		  
		 //Get State/City
		vm.statesDrop=[];
		vm.cityDrop = [];
		 
		stateCityFactory.getState().then(function(response3){
			toaster.clear();
			vm.statesDrop = response3;
			 $scope.addCompany.statesDropDown = stateCityFactory.getDefaultState($rootScope.defaultState);
			if(formdata.has('stateAbb')){
			
				formdata.delete('stateAbb');
			
			}
			formdata.append('stateAbb',$scope.addCompany.statesDropDown.stateAbb);
		
			vm.cityDrop = stateCityFactory.getDefaultStateCities($rootScope.defaultState);
			$scope.addCompany.cityDropDown = stateCityFactory.getDefaultCity($rootScope.defaultCity);
			if(formdata.has('cityId')){
			
				formdata.delete('cityId');
			}
			formdata.append('cityId',$scope.addCompany.cityDropDown.cityId);
		
		});
		
		$scope.addCompany.printType = 'print';
		formdata.delete('printType');
		formdata.set('printType',$scope.addCompany.printType);
		
	  }
  
	}
	
	$scope.AddEditFunction();
	//End
  // Chosen data
  // ----------------------------------- 

  this.states = [
    'INR',
    'USD',
	'SRV'
  ];
	
	this.states2 = [
    '1',
    '2',
    '3',
    '4',
    '5'
	];
	
	this.cursymbolDrop = [
    'prefix',
	'suffix'
	];
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

  
  
 $scope.uploadFile = function(files) {
	  
		if(parseInt(files[0].size) <= maxImageSize){
			
			angular.element("img.showImg").css("display","block");
			
			//console.log('Small File');
			formdata.delete('file[]');
		
			formdata.append("file[]", files[0]);
			
			var reader = new FileReader();

			reader.onload = function(event) {
				$scope.image_source = event.target.result
				$scope.$digest();

			}
			// when the file is read it triggers the onload event above.
			reader.readAsDataURL(files[0]);
		
		}
		else{
			
			formdata.delete('file[]');
			toaster.clear();
			//toaster.pop('alert','Image Size is Too Long','');
			toaster.pop('alert', 'Opps!!', 'Image Size is Too Long');
			
			angular.element("input[type='file']").val(null);
			angular.element("img.showImg").css("display","none");
			$scope.$digest();
		}
	};
	
	$scope.changeCompanyData = function(Fname,value){
		//console.log(Fname+'..'+value);
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		formdata.append(Fname,value);
		
		if(Fname == 'companyName'){
			
			if(formdata.has('companyDisplayName'))
			{
				formdata.delete('companyDisplayName');
			}
			formdata.append('companyDisplayName',value);
		
		}
	}
	function dataURLtoFile(dataurl, filename) {
	    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
	        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
	    while(n--){
	        u8arr[n] = bstr.charCodeAt(n);
	    }
	    return new File([u8arr], filename, {type:mime});
	}

  $scope.addCompanyForm = function(addCompany)
  {
	
	// formdata.append('companyName',addCompany.Name);
	// formdata.append('companyDisplayName',addCompany.displayName);
	// formdata.append('address1',addCompany.address1);
	// formdata.append('address2',addCompany.address2);
	// formdata.append('cityId',addCompany.cityDropDown.cityId);
	// formdata.append('stateAbb',addCompany.statesDropDown.stateAbb);
	// formdata.append('pincode',addCompany.pincode);
	// formdata.append('pan',addCompany.pan);
	// formdata.append('tin',addCompany.tin);
	// formdata.append('vatNo',addCompany.vat);
	// formdata.append('serviceTaxNo',addCompany.serviceTax);
	// formdata.append('basicCurrencySymbol',addCompany.currency);
	// formdata.append('formalName',addCompany.formalName);
	// formdata.append('noOfDecimalPoints',addCompany.decimal);
	// formdata.append('currencySymbol',addCompany.curSymbol);
	// formdata.append('isDefault','not');
	// formdata.append('isDisplay','no');
	
	
	if($scope.addCompany.cId)
	{
		var editCompany2 = apiPath.getAllCompany+'/'+$scope.addCompany.cId;
		
		apiCall.postCall(editCompany2,formdata).then(function(response5){
		
			
			if(apiResponse.ok == response5){
				
				toaster.pop('success', 'Title', 'Update Successfully');
				//$location.path('app/Company');
				$state.go('app.Company');
			}
			else{
				
				toaster.pop('warning', 'Opps!!', response5);
			}
		
		});
	}
	else
	{
		// formdata.append('isDefault','not');
			// formdata.append('isDisplay','no');
			
		apiCall.postCall(apiPath.getAllCompany,formdata).then(function(response5){
		
			//console.log(response5);
			if(apiResponse.ok == response5){
				
				toaster.pop('success', 'Title', 'Insert Successfully');
				//$location.path('app/Company');
				$state.go('app.Company');
			}
			else{
				
				toaster.pop('warning', 'Opps!!', response5);
			}
			
			formdata.delete('isDefault');
			formdata.delete('isDisplay');
		});
		
	}
	vm.disableDecimal = false;
  }
  
	$scope.cancel = function(){
	
		$scope.addCompany = [];
		 
		 vm.disableDecimal = false;
		 
		angular.element("input[type='file']").val(null);
		
		formdata.delete("file[]");
		 
		formdata.delete('isDefault');
		formdata.delete('isDisplay');
		 // Delete formdata  keys
		for (var key of formdata.keys()) {
		   formdata.delete(key); 
		}
		 //$scope.formCompany.$setPristine();
	}
  
}
AddCompanyController.$inject = ["$rootScope","$scope","$filter","apiCall","apiPath","$state","toaster","apiResponse","validationMessage","validationPattern","getSetFactory","maxImageSize","stateCityFactory"];