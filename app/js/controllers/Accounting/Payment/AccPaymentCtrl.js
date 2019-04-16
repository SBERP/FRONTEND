
/**=========================================================
 * Module: AccPaymentController.js
 * Controller for input components
 =========================================================*/

App.controller('AccPaymentController', AccPaymentController);

function AccPaymentController($rootScope,$scope,apiCall,apiPath,toaster,$modal,apiResponse,validationMessage,getSetFactory) {
  'use strict';
  
  var vm = this;
  $scope.accPayment = [];
  var formdata = new FormData();
  
  
  $scope.accPayment.totalAmount;
  $scope.accPayment.jfid; // JFID
  
   var dateFormats = $rootScope.dateFormats; //Date Format
   
  $scope.noOfDecimalPoints;
	/* VALIDATION */
	
	$scope.errorMessage = validationMessage; //Error Messages In Constant
	
	/* VALIDATION END */
  
  $scope.disableCompany = false;
  var Modalopened = false;
  
  var account = {};
  account.amountType = 'credit';
  
  vm.accountCurrentBalance = {};
  
  vm.AccPaymentTable = [];
   vm.multiCurrentBalance = []; // Current Balance Array For Table
   
  //Auto suggest Account
	vm.accountDrop=[];
	var headerCr = {'Content-Type': undefined,'ledgerGroup':[9,12]};
	 
	vm.tableNameDrop=[];
	var headerDr = {'Content-Type': undefined,'ledgerGroup':[31]};
  
 // console.log($rootScope.defaultCompany());
 
	// Company data
  // ----------------------------------- 
	vm.companyDrop = [];
	
	apiCall.getCall(apiPath.getAllCompany).then(function(responseCompanyDrop){
		
		vm.companyDrop = responseCompanyDrop;
	
	});
	
	$scope.defaultCompany = function(){
		
	
		//Set default Company
		apiCall.getDefaultCompany().then(function(response){
		
			$scope.accPayment.companyDropDown = response;
			
			formdata.append('companyId',response.companyId);
			
			$scope.noOfDecimalPoints = response.noOfDecimalPoints;
			
			//Auto suggest Account
			vm.accountDrop=[];
			vm.tableNameDrop=[];
			
			//Auto suggest Client Name For Debit
			var jsuggestPath = apiPath.getLedgerJrnl+response.companyId;
			
			apiCall.getCallHeader(jsuggestPath,headerCr).then(function(response3){
				
				for(var t=0;t<response3.length;t++){
					
					for(var k=0;k<response3[t].length;k++){
						
						vm.accountDrop.push(response3[t][k]);
					}
					
				}
			
			});
			
			apiCall.getCallHeader(jsuggestPath,headerDr).then(function(response3){
				
				for(var t=0;t<response3.length;t++){
					
					for(var k=0;k<response3[t].length;k++){
						
						vm.tableNameDrop.push(response3[t][k]);
					}
					
				}
			
			});
		
		});
	}

  
  
	if(getSetFactory.get() > 0){
		
		$scope.accPayment.getSetJrnlId = getSetFactory.get();
		getSetFactory.blank();
		
		console.log($scope.accPayment.getSetJrnlId);
		
		var getOneJrnlPath = apiPath.getOneJrnl+$scope.accPayment.getSetJrnlId;
		//console.log(getOneJrnlPath);
		
		var headerDataEdit = {'Content-Type': undefined};
	   
			
		apiCall.getCallHeader(getOneJrnlPath,headerDataEdit).then(function(response){
			
			console.log(response);
			
			$scope.accPayment.jfid = response[0].jfId;
			$scope.accPayment.companyDropDown = response[0].company;
			
			//Disable Company
			$scope.disableCompany = true;
			
			//set Decimal Number
			
			$scope.noOfDecimalPoints = parseInt(response[0].company.noOfDecimalPoints);
			
			//Auto suggest Account
			vm.accountDrop=[];
			vm.tableNameDrop=[];
			
			//Auto suggest Client Name For Debit
			var jsuggestPath = apiPath.getLedgerJrnl+response[0].company.companyId;
			
			apiCall.getCallHeader(jsuggestPath,headerCr).then(function(response3){
				
				for(var t=0;t<response3.length;t++){
					
					for(var k=0;k<response3[t].length;k++){
						
						vm.accountDrop.push(response3[t][k]);
					}
					
				}
			
			});
			
			apiCall.getCallHeader(jsuggestPath,headerDr).then(function(response3){
				
				for(var t=0;t<response3.length;t++){
					
					for(var k=0;k<response3[t].length;k++){
						
						vm.tableNameDrop.push(response3[t][k]);
					}
					
				}
			
			});
			
			//Set Date
			var getResdate = response[0].entryDate;
			var splitedate = getResdate.split("-").reverse().join("-");
			vm.dt1 = new Date(splitedate);
			vm.minStart = new Date(splitedate);
			vm.maxStart = new Date(splitedate);
			
			//Set Table Array
			for(var i=0;i<response.length;i++){
				
				if(response[i].amountType == "credit"){
					
					account.ledgerId = response[i].ledger.ledgerId;
					account.ledgerName = response[i].ledger.ledgerName;
					
					$scope.accPayment.account = response[i].ledger.ledgerName;
					
					vm.accountCurrentBalance.currentBalance = response[i].ledger.currentBalance;
					vm.accountCurrentBalance.amountType= response[i].ledger.currentBalanceType;
				}
				else{
					
					 var tempData = {};
					tempData.amountType = response[i].amountType;
					tempData.ledgerId= response[i].ledger.ledgerId;
					tempData.ledgerName = response[i].ledger.ledgerName;
					tempData.amount = parseFloat(response[i].amount);
					
					vm.AccPaymentTable.push(tempData);
					
					//Set Current Balance 
					var tempBalanceData = {};
					
					tempBalanceData.currentBalance = response[i].ledger.currentBalance;
					tempBalanceData.amountType = response[i].ledger.currentBalanceType;
				
					vm.multiCurrentBalance.push(tempBalanceData);
					
				}
				
				
				
			}
			
		});
		
	}
	else{
		
		console.log("Insert");
		vm.AccPaymentTable = [];
		vm.AccPaymentTable = [{"ledgerId":"","ledgerName":"","amount":"","amountType":"debit"}];
		
		 vm.multiCurrentBalance = []; // Current Balance Array For Table
		vm.multiCurrentBalance = [{"currentBalance":"","amountType":""}];
  
		$scope.defaultCompany();
	
	}
	
	$scope.addRow = function(index){
		var plusOne = index+1;
		
		var data = {};	
		data.ledgerId='';
		data.ledgerName ='';
		data.amount ='';
		data.amountType = 'debit';
		//vm.AccPaymentTable.push(data);
		vm.AccPaymentTable.splice(plusOne, 0, data);
		
		var balance = {};
		balance.currentBalance = '';
		balance.amountType = '';
		//vm.multiCurrentBalance.push(balance);
		vm.multiCurrentBalance.splice(plusOne, 0, balance);
		
    };
	
	$scope.settabledata = function(item,index)
	{
		vm.AccPaymentTable[index].ledgerId = item.ledgerId;
		
		vm.multiCurrentBalance[index].currentBalance = item.currentBalance;
		vm.multiCurrentBalance[index].amountType = item.currentBalanceType;
		
		//console.log(vm.AccPaymentTable);
		$scope.changeJrnlArray = true;
		
	}
	
	$scope.removeRow = function (idx) {
		vm.AccPaymentTable.splice(idx, 1);
		vm.multiCurrentBalance.splice(idx, 1);
	};
	
  /* End */
  
	$scope.setAccPayment = function(item) {
		
		//console.log(item);
		account.ledgerId = item.ledgerId;
		account.ledgerName = item.ledgerName;
		
		vm.accountCurrentBalance.currentBalance = item.currentBalance;
		vm.accountCurrentBalance.amountType= item.currentBalanceType;
		
		$scope.changeJrnlArray = true;
		
  	}
	
	//Changed date
	$scope.changePaymentDate = function(Fname){
		
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		var  date = new Date(vm.dt1);
		var fdate  = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
		//console.log(Fname+'..'+fdate);
		formdata.append(Fname,fdate);
	}
	
	//Set JSuggest Data When Company
	$scope.changeCompany = function(Fname,value){
		
		
		$scope.noOfDecimalPoints = value.noOfDecimalPoints;
		
		//Auto suggest Account
		vm.accountDrop=[];
		vm.tableNameDrop=[];
		
		//Auto suggest Client Name For Debit
		var jsuggestPath = apiPath.getLedgerJrnl+value.companyId;
		
		apiCall.getCallHeader(jsuggestPath,headerCr).then(function(response3){
			
			for(var t=0;t<response3.length;t++){
				
				for(var k=0;k<response3[t].length;k++){
					
					vm.accountDrop.push(response3[t][k]);
				}
				
			}
		
		});
		
		apiCall.getCallHeader(jsuggestPath,headerDr).then(function(response3){
			
			for(var t=0;t<response3.length;t++){
				
				for(var k=0;k<response3[t].length;k++){
					
					vm.tableNameDrop.push(response3[t][k]);
				}
				
			}
		
		});
		
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		formdata.append(Fname,value.companyId);
		
		vm.AccPaymentTable = [{"ledgerId":"","ledgerName":"","amount":"","amountType":"debit"}];
		vm.multiCurrentBalance = [{"currentBalance":"","amountType":""}];
		
		account = {};
		account.amountType = 'credit';
		$scope.accPayment.account = '';
		 vm.accountCurrentBalance = {};
	}
	
	//Change in Journal Table
	$scope.changeJrnlTable = function(){
		
		$scope.changeJrnlArray = true;
		
	}
	
	//Total For Array Table
	$scope.getTotal = function(){
		
		var total = 0;
		for(var i = 0; i < vm.AccPaymentTable.length; i++){
			
			var product = vm.AccPaymentTable[i];
			total += parseFloat(product.amount);
			
		}
		return total;
	}
	
	$scope.jointJournalArray = function(){
		
		vm.tempAccPaymentTable = [];
		account.amount = $scope.accPayment.totalAmount;
		
		vm.tempAccPaymentTable.push(account);
		
		var cnt = vm.AccPaymentTable.length;
		for(var i=0;i<cnt;i++){
			vm.tempAccPaymentTable.push(vm.AccPaymentTable[i]);
		}
		
		//console.log(vm.tempAccPaymentTable);
		
		var json = angular.copy(vm.tempAccPaymentTable);
			 
		for(var j=0;j<json.length;j++){
			 
			angular.forEach(json[j], function (value,key) {
				
				formdata.append('data['+j+']['+key+']',value);
				
			});
			
		}
				
	}
	
	$scope.addUpAccPayment = function()
	{
			
		toaster.clear();
		
		if($scope.accPayment.getSetJrnlId){
			
			toaster.pop('wait', 'Please Wait', 'Data Updating....',60000);
			
			var accPaymentPath = apiPath.postJrnl+'/'+$scope.accPayment.jfid;
			
			if($scope.changeJrnlArray){
				
				$scope.jointJournalArray();
			}
			
			
		}
		else{
			
			toaster.pop('wait', 'Please Wait', 'Data Inserting....',60000);
			
			$scope.jointJournalArray();
			
			if(!formdata.has('companyId')){
			
				formdata.append('companyId',$scope.accPayment.companyDropDown.companyId);
			}
			
			var  date = new Date(vm.dt1);
			var fdate  = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
			//console.log(fdate);
			
			if(formdata.has('entryDate')){
				
				formdata.delete('entryDate');
			}
			formdata.append('entryDate',fdate);
		
			var accPaymentPath = apiPath.postJrnl;
		
		}
		
		var headerData = {'Content-Type': undefined,'type':'payment'};
		
		
		apiCall.getCall(apiPath.getJrnlNext).then(function(response){
			
			
			if(!$scope.accPayment.getSetJrnlId){
				
				$scope.accPayment.jfid = response.nextValue;
				
				if(formdata.has('jfId')){
					
					formdata.delete('jfId');
					
				}
				
				formdata.append('jfId',$scope.accPayment.jfid);
				
			}
			
			apiCall.postCallHeader(accPaymentPath,headerData,formdata).then(function(data){
					
				toaster.clear();
				
				//console.log(data);
				if(apiResponse.ok == data){
					
					vm.dt1 = new Date();
					vm.minStart = new Date();
					vm.maxStart = new Date();
				
					if($scope.changeJrnlArray){
						
						var jsonDel = angular.copy(vm.tempAccPaymentTable);
						 
						for(var j=0;j<jsonDel.length;j++){
							 
							angular.forEach(jsonDel[j], function (value,key) {
								
								formdata.delete('data['+j+']['+key+']',value);
								
							});
							
						}
					}
					$scope.changeJrnlArray = false;
					
					// Delete formdata  keys
					for (var key of formdata.keys()) {
					   formdata.delete(key); 
					}
					
					if($scope.accPayment.getSetJrnlId){
						
						toaster.pop('success', 'Title', 'Update Successfull');
						$scope.disableCompany = false;
						
					}
					else{
						toaster.pop('success', 'Title', 'Insert Successfull');
					}
					
					$scope.accPayment = [];
					$scope.accPayment.totalAmount;
					vm.tableNameDrop = [];
					vm.accountDrop = [];
					var account = {};
					account.amountType = 'credit';
		  
					
					vm.AccPaymentTable = [{"ledgerId":"","ledgerName":"","amount":"","amountType":"debit"}];
					vm.multiCurrentBalance = [{"currentBalance":"","amountType":""}];
					
					
					$scope.defaultCompany();
					
				}
				else{
					
					toaster.pop('warning', 'Opps!!', data);
					
					if($scope.changeJrnlArray){
						
						var json = angular.copy(vm.tempAccPaymentTable);
				 
						for(var j=0;j<json.length;j++){
							 
							angular.forEach(json[j], function (value,key) {
								
								formdata.append('data['+j+']['+key+']',value);
								
							});
							
						}
					}
					
					// Delete formdata  keys
					for (var key of formdata.keys()) {
					   formdata.delete(key); 
					}
				}
				
			});
		});
		
	}
	
	$scope.cancel = function(){
		
		vm.dt1 = new Date();
		vm.minStart = new Date();
		vm.maxStart = new Date();

		$scope.disableCompany = false;
		
		// var jsonDel = angular.copy(vm.tempAccPaymentTable);
		 
		// for(var j=0;j<jsonDel.length;j++){
			 
			// angular.forEach(jsonDel[j], function (value,key) {
				
				// formdata.delete('data['+j+']['+key+']',value);
				
			// });
			
		// }
		
		// Delete formdata  keys
		for (var key of formdata.keys()) {
		   formdata.delete(key); 
		}
		
		$scope.accPayment = [];
		$scope.accPayment.totalAmount;
		vm.tableNameDrop = [];
		vm.accountDrop = [];
		var account = {};
		account.amountType = 'credit';
		
		vm.AccPaymentTable = [{"ledgerId":"","ledgerName":"","amount":"","amountType":"debit"}];
		vm.multiCurrentBalance = [{"currentBalance":"","amountType":""}];
		
		
		$scope.defaultCompany();
		
	}
	
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

	if($scope.accPayment.companyDropDown){
		
		var modalInstance = $modal.open({
		  templateUrl: 'app/views/PopupModal/Accounting/ledgerModal.html',
		  controller: AccLedgerModalController,
		  size: size,
		  resolve:{
			  ledgerIndex: function(){
				  return index;
			  },
			  companyId: function(){
				return $scope.accPayment.companyDropDown;
			  }
		  }
		});
		
		Modalopened = true;
		
		var state = $('#modal-state');
		modalInstance.result.then(function (data) {
		  
			
			
			//Auto suggest Client Name For Debit
			var jsuggestPath = apiPath.getLedgerJrnl+$scope.accPayment.companyDropDown.companyId;
			
			vm.tableNameDrop =[];
			
			apiCall.getCallHeader(jsuggestPath,headerDr).then(function(response3){
				
				for(var t=0;t<response3.length;t++){
					
					for(var k=0;k<response3[t].length;k++){
						
						vm.tableNameDrop.push(response3[t][k]);
					}
					
				}
			
			});
			
			vm.accountDrop = [];
			
			apiCall.getCallHeader(jsuggestPath,headerCr).then(function(response3){
				
				for(var t2=0;t2<response3.length;t2++){
					
					for(var k2=0;k2<response3[t2].length;k2++){
						
						vm.accountDrop.push(response3[t2][k2]);
					}
					
				}
				
				
			});
			
			//Set Last Inserted Ledger
			//console.log(data);
			
			
			var headerSearch = {'Content-Type': undefined,'ledgerName':data.ledgerName};
			apiCall.getCallHeader(apiPath.getLedgerJrnl+data.companyId,headerSearch).then(function(response){
				
				//console.log(response);
				
				if(data.index == null){
					
					account.ledgerId = response.ledgerId;
					account.ledgerName = response.ledgerName;
					
					$scope.accPayment.account = response.ledgerName;
					
					vm.accountCurrentBalance.currentBalance = response.currentBalance;
					vm.accountCurrentBalance.amountType= response.currentBalanceType;
					
				}
				else{
					
					vm.AccPaymentTable[data.index].ledgerName = response.ledgerName;
					vm.AccPaymentTable[data.index].ledgerId = response.ledgerId;
					
					vm.multiCurrentBalance[data.index].currentBalance = response.currentBalance;
					vm.multiCurrentBalance[data.index].amountType = response.currentBalanceType;
					
				}
		
				
			});
				
			Modalopened = false;
		
		}, function (data) {
			
			Modalopened = false;
			//alert(data);
		  
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
AccPaymentController.$inject = ["$rootScope","$scope","apiCall","apiPath","toaster","$modal","apiResponse","validationMessage","getSetFactory"];