
/**=========================================================
 * Module: AccReceiptController.js
 * Controller for input components
 =========================================================*/

App.controller('AccReceiptController', AccReceiptController);

function AccReceiptController($rootScope,$scope,apiCall,apiPath,toaster,$modal,apiResponse,validationMessage,getSetFactory) {
  'use strict';
  
  var vm = this;
  $scope.accReceipt = [];
  var formdata = new FormData();
  
   $scope.accReceipt.totalAmount;
  $scope.accReceipt.jfid; // JFID
  
  var dateFormats = $rootScope.dateFormats; //Date Format
  
   $scope.noOfDecimalPoints;
  
	/* VALIDATION */
	
	$scope.errorMessage = validationMessage; //Error Messages In Constant
	
	/* VALIDATION END */
  
    $scope.disableCompany = false;
	var Modalopened = false;
	
  var account = {};
  account.amountType = 'debit';
  
  vm.AccReceiptTable = [];
  vm.multiCurrentBalance = []; // Current Balance Array For Table
 // vm.multiCurrentBalance = [{"currentBalance":"","amountType":""}];
  
  vm.accountCurrentBalance = {};
  
  //Auto suggest Account
	vm.accountDrop=[];
	var headerCr = {'Content-Type': undefined,'ledgerGroup':[9,12]};
	 
	vm.tableNameDrop=[];
	var headerDr = {'Content-Type': undefined,'ledgerGroup':[32]};
	
	
	 // Chosen data
  // ----------------------------------- 
	vm.companyDrop = [];
	
	apiCall.getCall(apiPath.getAllCompany).then(function(responseCompanyDrop){
		
		vm.companyDrop = responseCompanyDrop;
	
	});
	
	$scope.defaultCompany = function(){
		
		//Set default Company
		apiCall.getDefaultCompany().then(function(response){
		
			$scope.accReceipt.companyDropDown = response;
			
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
	
	
	//Update Data
	if(getSetFactory.get() > 0){
		
		$scope.accReceipt.getSetJrnlId = getSetFactory.get();
		getSetFactory.blank();
		
		console.log("update");
		console.log($scope.accReceipt.getSetJrnlId);
		
		var getOneJrnlPath = apiPath.getOneJrnl+$scope.accReceipt.getSetJrnlId;
		//console.log(getOneJrnlPath);
		
		var headerDataEdit = {'Content-Type': undefined};
	   
			
		apiCall.getCallHeader(getOneJrnlPath,headerDataEdit).then(function(response){
			
			console.log(response);
			
			$scope.accReceipt.jfid = response[0].jfId;
			$scope.accReceipt.companyDropDown = response[0].company;
			
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
				
				if(response[i].amountType == "debit"){
					
					account.ledgerId = response[i].ledger.ledgerId;
					account.ledgerName = response[i].ledger.ledgerName;
					
					$scope.accReceipt.account = response[i].ledger.ledgerName;
					
					vm.accountCurrentBalance.currentBalance = response[i].ledger.currentBalance;
					vm.accountCurrentBalance.amountType= response[i].ledger.currentBalanceType;
				}
				else{
					
					 var tempData = {};
					tempData.amountType = response[i].amountType;
					tempData.ledgerId= response[i].ledger.ledgerId;
					tempData.ledgerName = response[i].ledger.ledgerName;
					tempData.amount = parseFloat(response[i].amount);
					
					vm.AccReceiptTable.push(tempData);
					
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
		vm.AccReceiptTable = [];
		vm.AccReceiptTable = [{"ledgerId":"","ledgerName":"","amount":"","amountType":"credit"}];
		
		 vm.multiCurrentBalance = []; // Current Balance Array For Table
		vm.multiCurrentBalance = [{"currentBalance":"","amountType":""}];
  
		$scope.defaultCompany();
	
	}
	// END
  /* Table */
  
	
	
	$scope.addRow = function(index){
		
		var plusOne = index+1;
		var data = {};	
		data.ledgerId='';
		data.ledgerName ='';
		data.amount ='';
		data.amountType = 'credit';
		//vm.AccReceiptTable.push(data);
		vm.AccReceiptTable.splice(plusOne, 0, data);
		
		var balance = {};
		balance.currentBalance = '';
		balance.amountType = '';
		//vm.multiCurrentBalance.push(balance);
		vm.multiCurrentBalance.splice(plusOne, 0, balance);
    };
	
	$scope.settabledata = function(item,index)
	{
		vm.AccReceiptTable[index].ledgerId = item.ledgerId;
		
		vm.multiCurrentBalance[index].currentBalance = item.currentBalance;
		vm.multiCurrentBalance[index].amountType = item.currentBalanceType;
		
		//console.log(vm.AccReceiptTable);
		$scope.changeJrnlArray = true;
	}
	
	$scope.removeRow = function (idx) {
		vm.AccReceiptTable.splice(idx, 1);
		vm.multiCurrentBalance.splice(idx, 1);
	};
	
  /* End */
	
	$scope.setAccReceipt = function(item) {
		
		//console.log(item);
		account.ledgerId = item.ledgerId;
		account.ledgerName = item.ledgerName;
		
		vm.accountCurrentBalance.currentBalance = item.currentBalance;
		vm.accountCurrentBalance.amountType= item.currentBalanceType;
		
		$scope.changeJrnlArray = true;
  	}
	
	//Changed date
	$scope.changeReceiptDate = function(Fname){
		
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		var  date = new Date(vm.dt1);
		var fdate  = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
		//console.log(Fname+'..'+fdate);
		formdata.append(Fname,fdate);
	}
	
	//Total For Array Table
	$scope.getTotal = function(){
		
		var total = 0;
		for(var i = 0; i < vm.AccReceiptTable.length; i++){
			
			var product = vm.AccReceiptTable[i];
			total += parseFloat(product.amount);
			
		}
		return total;
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
		
		vm.AccReceiptTable = [{"ledgerId":"","ledgerName":"","amount":"","amountType":"credit"}];
		vm.multiCurrentBalance = [{"currentBalance":"","amountType":""}];
		
		var account = {};
		account.amountType = 'debit';
		$scope.accReceipt.account = '';
		vm.accountCurrentBalance = {};
	}
	
	//Change in Journal Table
	$scope.changeJrnlTable = function(){
		
		$scope.changeJrnlArray = true;
		
	}
	
	$scope.jointJournalArray = function(){
		
		vm.tempAccReceiptTable = [];
		account.amount = $scope.accReceipt.totalAmount;
		
		vm.tempAccReceiptTable.push(account);
		
		var cnt = vm.AccReceiptTable.length;
		for(var i=0;i<cnt;i++){
			vm.tempAccReceiptTable.push(vm.AccReceiptTable[i]);
		}
		
		//console.log(vm.tempAccReceiptTable);
		
		var json = angular.copy(vm.tempAccReceiptTable);
			 
		for(var j=0;j<json.length;j++){
			 
			angular.forEach(json[j], function (value,key) {
				
				formdata.append('data['+j+']['+key+']',value);
				
			});
			
		}
				
	}
	
	$scope.addUpReceipt = function(){
		
		toaster.clear();
		
		if($scope.accReceipt.getSetJrnlId){
			
			toaster.pop('wait', 'Please Wait', 'Data Updating....',60000);
			
			var accPaymentPath = apiPath.postJrnl+'/'+$scope.accReceipt.jfid;
			
			if($scope.changeJrnlArray){
				
				$scope.jointJournalArray();
			}
			
		}
		else{
			
			toaster.pop('wait', 'Please Wait', 'Data Inserting....',60000);
			
			$scope.jointJournalArray();
			
			if(!formdata.has('companyId')){
			
			formdata.append('companyId',$scope.accReceipt.companyDropDown.companyId);
			}
			
			var  date = new Date(vm.dt1);
			var fdate  = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
			//console.log(fdate);
			
			if(formdata.has('entryDate')){
				
				formdata.delete('entryDate',fdate);
			}
			formdata.append('entryDate',fdate);
			
			
			var accPaymentPath = apiPath.postJrnl;
			
		}
		
		
		var headerData = {'Content-Type': undefined,'type':'receipt'};
		
		apiCall.getCall(apiPath.getJrnlNext).then(function(response){
			
			if(!$scope.accReceipt.getSetJrnlId){
				
				$scope.accReceipt.jfid = response.nextValue;
				
				if(formdata.has('jfId')){
					
					formdata.delete('jfId');
					
				}
				
				formdata.append('jfId',$scope.accReceipt.jfid);
			}
			
			apiCall.postCallHeader(accPaymentPath,headerData,formdata).then(function(data){
					
				toaster.clear();
				//console.log(data);
				if(apiResponse.ok == data){
					
					vm.dt1 = new Date();
					vm.minStart = new Date();
					vm.maxStart = new Date();
				
					if($scope.changeJrnlArray){
						
						var jsonDel = angular.copy(vm.tempAccReceiptTable);
						 
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
					
					if($scope.accReceipt.getSetJrnlId){
						
						toaster.pop('success', 'Title', 'Update Successfull');
						$scope.disableCompany = false;
						
					}
					else{
						toaster.pop('success', 'Title', 'Insert Successfull');
					}
					
					$scope.accReceipt = [];
					$scope.accReceipt.totalAmount;
					vm.tableNameDrop = [];
					vm.accountDrop = [];
					var account = {};
					account.amountType = 'credit';
		  
				
					
					vm.AccReceiptTable = [{"ledgerId":"","ledgerName":"","amount":"","amountType":"credit"}];
					vm.multiCurrentBalance = [{"currentBalance":"","amountType":""}];
					
					//Next JfId
					// apiCall.getCall(apiPath.getJrnlNext).then(function(response){
			
						// $scope.accReceipt.jfid = response.nextValue;

					// });
					
					$scope.defaultCompany();
					
				}
				else{
					
					toaster.pop('warning', 'Opps!!', data);
					
					if($scope.changeJrnlArray){
						
						var jsonDel = angular.copy(vm.tempAccReceiptTable);
						 
						for(var j=0;j<jsonDel.length;j++){
							 
							angular.forEach(jsonDel[j], function (value,key) {
								
								formdata.delete('data['+j+']['+key+']',value);
								
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
		
		toaster.clear();
		
		vm.dt1 = new Date();
		vm.minStart = new Date();
		vm.maxStart = new Date();
	
		// if($scope.changeJrnlArray){
			
			// var jsonDel = angular.copy(vm.tempAccReceiptTable);
			 
			// for(var j=0;j<jsonDel.length;j++){
				 
				// angular.forEach(jsonDel[j], function (value,key) {
					
					// formdata.delete('data['+j+']['+key+']',value);
					
				// });
				
			// }
		// }
		$scope.changeJrnlArray = false;
		
		// Delete formdata  keys
		for (var key of formdata.keys()) {
		   formdata.delete(key); 
		}
		
		$scope.accReceipt = [];
		$scope.accReceipt.totalAmount;
		vm.tableNameDrop = [];
		vm.accountDrop = [];
		var account = {};
		account.amountType = 'credit';

	
		
		vm.AccReceiptTable = [{"ledgerId":"","ledgerName":"","amount":"","amountType":"credit"}];
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
	

	if($scope.accReceipt.companyDropDown){
		
		var modalInstance = $modal.open({
		  templateUrl: 'app/views/PopupModal/Accounting/ledgerModal.html',
		  controller: AccLedgerModalController,
		  size: size,
		  resolve:{
			  ledgerIndex: function(){
				  return index;
			  },
			  companyId: function(){
				return $scope.accReceipt.companyDropDown;
			  }
		  }
		});
		
		Modalopened = true;
	
	
		var state = $('#modal-state');
		modalInstance.result.then(function (data) {
		  
			
			
			//Auto suggest Client Name For Debit
			var jsuggestPath = apiPath.getLedgerJrnl+$scope.accReceipt.companyDropDown.companyId;
			
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
					
					$scope.accReceipt.account = response.ledgerName;
					
					vm.accountCurrentBalance.currentBalance = response.currentBalance;
					vm.accountCurrentBalance.amountType= response.currentBalanceType;
					
				}
				else{
					
					vm.AccReceiptTable[data.index].ledgerName = response.ledgerName;
					vm.AccReceiptTable[data.index].ledgerId = response.ledgerId;
					
					vm.multiCurrentBalance[data.index].currentBalance = response.currentBalance;
					vm.multiCurrentBalance[data.index].amountType = response.currentBalanceType;
					
				}
		
				
			});
				
			Modalopened = false;
		
		}, function (data) {
			
			//alert(data);
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
AccReceiptController.$inject = ["$rootScope","$scope","apiCall","apiPath","toaster","$modal","apiResponse","validationMessage","getSetFactory"];