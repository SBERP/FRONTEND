
/**=========================================================
 * Module: FormPriceListRetailSalesController.js
 * Controller for input components
 =========================================================*/

App.controller('FormPriceListRetailSalesController', FormPriceListRetailSalesController);

function FormPriceListRetailSalesController($scope,apiCall,apiPath,getSetFactory,$state,saleType) {
  'use strict';
  
  var vm = this;
  $scope.PriceRetailSales = [];
  $scope.saleType = saleType;
 
	
	//Get Company
	vm.companyDrop=[];
	apiCall.getCall(apiPath.getAllCompany).then(function(response){
		
		vm.companyDrop = response;
		
		//Set default Company
		apiCall.getDefaultCompany().then(function(response2){
			
			$scope.PriceRetailSales.companyDropDown = response2;
			
			
			
			//Auto Suggest Product Dropdown data
			vm.productDrop = [];
			
			apiCall.getCall(apiPath.getProductByCompany+response2.companyId+'/branch').then(function(responseDrop){
				
				vm.productDrop = responseDrop;
				
			});
			
		});
	
	});
	
	
	//Category Dropdown data
	vm.categoryDrop = [];
	
	apiCall.getCall(apiPath.getAllCategory).then(function(responseDrop){
		
		vm.categoryDrop = responseDrop;
	
	});
	
	//Group Dropdown data
	vm.groupDrop = [];
	
	apiCall.getCall(apiPath.getAllGroup).then(function(responseDrop){
		
		vm.groupDrop = responseDrop;
	
	});
	
	var dataSet = {'Content-Type': undefined};
	
	//Changed Data When Update
	$scope.changeStockData = function(Fname,value){
		
		dataSet[Fname] = value;
		
		var Path = apiPath.getProductByCompany+$scope.PriceRetailSales.companyDropDown.companyId;
		
		delete dataSet.companyId;
		//delete dataSet.productId;
		
		// vm.productDrop = [];
		
		// apiCall.getCallHeader(Path,dataSet).then(function(response){
			
			// vm.productDrop = response;
			
		// });
		
		delete dataSet.authenticationToken;
		//console.log(dataSet);
	}

	$scope.generate = function(){
		
		// if($scope.saleType == 'retail_sales'){
			
			// dataSet["salesType"] = "retail_sales";
		// }
		// else if($scope.saleType == 'whole_sales'){
			
			// dataSet["salesType"] = "whole_sales";
		// }
		
		dataSet["companyId"] = $scope.PriceRetailSales.companyDropDown.companyId;
		dataSet["noOfDecimalPoints"] = $scope.PriceRetailSales.companyDropDown.noOfDecimalPoints;
		
		// if($scope.PriceRetailSales.productDropDown){
			
			// dataSet["productId"] = $scope.PriceRetailSales.productDropDown.productId;
		
		// }
		
		getSetFactory.set(dataSet);
		//console.log(dataSet);
		//console.log(getSetFactory.get());
		
		
		if($scope.saleType == 'retail_sales'){
			
			$state.go("app.PriceListRetailSales");
		}
		else if($scope.saleType == 'whole_sales'){
			
			$state.go("app.PriceListWholeSales");
		}
		
		//getSetFactory.blank();
		
		
	}
  // Datepicker
  // ----------------------------------- 
	this.minStart = new Date(0,0,1);
	this.maxStart = new Date();
  this.today = function() {
    this.dt1 = new Date();
  };
  this.today();
  
  this.today2 = function() {
    this.dt2 = this.dt1;
  };
  this.today2();
	
	this.check = function()
  {
	  
	 this.dt2 = this.dt1;
  };
  
  this.clear = function () {
    this.dt1 = null;
  };

  // Disable weekend selection
  this.disabled = function(date, mode) {
	
    return false; //( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  };

  // this.toggleMin = function() {
    // this.minDate = this.minDate ? null : new Date();
  // };
  // this.toggleMin();

  this.openStart = function($event) {
	  
    $event.preventDefault();
    $event.stopPropagation();

    this.openedStart = true;
  };
  
  this.openEnd = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    this.openedEnd = true;
  };

  this.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  this.initDate = new Date('2016-15-20');
  this.formats = ['dd-MMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
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
  
  

  $scope.pop = function() {
    toaster.pop('success', 'Title', 'Message');
  };
  
  $scope.cancel = function() {
    toaster.pop('info', 'Form Reset', 'Message');
  };
  
  
}
FormPriceListRetailSalesController.$inject = ["$scope","apiCall","apiPath","getSetFactory","$state","saleType"];