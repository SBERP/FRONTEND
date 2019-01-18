
/**=========================================================
 * Module: AccPurchaseController.js
 * Controller for input components
 =========================================================*/
// function filterByName(item, typedValue) {
	// console.log(item);
    // return item.filter(function(patient) {
        // matches_productName = patient.productName.indexOf(typedValue) != -1;
        // matches_color = patient.color.indexOf(typedValue) != -1;

        // return matches_productName || matches_color;
    // });
// }

	
App.controller('AccPurchaseController', AccPurchaseController);

function AccPurchaseController($scope,apiCall,apiPath,$modal,$rootScope,getSetFactory,toaster,apiResponse,validationMessage,productArrayFactory,purchaseType,maxImageSize,productFactory) {
  'use strict';
  
   var vm = this;
   $scope.accPurchase = [];
    var formdata = new FormData();
	$scope.totalTable;
	$scope.grandTotalTable;
	$scope.accPurchase.tax = 0;
	
	$scope.purchaseType = purchaseType;
	
	console.log($scope.purchaseType);
	
	$scope.erpPath = $rootScope.erpPath; // Erp Path
	 var dateFormats = $rootScope.dateFormats; //Date Format
	 
	$scope.disableCompany = false;
	var Modalopened = false;
	
	$scope.disableCompanyPoint = 0;
	
	 $scope.noOfDecimalPoints; // decimalPoints For Price,Tax Etc.....
	 
	 // Current and Opening Balance
	 $scope.displayOpeningBal = 0.00;
	$scope.displayCurrentBal = 0.00;
	 
	$scope.productArrayFactory = productArrayFactory; //tax Calculation Factory
	
	$scope.totalDebit; // sum of Debit Amount
	$scope.totalCredit;  // sum of Credit Amount
  
	$scope.accPurchase.jfid; // JFID
	 
	vm.AccClientMultiTable = [];
	vm.multiCurrentBalance = [];
	$scope.changeJrnlArray = false; // Change When Update in Journal Table Array
	
	vm.AccPurchaseTable = [];
	 vm.productTax = []; //product Tax
	$scope.changeProductArray = false; // Change When Update in Product Table Array
	
	/* VALIDATION */
	
	$scope.errorMessage = validationMessage; //Error Messages In Constant
	
	/* VALIDATION END */
	
	/**
		Jsuggest Debit/Credit
	**/
		//Auto suggest Client Name
		vm.clientNameDropDr=[];
		var headerDr = {'Content-Type': undefined,'ledgerGroup':[26,16,19]};
		
		vm.clientNameDropCr=[];
		var headerCr = {'Content-Type': undefined,'ledgerGroup':[9,12,31,17]};
	/**
		End
	**/
	
	//$scope.filterByName = filterByName;
	
	// ----------------------------------- 

  vm.companyDrop = [];
	
	apiCall.getCall(apiPath.getAllCompany).then(function(responseCompanyDrop){
		
		vm.companyDrop = responseCompanyDrop;
		$scope.disableCompanyPoint = 1;
	
	});
	
	$scope.currentAndOpeningBal = function(companyID,Name){
		
		var headerSearch = {'Content-Type': undefined,'ledgerName':Name};
		apiCall.getCallHeader(apiPath.getLedgerJrnl+companyID,headerSearch).then(function(response){
			
			//console.log(response);
			$scope.displayOpeningBal = response.openingBalance;
			$scope.displayOpeningBalType = response.openingBalanceType;
			$scope.displayCurrentBal = response.currentBalance;
			$scope.displayCurrentBalType = response.currentBalanceType;

		});
	}
	
	//Client Data
	$scope.clientGetAllFunction = function(id){
		
		var headerCr = {'Content-Type': undefined,'ledgerGroup':[31]};
		
		vm.clientSuggest = [];
		
		apiCall.getCallHeader(apiPath.getLedgerJrnl+id,headerCr).then(function(response){
			
			if(angular.isArray(response)){
				
				for(var t=0;t<response.length;t++){
				
					for(var k=0;k<response[t].length;k++){
						
						vm.clientSuggest.push(response[t][k]);
					}
					
				}
			
			}
			else{
				vm.clientSuggest = [];
			}
			
		});
	
	}
	
	$scope.defaultCompany = function(){
		
		vm.loadData = true;
			
		//Set default Company
		apiCall.getDefaultCompany().then(function(response){
		
			$scope.accPurchase.companyDropDown = response;
			
			if(formdata.has('companyId')){
				
				formdata.delete('companyId');
			}
			
			formdata.append('companyId',response.companyId);
			
			$scope.currentAndOpeningBal(response.companyId,'purchase');
			
			$scope.noOfDecimalPoints = parseInt(response.noOfDecimalPoints);
			toaster.clear();
			toaster.pop('wait', 'Please Wait', 'Data Loading....',60000);
			
			$scope.clientGetAllFunction(response.companyId);
			
			vm.clientNameDropDr=[];
			vm.clientNameDropCr=[];
			
			//Auto suggest Client Name For Debit
			var jsuggestPath = apiPath.getLedgerJrnl+response.companyId;
			
			apiCall.getCallHeader(jsuggestPath,headerDr).then(function(response3){
				
				if(response3 != apiResponse.notFound){
					
					for(var t=0;t<response3.length;t++){
						
						for(var k=0;k<response3[t].length;k++){
							
							vm.clientNameDropDr.push(response3[t][k]);
						}
						
					}
					
				}
			
			});
			
			apiCall.getCallHeader(jsuggestPath,headerCr).then(function(response3){
				
				if(response3 != apiResponse.notFound){
					
					for(var t=0;t<response3.length;t++){
						
						for(var k=0;k<response3[t].length;k++){
							
							vm.clientNameDropCr.push(response3[t][k]);
						}
						
					}
				}
			
			});
			
			//Auto Suggest Product Dropdown data
			vm.productNameDrop = [];
			
			//apiCall.getCall(apiPath.getProductByCompany+response.companyId+'/branch').then(function(responseDrop){
			productFactory.getProductByCompany(response.companyId).then(function(data){	
				vm.productNameDrop = data;
				toaster.clear();
				vm.loadData = false;
			});
		
		});
			
		
	}
	
	$scope.ReloadAfterSave = function(response){
		
		$scope.accPurchase.companyDropDown = response;
			
		if(formdata.has('companyId')){
			
			formdata.delete('companyId');
		}
		
		formdata.append('companyId',response.companyId);
		
		$scope.currentAndOpeningBal(response.companyId,'purchase');
		
		$scope.noOfDecimalPoints = parseInt(response.noOfDecimalPoints);
		
	}
	
	

  // Datepicker
  // ----------------------------------- 
	this.minStart = new Date();
	
	this.openStart = function($event) {
	  
    $event.preventDefault();
    $event.stopPropagation();

    this.openedStart = true;
  };
  
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

  this.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  this.initDate = new Date('2016-15-20');
  // this.formats = ['dd-MMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  this.format = dateFormats;
	
	//Update Set
	  // if(Object.keys(getSetFactory.get()).length){
	 if(getSetFactory.get() > 0){
			
			$scope.accPurchase.getSetJrnlId = getSetFactory.get();
			//$scope.accPurchase.jfid = $scope.accPurchase.getSetJrnlId;
			//console.log($scope.accPurchase.getSetJrnlId);
			getSetFactory.blank();
			
			var getOneJrnlPath = apiPath.getJrnlByCompany+$rootScope.accView.companyId;
			//console.log(getOneJrnlPath);
			
			var headerDataEdit = {'Content-Type': undefined,'type':'purchase','jfId':parseInt($scope.accPurchase.getSetJrnlId)};
	   
			
			apiCall.getCallHeader(getOneJrnlPath,headerDataEdit).then(function(data){
				
				//Set JFID
				$scope.accPurchase.jfid = data.journal[0].jfId;
				
				$scope.currentAndOpeningBal(data.journal[0].company.companyId,'purchase');
				
				//Client Name
				$scope.accPurchase.clientName = data.clientName;
				
				//Set Invoice Number
				$scope.accPurchase.billNo = data.productTransaction[0].billNumber;
				
				$scope.accPurchase.companyDropDown = data.journal[0].company;
				$scope.disableCompany = true;
				
				//set Decimal Number
				$scope.noOfDecimalPoints = parseInt(data.productTransaction[0].company.noOfDecimalPoints);
				
				//Set Invoice Number
				$scope.accPurchase.documentData = data.document;
				
				
				/** 
				Jsuggest OF Credit/Debit
				**/
					//Auto suggest Client Name For Debit
					var jsuggestPathEdit = apiPath.getLedgerJrnl+data.journal[0].company.companyId;
					
					apiCall.getCallHeader(jsuggestPathEdit,headerDr).then(function(response3){
						
						for(var t=0;t<response3.length;t++){
							
							for(var k=0;k<response3[t].length;k++){
								
								vm.clientNameDropDr.push(response3[t][k]);
							}
							
						}
					
					});
					
					apiCall.getCallHeader(jsuggestPathEdit,headerCr).then(function(response3){
						
						for(var t=0;t<response3.length;t++){
							
							for(var k=0;k<response3[t].length;k++){
								
								vm.clientNameDropCr.push(response3[t][k]);
							}
							
						}
					
					});
					
					//Auto Suggest Product Dropdown data
					vm.productNameDrop = [];
					
					//apiCall.getCall(apiPath.getProductByCompany+data.journal[0].company.companyId+'/branch').then(function(responseDrop){
					productFactory.getProductByCompany(data.journal[0].company.companyId).then(function(data){	
						vm.productNameDrop = data;
					
					});
			
				/**
					End
				**/
				
				//Set Date
				var getResdate = data.journal[0].entryDate;
				var splitedate = getResdate.split("-").reverse().join("-");
				vm.dt1 = new Date(splitedate);
				vm.minStart = new Date(splitedate);
				//vm.maxStart = new Date(splitedate);
				
				//Set Table Array
				for(var i=0;i<data.journal.length;i++){
					
					 var tempData = {};
					tempData.amountType = data.journal[i].amountType;
					tempData.ledgerId= data.journal[i].ledger.ledgerId;
					tempData.ledgerName = data.journal[i].ledger.ledgerName;
					tempData.amount = parseFloat(data.journal[i].amount);
					
					vm.AccClientMultiTable.push(tempData);
					
					//Set Current Balance 
					var tempBalanceData = {};
					
					tempBalanceData.currentBalance = data.journal[i].ledger.currentBalance;
					tempBalanceData.amountType = data.journal[i].ledger.currentBalanceType;
					
					vm.multiCurrentBalance.push(tempBalanceData);
				}
				
				//Set Product Array
				for(var j=0;j<data.productTransaction.length;j++){
					
					 var tempProData = {};
					tempProData.productId = data.productTransaction[j].product.productId;
					tempProData.productName= data.productTransaction[j].product.productName;
					tempProData.discountType = data.productTransaction[j].discountType;
					tempProData.price = parseFloat(data.productTransaction[j].price);
					tempProData.discount = parseFloat(data.productTransaction[j].discount);
					tempProData.qty = parseInt(data.productTransaction[j].qty);
					tempProData.color = data.productTransaction[j].product.color;
					tempProData.size = data.productTransaction[j].product.size;
					//tempProData.amount = parseInt(data.productTransaction[j].amount);
					
					vm.AccPurchaseTable.push(tempProData);
					
					var varTax = {};
					//varTax.tax = data.productTransaction[j].product.vat;
					varTax.tax = 0;
					
					vm.productTax.push(varTax);
					//console.log();
				}
				$scope.accPurchase.tax = parseFloat(data.productTransaction[0].tax);
				//console.log(vm.AccClientMultiTable);
			});
			
		}
		else{
			
			
			$scope.defaultCompany();
			
			
			vm.AccClientMultiTable = [{"amountType":"debit","ledgerId":"","ledgerName":"","amount":""},{"amountType":"debit","ledgerId":"","ledgerName":"","amount":""}];
			vm.multiCurrentBalance = [{"currentBalance":"","amountType":""},{"currentBalance":"","amountType":""}];
			
			vm.AccPurchaseTable = [{"productId":"","productName":"","discountType":"flat","price":0,"discount":"","qty":1,"amount":"","color":"","size":""}];
			vm.productTax = [{"tax":0}];
			
			
		}
		//End Update Set
	
	
	
	
	/* Table */
	
	
	$scope.addClientRow = function(index){
		 
		 var plusOne = index+1;
		 
		 var data = {};
		data.amountType ='debit';
		data.ledgerId='';
		data.ledgerName ='';
		data.amount ='';
		//vm.AccClientMultiTable.push(data);
		vm.AccClientMultiTable.splice(plusOne, 0, data);
		
		var balance = {};
		balance.currentBalance = '';
		balance.amountType = '';
		//vm.multiCurrentBalance.push(balance);
		vm.multiCurrentBalance.splice(plusOne, 0, balance);
		
		$scope.changeJrnlArray = true;

    };
	
	$scope.setAccPurchase = function(item,index)
	{
		vm.multiCurrentBalance[index].currentBalance =  item.currentBalance;
		vm.multiCurrentBalance[index].amountType = item.currentBalanceType;
		
		vm.AccClientMultiTable[index].ledgerId = item.ledgerId;
		//console.log(vm.AccClientMultiTable);
		$scope.changeJrnlArray = true;
	}
	
	$scope.removeClientRow = function (idx) {
		
		vm.AccClientMultiTable.splice(idx, 1);
		vm.multiCurrentBalance.splice(idx, 1);
		$scope.changeJrnlArray = true;
		
	};
	/* End */
	
	/* Product Table */
	
	$scope.addRow = function(index){
		  
		var plusOne = index+1;
			
		var data = {};	
		// console.log(this.AccSalesTable);
		data.productId='';
		data.productName ='';
		data.discountType ='flat';
		data.price = 0;
		data.discount ='';
		data.qty = 1;
		data.amount = '';
		data.color = '';
		data.size = '';
		//vm.AccPurchaseTable.push(data);
		vm.AccPurchaseTable.splice(plusOne,0,data);
		
		var varTax = {};
		varTax.tax = 0;
		
		vm.productTax.splice(plusOne, 0, varTax);
		
		$scope.changeProductArray = true;

    };
	
	vm.productHsn = [];
	$scope.settabledata = function(item,index)
	{
		vm.AccPurchaseTable[index].productId = item.productId;
		vm.productHsn[index] = item.hsn;
		
		var grandPrice;

		grandPrice = productArrayFactory.calculate(item.purchasePrice,0,item.margin) + parseFloat(item.marginFlat);
			
		if(grandPrice == 0){
			
			grandPrice = productArrayFactory.calculate(item.mrp,0,item.margin) + parseFloat(item.marginFlat);
		}
		
		vm.AccPurchaseTable[index].price = grandPrice;
		
		//vm.productTax[index].tax = productArrayFactory.calculateTax(item.purchasePrice,item.vat,item.margin);
		vm.productTax[index].tax = parseFloat(item.vat);
		
		/** Color/Size **/
		vm.AccPurchaseTable[index].color = item.color;
		vm.AccPurchaseTable[index].size = item.size;
		/** End **/
		//console.log(vm.AccPurchaseTable);
		$scope.changeProductArray = true;
	}
	
	$scope.removeRow = function (idx) {
		vm.AccPurchaseTable.splice(idx, 1);
		vm.productTax.splice(idx, 1);
		vm.productHsn.splice(idx,1);
		$scope.changeProductArray = true;
	};
	
	$scope.getTotal = function(){
		var total = 0;
		for(var i = 0; i < vm.AccPurchaseTable.length; i++){
			var product = vm.AccPurchaseTable[i];
			total += product.amount;
		}
		return total;
	}
	
	//Total For Product Table
	$scope.getTotalTax = function(){
		
		var total = 0;
		for(var i = 0; i < vm.AccPurchaseTable.length; i++){
			var product = vm.AccPurchaseTable[i];
			var vartax = vm.productTax[i];
			total += productArrayFactory.calculateTax(product.amount,vartax.tax,0);
		}
		return total;
	}
	/* END */
	
	//Auto suggest Client Name
	// vm.clientNameDrop=[];
	// apiCall.getCall(apiPath.getAllLedger).then(function(response3){
		
		// vm.clientNameDrop = response3;
	
	// });
	
	//Auto Suggest Product Dropdown data
	// vm.productNameDrop = [];
	
	// apiCall.getCall(apiPath.getAllProduct).then(function(responseDrop){
		
		// vm.productNameDrop = responseDrop;
	
	// });
	
	//Set JSuggest Data When Company
	$scope.changeCompany = function(Fname,value){
		
		vm.loadData = true;
		
		$scope.noOfDecimalPoints = parseInt(value.noOfDecimalPoints);
		$scope.currentAndOpeningBal(value.companyId,'purchase');
		
		toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Data Loading....',60000);
		
		$scope.clientGetAllFunction(value.companyId);
		
		vm.clientNameDropDr=[];
		vm.clientNameDropCr=[];
		
		//Auto suggest Client Name
		var jsuggestPath = apiPath.getLedgerJrnl+value.companyId;
		apiCall.getCallHeader(jsuggestPath,headerDr).then(function(response3){
			
			for(var t=0;t<response3.length;t++){
				
				for(var k=0;k<response3[t].length;k++){
					
					vm.clientNameDropDr.push(response3[t][k]);
				}
				
			}
		
		});
		
		apiCall.getCallHeader(jsuggestPath,headerCr).then(function(response3){
			
			for(var t=0;t<response3.length;t++){
				
				for(var k=0;k<response3[t].length;k++){
					
					vm.clientNameDropCr.push(response3[t][k]);
				}
				
			}
		
		});
		
		//Auto Suggest Product Dropdown data
		vm.productNameDrop = [];
		
		//apiCall.getCall(apiPath.getProductByCompany+value.companyId+'/branch').then(function(responseDrop){
		productFactory.getProductByCompany(value.companyId).then(function(data){		
		
			vm.productNameDrop = data;
			toaster.clear();
			vm.loadData = false;
		});
		
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		formdata.append(Fname,value.companyId);
		
		
		vm.AccClientMultiTable = [{"amountType":"debit","ledgerId":"","ledgerName":"","amount":""},{"amountType":"debit","ledgerId":"","ledgerName":"","amount":""}];
		vm.multiCurrentBalance = [{"currentBalance":"","amountType":""},{"currentBalance":"","amountType":""}];
		
		vm.AccPurchaseTable = [{"productId":"","productName":"","discountType":"flat","price":0,"discount":"","qty":1,"amount":"","color":"","size":""}];
		vm.productTax = [{"tax":0}];
		
	}
  
  //Set Multiple File In Formdata On Change
	$scope.uploadFile = function(files) {
		//console.log(files);
		//formdata.append("file[]", files[0]);
		var flag = 0;
		
		for(var m=0;m<files.length;m++){
			
			if(parseInt(files[m].size) > maxImageSize){
				
				flag = 1;
				toaster.clear();
				//toaster.pop('alert','Image Size is Too Long','');
				toaster.pop('alert', 'Opps!!', 'Image Size is Too Long');
				formdata.delete('file[]');
				angular.element("input[type='file']").val(null);
				break;
			}
			
		}
		
		if(flag == 0){
			
			formdata.delete('file[]');
			
			angular.forEach(files, function (value,key) {
				formdata.append('file[]',value);
			});
		}

	};
	
	$scope.setClientName = function(Fname,vendor,value) {
		
		if(formdata.has(Fname) || formdata.has(vendor))
		{
			formdata.delete(Fname);
			formdata.delete(vendor);
		}
		formdata.append(Fname,value.ledgerName);
		formdata.append(vendor,value.ledgerId);
  	}
	
	$scope.changeAccPurchase = function(Fname,value) {
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		formdata.append(Fname,value);
  	}
	
	//Changed date
	$scope.changePurchaseDate = function(Fname){
		
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		var  date = new Date(vm.dt1);
		var fdate  = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
		//console.log(Fname+'..'+fdate);
		formdata.append(Fname,fdate);
	}
	
	
	//Change in Journal Table
	$scope.changeAmountType = function(index){
		
		vm.AccClientMultiTable[index].ledgerId = '';
		vm.AccClientMultiTable[index].ledgerName = '';
		
		vm.multiCurrentBalance[index].currentBalance =  '';
		vm.multiCurrentBalance[index].amountType = '';
		
		$scope.changeJrnlArray = true;
		
	}
	
	//Change in Journal Table
	$scope.changeJrnlTable = function(){
		
		$scope.changeJrnlArray = true;
		
	}
	
	//Change in Product Table
	$scope.changeProductTable = function(){
		
		$scope.changeProductArray = true;
		//console.log($scope.changeInArray);
	}
	
	//Set Last JfId In jfid variable
	// var jfid;
	// apiCall.getCall(apiPath.getJrnlNext).then(function(response){
		
		// jfid = response.nextValue;
	
	// });
	
	$scope.deleteArray = function(){
		
		//Delete Journal Data From formdata Object
		if($scope.changeJrnlArray){
			
			var jsonJrnlDelete = angular.copy(vm.AccClientMultiTable);
			
			for(var i=0;i<jsonJrnlDelete.length;i++){
				 
				angular.forEach(jsonJrnlDelete[i], function (value,key) {
					
					formdata.delete('data['+i+']['+key+']',value);
				});
				
			}
			
			
		}
		
		//Delete Product Data From formdata Object
		if($scope.changeProductArray){
			
			var jsonProductDelete = angular.copy(vm.AccPurchaseTable);
			
			for(var i=0;i<jsonProductDelete.length;i++){
				 
				angular.forEach(jsonProductDelete[i], function (value,key) {
					
					formdata.delete('inventory['+i+']['+key+']',value);
				});
				
			}
			
			
		}
	}
	
	$scope.disableButton = false;
	
  $scope.pop = function()
  {
	   toaster.clear();
	   
	  $scope.disableButton = true; //Disbale Button
	  
	  if($scope.accPurchase.getSetJrnlId){
		 
		 toaster.pop('wait', 'Please Wait', 'Data Updating....',60000);
	  }
	  else{
		
		toaster.pop('wait', 'Please Wait', 'Data Inserting....',60000);
	  }
	  
	  
	if($scope.totalDebit != $scope.totalCredit){
		
		 toaster.clear();
		 
		toaster.pop('alert', 'Opps!!', 'Credit/Debit Amount is Not Equal');
		$scope.disableButton = false;
		return false;
	}
	
	
	if($scope.accPurchase.getSetJrnlId){
		
		
		var accPurchasePath = apiPath.postJrnl+'/'+$scope.accPurchase.jfid;
		
		if($scope.changeJrnlArray){
			
		
			var json = angular.copy(vm.AccClientMultiTable);
			 
			for(var i=0;i<json.length;i++){
				 
				angular.forEach(json[i], function (value,key) {
					
					formdata.append('data['+i+']['+key+']',value);
				});
				
			}
			
		}
		
		if($scope.changeProductArray){
			
			var jsonProduct = angular.copy(vm.AccPurchaseTable);
			 
			for(var i=0;i<jsonProduct.length;i++){
				 
				angular.forEach(jsonProduct[i], function (value,key) {
					
					formdata.append('inventory['+i+']['+key+']',value);
				});
				
			}
			if(formdata.has('tax')){
			
				formdata.delete('tax');
			}
			formdata.append('tax',$scope.accPurchase.tax);
			// formdata.append('transactionDate',$scope.totalTable);
			// formdata.append('transactionDate',$scope.grandTotalTable);
			
		}
		
		if(formdata.has('entryDate')){
			var  date = new Date(vm.dt1);
			//var fdate  = date.getFullYear()+'-' + (date.getMonth()+1) + '-'+date.getDate();
			var fdate  = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
			
			if(formdata.has('transactionDate')){
			
				formdata.delete('transactionDate');
			}
			formdata.append('transactionDate',fdate); // Inventory Change the date will be Change
		}
		
		if(formdata.get('tax') == '' || formdata.get('tax') == 0){
			
			formdata.delete('tax');
			
		}
		
	}
	else{
		
		
		var accPurchasePath = apiPath.postJrnl;
		
		//data
		 var json = angular.copy(vm.AccClientMultiTable);
		 
		 for(var i=0;i<json.length;i++){
			 
			angular.forEach(json[i], function (value,key) {
				
				formdata.append('data['+i+']['+key+']',value);
			});
					
		 }
		 
		//Inventory
		  var json2 = angular.copy(vm.AccPurchaseTable);
		 
		 for(var i=0;i<json2.length;i++){
			 
			angular.forEach(json2[i], function (value,key) {
				
				formdata.append('inventory['+i+']['+key+']',value);
			});
					
		}
		var  date = new Date(vm.dt1);
		//var fdate  = date.getFullYear()+'-' + (date.getMonth()+1) + '-'+date.getDate();
		var fdate  = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
		
		if(!formdata.has('entryDate')){
			
			formdata.append('entryDate',fdate);
		}
		
		if(formdata.has('transactionDate')){
			
			formdata.delete('transactionDate',fdate);
		}
		
		if(formdata.has('tax')){
			formdata.delete('tax');
		}
		formdata.append('tax',$scope.accPurchase.tax);
		
		if(!formdata.has('tax') || formdata.get('tax') == 'undefined'){
			
			formdata.delete('tax');
			formdata.append('tax','');
		}
		
		formdata.append('transactionDate',fdate);
		//formdata.append('invoiceNumber','');
		
		$scope.changeJrnlArray = true; // For Delete Array In Journal FormData After Success
		$scope.changeProductArray = true; // For Delete Array In Product FormData After Success
		
		
		
	}
	
	
	var headerData = {'Content-Type': undefined,'type':'purchase'};
	   
		 
		apiCall.getCall(apiPath.getJrnlNext).then(function(response){
		
			if(!$scope.accPurchase.getSetJrnlId){
				
				$scope.accPurchase.jfid = response.nextValue;
				
				if(formdata.has('jfId')){
					
					formdata.delete('jfId');
					
				}
				formdata.append('jfId',$scope.accPurchase.jfid);
			}
			
			apiCall.postCallHeader(accPurchasePath,headerData,formdata).then(function(data){
				
				//console.log(data);
				
				toaster.clear();
				
				//vm.maxStart = new Date();
				
				//Display Toaster Message
				if($scope.accPurchase.getSetJrnlId){
					
					if(apiResponse.ok == data){
						
						toaster.pop('success', 'Title', 'Update Successfully');
						$scope.disableCompany = false;
						$scope.disableCompanyPoint = 0;
					}
					else{
						$scope.deleteArray();
						toaster.pop('warning', 'Opps!!', data);
					}
					
				}
				else{
					
					if(apiResponse.ok == data){
						
						toaster.pop('success', 'Title', 'Insert Successfully');
					}
					else{
						
						// Delete formdata  keys
						// for (var key of formdata.keys()) {
						   // formdata.delete(key); 
						// }
						formdata.delete('tax');
						formdata.delete('jfId');
						$scope.deleteArray();
						toaster.pop('warning', 'Opps!!', data);
					}
					
					
					
				}
				
				if(apiResponse.ok == data){
					
					$scope.disableButton = false;
					
					//Delete Journal Data From formdata Object
					if($scope.changeJrnlArray){
						
						var jsonJrnlDelete = angular.copy(vm.AccClientMultiTable);
						
						for(var i=0;i<jsonJrnlDelete.length;i++){
							 
							angular.forEach(jsonJrnlDelete[i], function (value,key) {
								
								formdata.delete('data['+i+']['+key+']',value);
							});
							
						}
						
						$scope.changeJrnlArray = false;
						
					}
					
					//Delete Product Data From formdata Object
					if($scope.changeProductArray){
						
						var jsonProductDelete = angular.copy(vm.AccPurchaseTable);
						
						for(var i=0;i<jsonProductDelete.length;i++){
							 
							angular.forEach(jsonProductDelete[i], function (value,key) {
								
								formdata.delete('inventory['+i+']['+key+']',value);
							});
							
						}
						
						$scope.changeProductArray = false;
						
					}
					
					// Delete formdata  keys
					for (var key of formdata.keys()) {
					   formdata.delete(key);
					}
					formdata.delete('tax');
				
					vm.dt1 = new Date();
					vm.minStart = new Date();
					
					var companyData = $scope.accPurchase.companyDropDown;
					
					
					$scope.accPurchase = [];
					//vm.clientNameDropDr=[]; // Debit Jsuggest Blank
					//vm.clientNameDropCr=[]; // Credit Jsuggest Blank
					
					angular.element("input[type='file']").val(null);
					formdata.delete('file[]');
					
					vm.AccClientMultiTable = [{"amountType":"debit","ledgerId":"","ledgerName":"","amount":""},{"amountType":"credit","ledgerId":"","ledgerName":"","amount":""}];
					vm.multiCurrentBalance = [{"currentBalance":"","amountType":""},{"currentBalance":"","amountType":""}];
					
					vm.AccPurchaseTable = [{"productId":"","productName":"","discountType":"flat","discount":"","price":0,"qty":1,"amount":"","color":"","size":""}];
					vm.productTax = [{"tax":0}];
					
					apiCall.getCall(apiPath.getJrnlNext).then(function(response){
				
						$scope.accPurchase.jfid = response.nextValue;
			
					});
					
					$scope.ReloadAfterSave(companyData);
					// $scope.defaultCompany();
					
				}
				else{
					
					$scope.disableButton = false;
				}
				
		
			});
		});
  }
  
	//Cancel Button 
	$scope.cancel = function () {
		
		vm.dt1 = new Date();
		vm.minStart = new Date();
		//vm.maxStart = new Date();
		
		$scope.disableCompany = false;
		$scope.disableCompanyPoint = 0;
		$scope.disableButton = false;
		
		//Delete Journal Data From formdata Object
		if($scope.changeJrnlArray){
			
			var jsonJrnlDelete = angular.copy(vm.AccClientMultiTable);
			
			for(var i=0;i<jsonJrnlDelete.length;i++){
				 
				angular.forEach(jsonJrnlDelete[i], function (value,key) {
					
					formdata.delete('data['+i+']['+key+']',value);
				});
				
			}
			
			$scope.changeJrnlArray = false;
			
		}
		
		//Delete Product Data From formdata Object
		if($scope.changeProductArray){
			
			var jsonProductDelete = angular.copy(vm.AccPurchaseTable);
			
			for(var i=0;i<jsonProductDelete.length;i++){
				 
				angular.forEach(jsonProductDelete[i], function (value,key) {
					
					formdata.delete('inventory['+i+']['+key+']',value);
				});
				
			}
			
			$scope.changeProductArray = false;
			
		}
		
		// Delete formdata  keys
		for (var key of formdata.keys()) {
		   formdata.delete(key); 
		}
		
		$scope.accPurchase = [];
		vm.clientNameDropDr=[]; // Debit Jsuggest Blank
		vm.clientNameDropCr=[]; // Credit Jsuggest Blank
		
		
		angular.element("input[type='file']").val(null);
					formdata.delete('file[]');
		
		vm.AccClientMultiTable = [{"amountType":"debit","ledgerId":"","ledgerName":"","amount":""},{"amountType":"credit","ledgerId":"","ledgerName":"","amount":""}];
		
		vm.multiCurrentBalance = [{"currentBalance":"","amountType":""},{"currentBalance":"","amountType":""}];
		
		vm.AccPurchaseTable = [{"productId":"","productName":"","discountType":"flat","discount":"","price":0,"qty":1,"amount":"","color":"","size":""}];
		vm.productTax = [{"tax":0}];
		
		apiCall.getCall(apiPath.getJrnlNext).then(function(response){
	
			$scope.accPurchase.jfid = response.nextValue;

		});
		
		$scope.defaultCompany();
			
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
		
	if($scope.accPurchase.companyDropDown){
		
		var modalInstance = $modal.open({
		  templateUrl: 'app/views/PopupModal/Accounting/ledgerModal.html',
		  controller: AccLedgerModalController,
		  size: size,
			  resolve:{
				  ledgerIndex: function(){
					  return index;
				  },
				  companyId: function(){
					 
					return $scope.accPurchase.companyDropDown;
				  }
			  }
		});

		 Modalopened = true;
		 
		var state = $('#modal-state');
		modalInstance.result.then(function (data) {
		  
			if($scope.accPurchase.companyDropDown){
				
				//Auto suggest Client Name For Debit
				var jsuggestPath = apiPath.getLedgerJrnl+$scope.accPurchase.companyDropDown.companyId;
				
				vm.clientNameDropDr =[];
				
				apiCall.getCallHeader(jsuggestPath,headerDr).then(function(response3){
					
					for(var t=0;t<response3.length;t++){
						
						for(var k=0;k<response3[t].length;k++){
							
							vm.clientNameDropDr.push(response3[t][k]);
						}
						
					}
				
				});
				
				vm.clientNameDropCr = [];
				
				apiCall.getCallHeader(jsuggestPath,headerCr).then(function(response3){
					
					for(var t2=0;t2<response3.length;t2++){
						
						for(var k2=0;k2<response3[t2].length;k2++){
							
							vm.clientNameDropCr.push(response3[t2][k2]);
						}
						
					}
					
					
				});
				
				//Set Last Inserted Ledger
				//console.log(data);
				if(data.index != undefined){
					
					if(parseInt(data.index) == -1){
					
						$scope.accPurchase.clientName = data.ledgerName;
					}
					else{
						
						var headerSearch = {'Content-Type': undefined,'ledgerName':data.ledgerName};
						apiCall.getCallHeader(apiPath.getLedgerJrnl+data.companyId,headerSearch).then(function(response){
							
							//console.log(response);
							vm.AccClientMultiTable[data.index].ledgerName = response.ledgerName;
							vm.AccClientMultiTable[data.index].ledgerId = response.ledgerId;
							
							vm.multiCurrentBalance[data.index].currentBalance =  response.currentBalance;
							vm.multiCurrentBalance[data.index].amountType = response.currentBalanceType;
				
						});
					}
				}
				
				
				
			}
			
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
  
  /**
  Product Model Start
  **/
  $scope.openProduct = function (size,index) {

	if (Modalopened) return;
	
	if($scope.accPurchase.companyDropDown){
		
		var modalInstance = $modal.open({
		  templateUrl: 'app/views/PopupModal/Accounting/productModal.html',
		  controller: AccProductModalController,
		  size: size,
		  resolve:{
			  productIndex: function(){
				  return index;
			  },
			  companyId: function(){
				 
				return $scope.accPurchase.companyDropDown;
			  }
		  }
		});

	   Modalopened = true;
	   
		modalInstance.result.then(function (data) {
		 
			// var UrlPath = apiPath.getProductByCompany+data.companyId;
			
			// apiCall.getCall(UrlPath+'/branch').then(function(responseDrop){
			
				// vm.productNameDrop = responseDrop;
		
			// });
			
			toaster.clear();
			toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
			
			productFactory.blankProduct();
			productFactory.getProductByCompany(data.companyId).then(function(response){
				
				vm.productNameDrop = response;
				toaster.clear();
				
			});
			
			var headerSearch = {'Content-Type': undefined,'productName':data.productName,'color':data.color,'size':data.size};
			
			apiCall.getCallHeader(UrlPath,headerSearch).then(function(response){
				
				//console.log(response);
				vm.AccPurchaseTable[data.index].productName = response[0].productName;
				//vm.AccPurchaseTable[data.index].productId = response.productId;
				
				$scope.settabledata(response[0],data.index);
				
			});
			
			 Modalopened = false;
			 
		}, function () {
		  console.log('Cancel');	
		  Modalopened = false;
		});
	}
	else{
		
		alert('Please Select Company');
	}
	
  };
  /**
  Product Model End
  **/
  
  
  /**
	History Modal 
	**/
	
	$scope.openHistoryModal = function (size) {
		
		if (Modalopened) return;
		
		var modalInstance = $modal.open({
		  templateUrl: '/myHistoryPurchaseModalContent.html',
		  controller: historyPurchaseModaleCtrl,
		  size: size,
		  resolve:{
			  companyId: function(){
				 
				return $scope.accPurchase.companyDropDown;
			  }
		  }
		});

	    Modalopened = true;
		
		modalInstance.result.then(function () {
		 
			 Modalopened = false;
			 
		}, function () {
		  console.log('Cancel');	
		   Modalopened = false;
		   
		});
	
	};
	
	/**
	End History Modal 
	**/
	
}
AccPurchaseController.$inject = ["$scope","apiCall","apiPath","$modal","$rootScope","getSetFactory","toaster","apiResponse","validationMessage","productArrayFactory","purchaseType","maxImageSize","productFactory"];