
/**=========================================================
 * Module: AccPaymentController.js
 * Controller for input components
 =========================================================*/

App.controller('AccSpecialJrnlController', AccSpecialJrnlController);

function AccSpecialJrnlController($rootScope,$scope,apiCall,apiPath,getSetFactory,$modal,$log,toaster,apiResponse,validationMessage) {
  'use strict';
  
   var vm = this;
   var formdata  = new FormData();
   $scope.addAccJrnl = [];
   $scope.addAccJrnl.jfid;
   
    var dateFormats = $rootScope.dateFormats; //Date Format
   
	$scope.totalDebit; // sum of Debit Amount
	$scope.totalCredit;  // sum of Credit Amount
  
	$scope.disableCompany = false;
	var Modalopened = false;
	
	 $scope.noOfDecimalPoints; // decimalPoints For Price,Tax Etc.....
	 
	 
   $scope.changeInArray = false;
   vm.AccSpecialJrnlTable = []; //Table Array
   vm.multiCurrentBalance = [];
   
   //Auto suggest Client Name
	vm.clientNameDrop=[];
	
   //Company Drop Down 
   vm.companyDrop = [];
	
	apiCall.getCall(apiPath.getAllCompany).then(function(responseCompanyDrop){
		
		vm.companyDrop = responseCompanyDrop;
	
	});
	
	$scope.defaultCompany = function(){
		
		//Set default Company
		apiCall.getDefaultCompany().then(function(response){
			
			toaster.clear();
			toaster.pop('wait', 'Please Wait', 'Data Loading....',60000);
		
			$scope.addAccJrnl.companyDropDown = response;
			
			formdata.append('companyId',response.companyId);
			
			$scope.noOfDecimalPoints = parseInt(response.noOfDecimalPoints);

			//Auto suggest Client Name
			var jsuggestPath = apiPath.getLedgerJrnl+response.companyId;
			var headerData = {'Content-Type': undefined};
			
			apiCall.getCallHeader(jsuggestPath,headerData).then(function(response3){
				
				vm.clientNameDrop = response3;
				toaster.clear();
			});
		
		});
		
	}
	/* VALIDATION */
	
	$scope.errorMessage = validationMessage; //Error Messages In Constant
	
	/* VALIDATION END */
	
	 // Datepicker
  // ----------------------------------- 
	this.minStart = new Date();
	this.maxStart = new Date();
  this.today = function() {
    this.dt1 = new Date();
  };
  this.today();

  this.clear = function () {
    this.dt1 = null;
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
  
  this.openStart = function($event) {
	  
    $event.preventDefault();
    $event.stopPropagation();

    this.openedStart = true;
  };

  this.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  this.initDate = new Date('2016-15-20');
  // this.formats = ['dd-MMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  this.format = dateFormats;
  
	//Date Picker End
	

	//if(Object.keys(getSetFactory.get()).length){
	if(getSetFactory.get() > 0){
		
		$scope.addAccJrnl.getSetJrnlId = getSetFactory.get();
		//$scope.addAccJrnl.jfid = $scope.addAccJrnl.getSetJrnlId;
		//console.log($scope.addAccJrnl.getSetJrnlId);
		getSetFactory.blank();
		
		var getOneJrnlPath = apiPath.getOneJrnl+parseInt($scope.addAccJrnl.getSetJrnlId);
	  
		apiCall.getCall(getOneJrnlPath).then(function(response){
			
			//console.log(response);
			//Set JFID
			$scope.addAccJrnl.jfid = response[0].jfId;
			
			$scope.addAccJrnl.companyDropDown = response[0].company;
			
			//Disable Company
			$scope.disableCompany = true;
			
			//set Decimal Number
			
				$scope.noOfDecimalPoints = parseInt(response[0].company.noOfDecimalPoints);
			
			//Auto suggest Client Name
			var jsuggestPath = apiPath.getLedgerJrnl+response[0].company.companyId;
			var headerData = {'Content-Type': undefined};
			
			apiCall.getCallHeader(jsuggestPath,headerData).then(function(response3){
				
				vm.clientNameDrop = response3;
			
			});
			
			//Set Date
			var getResdate = response[0].entryDate;
			var splitedate = getResdate.split("-").reverse().join("-");
			vm.dt1 = new Date(splitedate);
			vm.minStart = new Date(splitedate);
			vm.maxStart = new Date(splitedate);
			
			//Set Table Array
			for(var i=0;i<response.length;i++){
				
				 var tempData = {};
				tempData.amountType = response[i].amountType;
				tempData.ledgerId= response[i].ledger.ledgerId;
				tempData.ledgerName = response[i].ledger.ledgerName;
				tempData.amount = parseFloat(response[i].amount);
				
				vm.AccSpecialJrnlTable.push(tempData);
				
				//Set Current Balance 
				var tempBalanceData = {};
				
				tempBalanceData.currentBalance = response[i].ledger.currentBalance;
				tempBalanceData.amountType = response[i].ledger.currentBalanceType;
				
				vm.multiCurrentBalance.push(tempBalanceData);
			}
			//console.log(vm.AccSpecialJrnlTable);
		});
		
	}
	else{
		
		apiCall.getCall(apiPath.getJrnlNext).then(function(response){
		
			$scope.addAccJrnl.jfid = response.nextValue;
			
		});
		
		
		$scope.defaultCompany();
		
		vm.AccSpecialJrnlTable = [{"amountType":"debit","ledgerId":"","ledgerName":"","amount":""},{"amountType":"debit","ledgerId":"","ledgerName":"","amount":""}];
		
		vm.multiCurrentBalance = [{"currentBalance":"","amountType":""},{"currentBalance":"","amountType":""}];
	}
  
  
  /* Table */
	
	$scope.addRow = function(index){
		 
		  var plusOne = index+1;
		  
		 var data = {};
		data.amountType ='debit';
		data.ledgerId='';
		data.ledgerName ='';
		data.amount ='';
		//vm.AccSpecialJrnlTable.push(data);
		vm.AccSpecialJrnlTable.splice(plusOne, 0, data);
		
		var balance = {};
		balance.currentBalance = '';
		balance.amountType = '';
		//vm.multiCurrentBalance.push(balance);
		vm.multiCurrentBalance.splice(plusOne, 0, balance);
		
		$scope.changeInArray = true;

    };
	
	$scope.settabledata = function(item,index)
	{
		vm.multiCurrentBalance[index].currentBalance = item.currentBalance;
		vm.multiCurrentBalance[index].amountType = item.currentBalanceType;
			
		vm.AccSpecialJrnlTable[index].ledgerId = item.ledgerId;
		
		//console.log(item);
		//console.log(vm.AccSpecialJrnlTable);
		$scope.changeInArray = true;
	}
	
	$scope.removeRow = function (idx) {
		
		vm.AccSpecialJrnlTable.splice(idx, 1);
		vm.multiCurrentBalance.splice(idx, 1);
		$scope.changeInArray = true;
	};
	
  /* End */
	
	
	
	//Set JSuggest Data When Company
	$scope.changeCompany = function(Fname,value){
		
		toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Data Loading....',60000);
			
		$scope.noOfDecimalPoints = parseInt(value.noOfDecimalPoints);
		
		//Auto suggest Client Name
		var jsuggestPath = apiPath.getLedgerJrnl+value.companyId;
		var headerData = {'Content-Type': undefined};
		
		apiCall.getCallHeader(jsuggestPath,headerData).then(function(response3){
			
			vm.clientNameDrop = response3;
			toaster.clear();
		});
		
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		formdata.append(Fname,value.companyId);
		
		vm.AccSpecialJrnlTable = [{"amountType":"debit","ledgerId":"","ledgerName":"","amount":""},{"amountType":"debit","ledgerId":"","ledgerName":"","amount":""}];
		
		vm.multiCurrentBalance = [{"currentBalance":"","amountType":""},{"currentBalance":"","amountType":""}];
		
	}
	
	 //Changed Data When Update
	$scope.changeSpecialJrnlData = function(Fname,value){
		
		//console.log(Fname+'..'+value);
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		formdata.append(Fname,value);
	}
	
	//Changed date
	// $scope.changeSpecialJrnlDate = function(Fname,value){
		
		// if(formdata.get(Fname))
		// {
			// formdata.delete(Fname);
		// }
		// var  date = new Date(vm.dt1);
		// var fdate  = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
		// console.log(Fname+'..'+fdate);
		// formdata.append(Fname,fdate);
	// }
	
	$scope.changeSpecialJrnlTable = function(){
		
		$scope.changeInArray = true;
		//console.log($scope.changeInArray);
	}
	
	
  $scope.pop = function()
  {
	  
	toaster.clear();
	toaster.pop('wait', 'Please Wait', 'Data Loading....',60000);
			
	 if($scope.totalDebit != $scope.totalCredit){
		 
		toaster.clear();
		toaster.pop('alert', 'Opps!!', 'Credit/Debit Amount is Not Equal');
		return false;
	}
	
	
	var  date = new Date(vm.dt1);
	var fdate  = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();

	if(formdata.has('entryDate'))
	{
		formdata.delete('entryDate');
	}
	formdata.append('entryDate',fdate);

	if($scope.addAccJrnl.getSetJrnlId){
		
		
		var SpecialJtnlPath = apiPath.postJrnl+'/'+$scope.addAccJrnl.jfid;
		
		if($scope.changeInArray){
			
		
			var json = angular.copy(vm.AccSpecialJrnlTable);
			 
			for(var i=0;i<json.length;i++){
				 
				angular.forEach(json[i], function (value,key) {
					
					formdata.append('data['+i+']['+key+']',value);
				});
				
			}
			
		}
		
	}
	else{
		
		var SpecialJtnlPath = apiPath.postJrnl;
		
		//console.log(SpecialJtnlPath);
		
		var json = angular.copy(vm.AccSpecialJrnlTable);
		 
		for(var i=0;i<json.length;i++){
			 
			angular.forEach(json[i], function (value,key) {
				
				formdata.append('data['+i+']['+key+']',value);
			});
			
		}
		
		$scope.changeInArray = true; // For Delete Array In FormData After Success
		
		
	}
	
		apiCall.getCall(apiPath.getJrnlNext).then(function(response){
			
			if(!$scope.addAccJrnl.getSetJrnlId){
				
				$scope.addAccJrnl.jfid = response.nextValue;
				
				if(formdata.has('jfId')){
					
					formdata.delete('jfId');
					
				}
				formdata.append('jfId',$scope.addAccJrnl.jfid);
			}
			
			//Special Journal Insert Update Call
			apiCall.postCall(SpecialJtnlPath,formdata).then(function(response){
				
				//console.log(response);
				
				toaster.clear();
				
				//Display Toaster Message
				if($scope.addAccJrnl.getSetJrnlId){
					
					if(apiResponse.ok == response){
						
						toaster.pop('success', 'Title', 'Update Successfully');
						$scope.disableCompany = false;
					}
					else{
						
						$scope.deleteArray();
						toaster.pop('warning', 'Opps!!', response);
					}
					
				}
				else{
					
					if(apiResponse.ok == response){
						
						toaster.pop('success', 'Title', 'Insert Successfully');
					}
					else{
						
						formdata.delete('jfId');
						$scope.deleteArray();
						toaster.pop('warning', 'Opps!!', response);
					}
					
				}
				
				if(apiResponse.ok == response){
						
					vm.dt1 = new Date();
					vm.minStart = new Date();
					vm.maxStart = new Date();
					
					if($scope.changeInArray){
						
						var json = angular.copy(vm.AccSpecialJrnlTable);
						
						for(var i=0;i<json.length;i++){
							 
							angular.forEach(json[i], function (value,key) {
								
								formdata.delete('data['+i+']['+key+']',value);
							});
							
						}
						
						$scope.changeInArray = false;
						
					}
					
					// Delete formdata  keys
					for (var key of formdata.keys()) {
					   formdata.delete(key); 
					}
				
					$scope.addAccJrnl = [];
					
					vm.AccSpecialJrnlTable = [{"amountType":"debit","ledgerId":"","ledgerName":"","amount":""},{"amountType":"debit","ledgerId":"","ledgerName":"","amount":""}];
					
					vm.multiCurrentBalance = [{"currentBalance":"","amountType":""},{"currentBalance":"","amountType":""}];
					
					$scope.defaultCompany();
					
					 apiCall.getCall(apiPath.getJrnlNext).then(function(response){
					
						$scope.addAccJrnl.jfid = response.nextValue;
				
					});
				}
				
				
			
			});
		});
	
  }
  
  $scope.cancel = function(){
	  
		toaster.clear();
	  
		vm.dt1 = new Date();
		vm.minStart = new Date();
		vm.maxStart = new Date();
		
		$scope.disableCompany = false;
		
		if($scope.changeInArray){
			
			var json = angular.copy(vm.AccSpecialJrnlTable);
			
			//console.log('Delete Array');
			for(var i=0;i<json.length;i++){
				 
				angular.forEach(json[i], function (value,key) {
					
					formdata.delete('data['+i+']['+key+']',value);
				});
				
			}
			
			$scope.changeInArray = false;
			
		}
		
		// Delete formdata  keys
		for (var key of formdata.keys()) {
		   formdata.delete(key); 
		}
		
		$scope.addAccJrnl = [];
		
		vm.AccSpecialJrnlTable = [{"amountType":"debit","ledgerId":"","ledgerName":"","amount":""},{"amountType":"debit","ledgerId":"","ledgerName":"","amount":""}];
		
		vm.multiCurrentBalance = [{"currentBalance":"","amountType":""},{"currentBalance":"","amountType":""}];
		
		//Set default Company
		// apiCall.getDefaultCompany().then(function(response){
		
			// $scope.addAccJrnl.companyDropDown = response;

			//Auto suggest Client Name
			// var jsuggestPath = apiPath.getLedgerJrnl+response.companyId;
			// var headerData = {'Content-Type': undefined};
			
			// apiCall.getCallHeader(jsuggestPath,headerData).then(function(response3){
				
				// vm.clientNameDrop = response3;
			
			// });
		
		// });
		
		$scope.defaultCompany();
		
		 apiCall.getCall(apiPath.getJrnlNext).then(function(response){
		
			$scope.addAccJrnl.jfid = response.nextValue;
	
		});
  }
 

	$scope.deleteArray = function(){
		
		var json = angular.copy(vm.AccSpecialJrnlTable);
			
			//console.log('Delete Array');
			for(var i=0;i<json.length;i++){
				 
				angular.forEach(json[i], function (value,key) {
					
					formdata.delete('data['+i+']['+key+']',value);
				});
				
			}
	}
 
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
  
  /**
  *
  Ledger Model Start
  *
  **/
	$scope.openLedger = function (size,index) {

		
		if (Modalopened) return;
		
		if($scope.addAccJrnl.companyDropDown){

			var modalInstance = $modal.open({
			  templateUrl: 'app/views/PopupModal/Accounting/ledgerModal.html',
			  controller: AccLedgerModalController,
			  size: size,
				resolve:{
					ledgerIndex: function(){
						return index;
					},
					companyId: function(){
						return $scope.addAccJrnl.companyDropDown;
					}
				}
			});
			
			Modalopened = true;
			
			var state = $('#modal-state');
			
			modalInstance.result.then(function (data) {
			  
				//Auto suggest Client Name
				var jsuggestPath = apiPath.getLedgerJrnl+data.companyId;
				var headerData = {'Content-Type': undefined};
				
				apiCall.getCallHeader(jsuggestPath,headerData).then(function(response3){
					
					vm.clientNameDrop = response3;
				
				});
				
				//console.log(data);
				
				var headerSearch = {'Content-Type': undefined,'ledgerName':data.ledgerName};
				apiCall.getCallHeader(apiPath.getLedgerJrnl+data.companyId,headerSearch).then(function(response){
					
					//console.log(response);
					vm.AccSpecialJrnlTable[data.index].ledgerName = response.ledgerName;
					vm.AccSpecialJrnlTable[data.index].ledgerId = response.ledgerId;
					
					vm.multiCurrentBalance[data.index].currentBalance = response.currentBalance;
					vm.multiCurrentBalance[data.index].amountType = response.currentBalanceType;
			
					
				});
				
				Modalopened = false;
				
			}, function () {
				
				Modalopened = false;
				
			});
		}
		else{
			alert('Please Select Company');
		}
  };

  /**
  *
  Ledger Model End
  *
  **/
}
AccSpecialJrnlController.$inject = ["$rootScope","$scope","apiCall","apiPath","getSetFactory","$modal", "$log","toaster","apiResponse","validationMessage"];