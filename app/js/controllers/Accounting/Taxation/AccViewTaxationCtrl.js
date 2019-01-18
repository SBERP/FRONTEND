
/**=========================================================
 * Module: AddInvStockCtrl.js
 * Controller for input components
 =========================================================*/

App.controller('AccViewTaxationController', AccViewTaxationController);

function AccViewTaxationController($scope,toaster,apiCall,apiPath) {
  'use strict';
  
  
   var vm = this; 
  $scope.accViewPurchase = [];
  
  //Company Dropdown data
	vm.companyDrop = [];
	
	apiCall.getCall(apiPath.getAllCompany).then(function(responseCompanyDrop){
		
		vm.companyDrop = responseCompanyDrop;
	
	});
	
  //Get All Branch on Company Change
  $scope.changeCompany = function(id)
  {
	  vm.branchDrop = [];
		var getAllBranch = apiPath.getOneBranch+id;
		//Get Branch
		apiCall.getCall(getAllBranch).then(function(response4){
			vm.branchDrop = response4;
				
		});
  }
  
  // Datepicker
  // ----------------------------------- 
	this.minStart = new Date();
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
AccViewTaxationController.$inject = ["$scope","toaster","apiCall","apiPath"];