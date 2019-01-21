
angular.module('purchaseBill',[]).controller('PurchaseBillController', PurchaseBillController);

function PurchaseBillController($rootScope,$scope,apiCall,apiPath,$http,$window,$modal,purchaseType,validationMessage,productArrayFactory,getSetFactory,toaster,apiResponse,$anchorScroll,maxImageSize,$sce,$templateCache,getLatestNumber,productFactory,$filter,$state,fetchArrayService,bankFactory) {
  'use strict';
 
	var vm = this;
	var formdata = new FormData();
	
	$scope.erpPath = $rootScope.erpPath; //Erp Path
	var dateFormats = $rootScope.dateFormats; //Date Format
	 
	$scope.purchaseType = purchaseType;

	$scope.purchaseBill = [];
	$scope.displayDefaultCompanyName = "";

	vm.AccExpense = [];

	vm.disableCompany = false;
	var Modalopened = false;
	
	vm.AccBillTable = [];
	vm.productHsn = [];
	vm.measurementUnitDrop = [];
	var api_measurementUnit = apiPath.settingMeasurementUnit;

	var defStateData = {};
	var AllDefCityData = [];
	var defCityData = {};
	
	$scope.noOfDecimalPoints; // decimalPoints For Price,Tax Etc.....
	
	$scope.productArrayFactory = productArrayFactory;
	
	$scope.changeProductArray = false; // Change When Update in Product Table Array
	$scope.changeProductAdvancePrice = false;  // Change Advance Price of Product
	
	$scope.purchaseBill.tax = 0; //Tax
	
	$scope.totalTable_without_expense;
	$scope.totalTable;
	$scope.grandTotalTable;
	$scope.purchaseBill.balanceTable;
	
	/* VALIDATION */
	
	$scope.errorMessage = validationMessage; //Error Messages In Constant
	
	/* VALIDATION END */
	vm.paymentModeDrop =['cash','bank','card'];
	
	$scope.purchaseBill.paymentMode = 'cash';
	vm.clientNameDropCr=[];
	
	//Auto Suggest Client Contact Dropdown data
	$scope.clientGetAllFunction = function(id,updateId = null){
		
		vm.clientNameDropCr=[];
		var jsuggestPath = apiPath.getLedgerJrnl+id;
		var headerCr = {'Content-Type': undefined,'ledgerGroup':[31]};
		
		apiCall.getCallHeader(jsuggestPath,headerCr).then(function(response3){
			
			if(angular.isArray(response3)){
				var tCount = response3.length;
				while(tCount--){
					var kCount = response3[tCount].length;
					while(kCount--){
						vm.clientNameDropCr.push(response3[tCount][kCount]);
						if(updateId != null){
							if(parseInt(response3[tCount][kCount].ledgerId) == parseInt(updateId)){
								$scope.purchaseBill.ledgerEditableData = response3[tCount][kCount];
							}
						}
					}
				}
			}
			else{
				toaster.clear();
				if(response3 == apiResponse.notFound || response3 == apiResponse.noContent){
					toaster.pop('info', 'Please Add Your Vendor First');
				}
				else{
					toaster.pop('info', response3);
				}
			}
		});
	}

	function loadBankLedgerOfCompany(companyId,callback,ledgerId = 0)
	{
		vm.bankLedgerDrop = [];
		var jsuggestPath = apiPath.getLedgerJrnl+companyId;
		var headerCr = {'Content-Type': undefined,'ledgerGroup':[9]};
		var ledgerData = {};
		apiCall.getCallHeader(jsuggestPath,headerCr).then(function(response3){
			var res3cnt = response3.length;
			for(var t=0;t<res3cnt;t++){
				var innerCnt = response3[t].length;
				for(var k=0;k<innerCnt;k++){
					if (ledgerId != 0){
						if (response3[t][k].ledgerId == ledgerId){
							ledgerData = response3[t][k];
						}
					}
					vm.bankLedgerDrop.push(response3[t][k]);
				}
				if (t == (res3cnt - 1)){
					if (ledgerId != 0){
						callback(ledgerData);
					} else {
						callback(vm.bankLedgerDrop);
					}
				}
			}
		});
	}

	var measurementUnitDropData = [];
	function loadAdvanceMeasurementUnit (callback)
	{
		//Set Advance Measurement Unit
		apiCall.getCall(api_measurementUnit).then( function (response) {
			callback(response);
		});
	}

	loadAdvanceMeasurementUnit(function(advanceRes){
		measurementUnitDropData = advanceRes;
	});


	$scope.enableDisableAdvanceMou = false;
	$scope.enableDisableColor = true;
	$scope.enableDisableVariant = true;
	$scope.enableDisableSize = true;
	$scope.enableDisableFrameNo = true;
	$scope.divTag = true;
	$scope.divAdvanceMou = false;
	$scope.colspanValue = '6';
	$scope.colspanAdvanceValue = '9';
	$scope.colspanExpenseValue = '7';
	$scope.totalTd = '13';
	$scope.ProductColorSizeVarDesign = 'productColorSizeWidth';
	//get setting data
	$scope.getOptionSettingData = function()
	{
		toaster.clear();
		apiCall.getCall(apiPath.settingOption).then(function(response)
		{
			var responseLength = response.length;
			// console.log(response);
			for(var arrayData=0;arrayData<responseLength;arrayData++)
			{
				if(angular.isObject(response) || angular.isArray(response))
				{
					if(response[arrayData].settingType=="product")
					{
						var arrayData1 = response[arrayData];
						$scope.divAdvanceMou = $scope.enableDisableAdvanceMou = arrayData1.productAdvanceMouStatus=="enable" ? true : false;
						$scope.enableDisableColor = arrayData1.productColorStatus=="enable" ? true : false;
						$scope.enableDisableSize = arrayData1.productSizeStatus=="enable" ? true : false;
						$scope.enableDisableVariant = arrayData1.productVariantStatus=="enable" ? true : false;
						$scope.enableDisableFrameNo = arrayData1.productFrameNoStatus=="enable" ? true : false;
						$scope.divTag = $scope.enableDisableColor == false && $scope.enableDisableSize == false ? false : true;
						if ($scope.enableDisableColor && $scope.enableDisableSize && $scope.enableDisableVariant)
						{
							$scope.ProductColorSizeVarDesign = 'productColorSizeVarDesign';
						}else if (($scope.enableDisableColor && $scope.enableDisableSize) || 
								($scope.enableDisableVariant && $scope.enableDisableColor) ||
								($scope.enableDisableVariant && $scope.enableDisableSize)) {
							$scope.ProductColorSizeVarDesign = 'productColorSizeDesign';
						}
						// $scope.colspanValue = $scope.divTag==false ? '5' : '6';
						// $scope.totalTd = $scope.divTag==false ? '12' : '13';
						// $scope.colspanAdvanceValue = $scope.divTag==false ? '8' : '9';
						$scope.colspanExpenseValue = $scope.divTag==false ? '6' : '7';
						if($scope.divTag==false && $scope.enableDisableFrameNo==false)
						{
							if($scope.enableDisableAdvanceMou == true){
								$scope.colspanAdvanceValue = '8';
								$scope.colspanValue = '5';
								$scope.totalTd = '12';
							}
							else{
								$scope.colspanAdvanceValue = '7';
								$scope.colspanValue = '4';
								$scope.totalTd = '11';
								$scope.colspanExpenseValue='5';
							}
						}
						else if($scope.divTag==false || $scope.enableDisableFrameNo==false)
						{
							$scope.colspanAdvanceValue = '8';
							$scope.colspanValue = '5';
							$scope.totalTd = '12';
							$scope.colspanExpenseValue='6';
						}
						else
						{
							$scope.colspanAdvanceValue = '9';
							$scope.colspanValue = '6';
							$scope.totalTd = '13';
							$scope.colspanExpenseValue='7';
						}
					}
				}
			}
		});
	}
	$scope.getOptionSettingData();
	
	$scope.expenseAmount=[];
	$scope.getExpenseValue = function(index)
	{
		var expenseType = vm.AccExpense[index].expenseType;
		var expenseValue = vm.AccExpense[index].expenseValue;
		var totalData=0;
		if(index==0)
		{
			totalData = parseFloat($scope.totalTable_without_expense);
		}
		else
		{
			totalData = parseFloat($scope.expenseAmount[index-1]);
		}
		if(vm.AccExpense[index].expenseOperation=="plus")
		{
			var totalExpense = expenseType=="flat" ? parseFloat(expenseValue)+ parseFloat(totalData) : (((parseFloat(expenseValue)/100)*parseFloat($scope.totalTable_without_expense)) + parseFloat(totalData));
		}
		else
		{
			var totalExpense = expenseType=="flat" ? parseFloat(totalData) - parseFloat(expenseValue) : (parseFloat(totalData) - ((parseFloat(expenseValue)/100)*parseFloat($scope.totalTable_without_expense)));
		}
		$scope.totalTable = $scope.expenseAmount[$scope.expenseAmount.length-1];
		return totalExpense;
	}

	$scope.openExpenseRawData=false;
	//open expense raw
	$scope.openExpenseRaw = function()
	{
		$scope.openExpenseRawData=true;
		$scope.addExpenseRow(-1);
	}
	//Default Company Function
	$scope.defaultComapny = function(){
		
		vm.loadData = true;
		var  response2= apiCall.getDefaultCompanyFilter(vm.companyDrop);

		toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
			
		$scope.purchaseBill.companyDropDown = response2;
		
		formdata.delete('companyId');
		formdata.set('companyId',response2.companyId);
		
		$scope.noOfDecimalPoints = parseInt(response2.noOfDecimalPoints); //Set Decimal
		
		var id = response2.companyId;
		$scope.displayDefaultCompanyName = response2.companyName;
		
		$scope.clientGetAllFunction(id);
		
		//Auto Suggest Product Dropdown data
		vm.productNameDrop = [];
		productFactory.getProductByCompany(id).then(function(data){
			
			vm.productNameDrop = data;
			vm.loadData = false;
			toaster.clear();
		});
		
		//Get Bank Ledger of this Company
		loadBankLedgerOfCompany(id,function(responseBank){
			
		});

		$scope.printButtonType = response2.printType == '' ? 'print':response2.printType;
	
	}
	
	$scope.ReloadAfterSave = function(response2){
		$scope.purchaseBill.companyDropDown = response2;
		formdata.delete('companyId');
		formdata.set('companyId',response2.companyId);
		$scope.noOfDecimalPoints = parseInt(response2.noOfDecimalPoints);
		var id = response2.companyId;
		$scope.clientGetAllFunction(id);
	}
	
	//get Bank
	vm.bankDrop=[];
	bankFactory.getBank().then(function(response){
		var count = response.length;
		while(count--){
			vm.bankDrop.push(response[count].bankName);
		}
	});
	
	/* Table */
	$scope.addRow = function(index){
		
		var plusOne = index+1;
		
		var data = {};	
		data.productId = '';
		data.productName ='';
		data.color ='';
		data.frameNo ='';
		data.discountType ='flat';
		data.discount ='';
		data.price = 0;
		data.qty =1;
		data.amount = '';
		data.size = '';
		data.variant = '';
		//vm.AccBillTable.push(data);
		vm.AccBillTable.splice(plusOne,0,data);
		
		$scope.changeProductArray = true;
		
    };
	$scope.addExpenseRow = function(index){
		
		var plusOne = index+1;
		
		var data = {};
		data.expenseType = 'flat';
		data.expenseOperation = 'plus';
		//vm.AccBillTable.push(data);
		vm.AccExpense.splice(plusOne,0,data);
		$scope.changeProductArray = true;
    };


	$scope.removeExpenseRow = function (idx) {
		vm.AccExpense.splice(idx,1);
		$scope.expenseAmount.splice(idx,1);
		$scope.changeProductArray = true;
		//vm.productTax.splice(idx, 1);
		
		// vm.productHsn.splice(idx,1);
		
		// $scope.changeProductArray = true;
		
		$scope.advanceValueUpdate();
	};
	
	$scope.setProductData = function(item,index)
	{
		
		vm.AccBillTable[index].productId = item.productId;
		vm.productHsn[index] = item.hsn;
		
		var grandPrice = 0;
		var tax;
		
		grandPrice = productArrayFactory.calculate(item.purchasePrice,0,item.wholesaleMargin) + parseFloat(item.wholesaleMarginFlat);
		
		if(item.purchasePrice == 0 || grandPrice == 0){
			
			grandPrice = productArrayFactory.calculate(item.mrp,0,item.margin)  + parseFloat(item.marginFlat);
		}

		//Custom GST
		vm.AccBillTable[index].cgstPercentage = checkGSTValue(item.vat);
		vm.AccBillTable[index].sgstPercentage = checkGSTValue(item.additionalTax);
		vm.AccBillTable[index].igstPercentage = checkGSTValue(item.igst);
	
		vm.AccBillTable[index].price = grandPrice;
		
		/** Color/Size **/
		vm.AccBillTable[index].color = item.color;
		vm.AccBillTable[index].size = item.size;
		vm.AccBillTable[index].variant = item.variant;
		/** End **/

		if ($scope.enableDisableAdvanceMou) 
		{
			vm.measurementUnitDrop[index] = [];
			var unitParams = ['highest','higher','medium','mediumLower','lower','lowest'];
			for (var i = 0; i < unitParams.length; i++) {
				if (i < unitParams.length - 1) {
					if (angular.isObject(item[unitParams[i]+'MeasurementUnit']) && angular.isDefined(item[unitParams[i]+'MeasurementUnit'].measurementUnitId)) {
						item[unitParams[i]+'MeasurementUnit']['measurementUnit'] = unitParams[i];
						vm.measurementUnitDrop[index].push(item[unitParams[i]+'MeasurementUnit']);
					}
				}else{
					if (angular.isObject(item.measurementUnit) && angular.isDefined(item.measurementUnit.measurementUnitId)) {
						item.measurementUnit['measurementUnit'] = unitParams[i];
						vm.measurementUnitDrop[index].push(item.measurementUnit);
					}
				}
			}
			if (item.primaryMeasureUnit == 'lowest') {
				vm.AccBillTable[index].measurementUnit = item.measurementUnit;
			}else{
				vm.AccBillTable[index].measurementUnit = item[item.primaryMeasureUnit+'MeasurementUnit'];
			}
			// vm.measurementUnitDrop[index] = [];
			// if (angular.isObject(item.highestMeasurementUnit)) {
			// 	item.highestMeasurementUnit['measurementUnit'] = 'highest';
			// 	vm.measurementUnitDrop[index].push(item.highestMeasurementUnit);
			// }

			// if (angular.isObject(item.higherMeasurementUnit)) {
			// 	item.higherMeasurementUnit['measurementUnit'] = 'higher';
			// 	vm.measurementUnitDrop[index].push(item.higherMeasurementUnit);
			// }

			// if (angular.isObject(item.measurementUnit)) {
			// 	item.measurementUnit['measurementUnit'] = 'lowest';
			// 	vm.measurementUnitDrop[index].push(item.measurementUnit);
			// }
			// switch(item.primaryMeasureUnit)
			// {
			// 	case 'highest':
			// 		vm.AccBillTable[index].measurementUnit = item.highestMeasurementUnit;
			// 	break;
			// 	case 'higher':
			// 		vm.AccBillTable[index].measurementUnit = item.higherMeasurementUnit;
			// 	break;
			// 	case 'lowest':
			// 		vm.AccBillTable[index].measurementUnit = item.measurementUnit;
			// 	break;
			// 	default:
			// 		vm.AccBillTable[index].measurementUnit = item.measurementUnit;
			// }
			$scope.changeQuantity(index);
		}else{
			$scope.calculateTaxReverse(vm.AccBillTable[index],vm.AccBillTable[index].cgstPercentage,vm.AccBillTable[index].sgstPercentage,vm.AccBillTable[index].igstPercentage);
		}
		
		$scope.changeProductArray = true;
		
		if(!$scope.purchaseBill.EditBillData){
			$scope.advanceValueUpdate();
		}
	}
	var expenseGetApiPath = apiPath.settingExpense;
	$scope.expenseData=[];


	// Get All Expense Call 


	apiCall.getCall(expenseGetApiPath).then(function(response){
		$scope.expenseData = response;
	});
	$scope.changeQuantity = function(index)
	{
		var productId = vm.AccBillTable[index].productId;
		var selectedUnit = vm.AccBillTable[index].measurementUnit;
		var grandPrice;
		productFactory.getSingleProduct(productId).then(function(response)
		{
			if ($scope.enableDisableAdvanceMou) {
				if (selectedUnit.measurementUnit == 'lowest' || selectedUnit.measurementUnit == undefined) {
					grandPrice = parseFloat(response.purchasePrice);
				}else{
					grandPrice = parseFloat(response[selectedUnit.measurementUnit+'PurchasePrice']);
				}
				if (response.taxInclusive == 'inclusive') {
					vm.AccBillTable[index].price = $filter('setDecimal')(grandPrice, $scope.noOfDecimalPoints);
					vm.AccBillTable[index].amount = $filter('setDecimal')(grandPrice * vm.AccBillTable[index].qty,$scope.noOfDecimalPoints);
					$scope.calculateTaxReverseTwo(vm.AccBillTable[index],vm.AccBillTable[index].cgstPercentage,vm.AccBillTable[index].sgstPercentage,vm.AccBillTable[index].igstPercentage,index);
				}else{
					vm.AccBillTable[index].price = $filter('setDecimal')(grandPrice, $scope.noOfDecimalPoints);
					vm.AccBillTable[index].amount = $filter('setDecimal')(grandPrice * vm.AccBillTable[index].qty,$scope.noOfDecimalPoints);
					$scope.calculateTaxReverse(vm.AccBillTable[index],vm.AccBillTable[index].cgstPercentage,vm.AccBillTable[index].sgstPercentage,vm.AccBillTable[index].igstPercentage,index);
				}
			}
		});
	}

	//save expense-name in expense-data
	$scope.setExpenseData = function(item,index)
	{
		vm.AccExpense[index].expenseName = item.expenseName;
		vm.AccExpense[index].expenseId = item.expenseId;
		vm.AccExpense[index].expenseValue = item.expenseValue;
		vm.AccExpense[index].expenseType = item.expenseType;
		vm.AccExpense[index].expenseOperation = 'plus';
		$scope.changeProductArray = true;
	}

	$scope.removeRow = function (idx) {
		vm.AccBillTable.splice(idx,1);
		vm.productHsn.splice(idx,1);
		
		$scope.changeProductArray = true;
		
		$scope.advanceValueUpdate();
	};
	
	// End Table 
	
	//Return right value
	function checkGSTValue(value){
		
		if(angular.isUndefined(value) || value == '' || value == null){
			return 0;
		}
		else{
			return parseFloat(value);
		}
	}
	
	//Total Quantity For Product Table
	$scope.getTotalQuantity = function()
	{
		var total = 0;
		var count = vm.AccBillTable.length;
		for(var i = 0; i < count; i++)
		{
			var product = vm.AccBillTable[i];
			total += parseInt(product.qty);
		}

		return isNaN(total) ? 0 : total;
	}

	$scope.zeroSingleGst = function()
	{
		$scope.purchaseBill.totalCgstPercentage = 0;
		$scope.purchaseBill.totalSgstPercentage = 0;
		$scope.purchaseBill.totalIgstPercentage = 0;
	}

	/* Zero GST when Overall is Arive */
		$scope.zeroGstApply = function()
		{
			var count = vm.AccBillTable.length;
			for(var i = 0; i < count; i++)
			{
				vm.AccBillTable[i].cgstPercentage = 0;
				vm.AccBillTable[i].sgstPercentage = 0;
				vm.AccBillTable[i].igstPercentage = 0;
				$scope.calculateTaxReverse(vm.AccBillTable[i],0,0,0);
			}
			//console.log($scope.totalTable_without_expense);
		}
	/* End */


	//Total Tax For Product Table
	$scope.getTotalTax = function()
	{
		var total = 0;
		var count = vm.AccBillTable.length;
		var getTotalAmount = 0;
		while(count--)
		{
			var product = vm.AccBillTable[count];
			var totaltax = checkGSTValue(product.cgstPercentage) + checkGSTValue(product.sgstPercentage) + checkGSTValue(product.igstPercentage);

			if(product.discountType == 'flat') {
				
				var getAmount = $filter('setDecimal')((product.price*product.qty) - product.discount,$scope.noOfDecimalPoints);
			}
			else{
				var getAmount  =  $filter('setDecimal')((product.price*product.qty)-((product.price*product.qty)*product.discount/100),$scope.noOfDecimalPoints);
			}
			getTotalAmount += getAmount;
			total += productArrayFactory.calculateTax(getAmount,totaltax,0);
		}

		if($scope.purchaseBill.overallDiscountType == 'flat') {
			getTotalAmount =  $filter('setDecimal')(getTotalAmount - checkGSTValue($scope.purchaseBill.overallDiscount),$scope.noOfDecimalPoints);
		}
		else{
			var discount = $filter('setDecimal')(getTotalAmount*checkGSTValue($scope.purchaseBill.overallDiscount)/100,$scope.noOfDecimalPoints);
			getTotalAmount =  getTotalAmount-discount;
		}

		var totalOverallTax = checkGSTValue($scope.purchaseBill.totalCgstPercentage) + checkGSTValue($scope.purchaseBill.totalSgstPercentage) + checkGSTValue($scope.purchaseBill.totalIgstPercentage);

		total += $filter('setDecimal')(getTotalAmount*checkGSTValue(totalOverallTax)/100,$scope.noOfDecimalPoints);

		$scope.purchaseBill.totalCgstAmount =  $filter('setDecimal')(productArrayFactory.calculateTax(getTotalAmount,$scope.purchaseBill.totalCgstPercentage,0),$scope.noOfDecimalPoints);
		$scope.purchaseBill.totalSgstAmount =  $filter('setDecimal')(productArrayFactory.calculateTax(getTotalAmount,$scope.purchaseBill.totalSgstPercentage,0),$scope.noOfDecimalPoints);
		$scope.purchaseBill.totalIgstAmount =  $filter('setDecimal')(productArrayFactory.calculateTax(getTotalAmount,$scope.purchaseBill.totalIgstPercentage,0),$scope.noOfDecimalPoints);

		return total;
	}
	
	$scope.getTotal = function()
	{
		var total = 0;
		var count = vm.AccBillTable.length;
		while(count--){
			var product = vm.AccBillTable[count];
			total += parseFloat(product.amount);
		}
	
		// if(isNaN($scope.purchaseBill.overallDiscount) || $scope.purchaseBill.overallDiscount === '' || $scope.purchaseBill.overallDiscount == 0){
		// 	return total;
		// }	
		
		if($scope.purchaseBill.overallDiscountType == 'flat') {
			total =  $filter('setDecimal')(total - checkGSTValue($scope.purchaseBill.overallDiscount),$scope.noOfDecimalPoints);
		}
		else{
			var discount = $filter('setDecimal')(total*checkGSTValue($scope.purchaseBill.overallDiscount)/100,$scope.noOfDecimalPoints);
			total =  total-discount;
		}

		var getCgst = checkGSTValue($scope.purchaseBill.totalCgstPercentage);
		var getSgst = checkGSTValue($scope.purchaseBill.totalSgstPercentage);
		var getIgst = checkGSTValue($scope.purchaseBill.totalIgstPercentage);
		var TaxSum = getCgst+getSgst+getIgst;

		var gst = $filter('setDecimal')(total*TaxSum/100,$scope.noOfDecimalPoints);
		total += gst;

		if(!isNaN($scope.purchaseBill.extraCharge) && $scope.purchaseBill.extraCharge != ''){
			total+=parseFloat($scope.purchaseBill.extraCharge);
		}
		return total;
	}
	
	/** Tax Calculation **/
	/** For Exclusive Price **/
	
		$scope.calculateTaxReverse = function(item,cgst,sgst,igst){
			
			var getCgst = checkGSTValue(cgst);
			var getSgst = checkGSTValue(sgst);
			var getIgst = checkGSTValue(igst);
			
			if(item.discountType == 'flat') 
			{
				var amount =  $filter('setDecimal')((item.price*item.qty) - item.discount,$scope.noOfDecimalPoints);
				item.cgstAmount =  $filter('setDecimal')(productArrayFactory.calculateTax(amount,getCgst,0),$scope.noOfDecimalPoints);
				item.sgstAmount =  $filter('setDecimal')(productArrayFactory.calculateTax(amount,getSgst,0),$scope.noOfDecimalPoints);
				item.igstAmount =  $filter('setDecimal')(productArrayFactory.calculateTax(amount,getIgst,0),$scope.noOfDecimalPoints);
			}
			else{
				var amount  =  $filter('setDecimal')((item.price*item.qty)-((item.price*item.qty)*item.discount/100),$scope.noOfDecimalPoints);
				item.cgstAmount =  $filter('setDecimal')(productArrayFactory.calculateTax(amount,getCgst,0),$scope.noOfDecimalPoints);
				item.sgstAmount =  $filter('setDecimal')(productArrayFactory.calculateTax(amount,getSgst,0),$scope.noOfDecimalPoints);
				item.igstAmount =  $filter('setDecimal')(productArrayFactory.calculateTax(amount,getIgst,0),$scope.noOfDecimalPoints);
			}
			
			item.amount = $filter('setDecimal')(amount+item.cgstAmount+item.sgstAmount+item.igstAmount,$scope.noOfDecimalPoints);
			
			if(!$scope.purchaseBill.EditBillData){
				$scope.advanceValueUpdate();
			}
		}
		
	/** END **/
	/** Tax Calculation **/
	/** For Inclusive Price **/
	
		$scope.calculateTaxReverseTwo = function(item,cgst,sgst,igst,index){
		
			var getCgst = checkGSTValue(cgst);
			var getSgst = checkGSTValue(sgst);
			var getIgst = checkGSTValue(igst);
			var TaxSum = getCgst+getSgst+getIgst;
			
			vm.AccBillTable[index].price = $filter('setDecimal')(item.amount/ (1+(TaxSum/100)),$scope.noOfDecimalPoints) / parseInt(item.qty);
			
			vm.AccBillTable[index].cgstAmount = $filter('setDecimal')(vm.AccBillTable[index].price * getCgst/100,$scope.noOfDecimalPoints);
			vm.AccBillTable[index].sgstAmount = $filter('setDecimal')(vm.AccBillTable[index].price * getSgst/100,$scope.noOfDecimalPoints);
			vm.AccBillTable[index].igstAmount = $filter('setDecimal')(vm.AccBillTable[index].price * getIgst/100,$scope.noOfDecimalPoints);
			
			if(!$scope.purchaseBill.EditBillData){
				$scope.advanceValueUpdate();
			}
			// $scope.advanceValueUpdate();
		}
		
	/** END **/
	
	$scope.advanceValueUpdate = function(){
		
		setTimeout(function () { // wait until all resources loaded 
			var expenseData;
			if($scope.openExpenseRawData)
			{
				expenseData = $scope.expenseAmount[$scope.expenseAmount.length-1];
			}
			else
			{
				expenseData = $scope.totalTable_without_expense;
			}

			$scope.purchaseBill.advance = $filter('setDecimal')(expenseData,2);
			$scope.$digest();
		 }, 1000);
	}
	
	/* Clear Scan Image Result */
	$scope.countScannedDocumet = 0;
	$scope.clearScannedResult = function(){
		
		if($scope.countScannedDocumet > 0){
			
			var scanCount = $scope.countScannedDocumet;
			for(var delIndex = 0;delIndex < scanCount;delIndex++){
			
				formdata.delete('scanFile['+delIndex+']');
			}
			
			$scope.countScannedDocumet = 0;
		}

	}

	/** Check Update Or Insert Bill **/
	$scope.EditAddBill = function(copyData = ""){
	
		//if(Object.keys(getSetFactory.get()).length){
		if(Object.keys(getSetFactory.get()).length){
			
			var formdata = undefined;
			formdata = new FormData();
			
			$scope.purchaseBill.EditBillData = getSetFactory.get();
			//console.log($scope.purchaseBill.EditBillData);
			getSetFactory.blank();
			
			$scope.clearScannedResult(); // Clear Scanned Document
			vm.disableCompany = false;
			$scope.noOfDecimalPoints = parseInt($scope.purchaseBill.EditBillData.company.noOfDecimalPoints);//decimal points
			
			//get Company
			var companyEditData = $scope.purchaseBill.EditBillData.company;  // For Sync call 
			$scope.displayDefaultCompanyName = companyEditData.companyName;
			
			vm.companyDrop=[];
			apiCall.getCall(apiPath.getAllCompany).then(function(response2){
				vm.companyDrop = response2;
				$scope.purchaseBill.companyDropDown =  companyEditData;		//Company
				if(copyData != 'copy'){
					vm.disableCompany = true;
				}
			});
			
			//Auto Suggest Product Dropdown data
			vm.productNameDrop = [];
			productFactory.getProductByCompany($scope.purchaseBill.EditBillData.company.companyId).then(function(data){
				vm.productNameDrop = data;
			});
			
			//EntryDate
			var getResdate =  $scope.purchaseBill.EditBillData.entryDate;
			var filterDate =  getResdate.split("-").reverse().join("-");
			vm.dt1 = new Date(filterDate);
			
			//Bill Number
			$scope.purchaseBill.billNumber = $scope.purchaseBill.EditBillData.billNumber;
			
			//Set Vendor
			$scope.purchaseBill.ledgerName = $scope.purchaseBill.EditBillData.vendor.ledgerName;
			$scope.purchaseBill.ledgerEditableData = $scope.purchaseBill.EditBillData.vendor;
			
			//Payment Mode
			$scope.purchaseBill.paymentMode = $scope.purchaseBill.EditBillData.paymentMode;
			if($scope.purchaseBill.paymentMode == 'bank' || $scope.purchaseBill.paymentMode == 'card'){
				$scope.purchaseBill.chequeNo = $scope.purchaseBill.EditBillData.checkNumber;
				$scope.purchaseBill.BankName = $scope.purchaseBill.EditBillData.bankName;
				if ($scope.purchaseBill.EditBillData.bankLedgerId != 0) {
					//Get Bank Ledger of this Company
					loadBankLedgerOfCompany($scope.purchaseBill.EditBillData.company.companyId,function(responseBank){
						$scope.purchaseBill.bankLedgerId = responseBank;
					},$scope.purchaseBill.EditBillData.bankLedgerId);
				}
			}
			
			//Document PNG,JPEG etc.
			angular.element("input[type='file']").val(null);
			angular.element(".fileAttachLabel").html('');
			formdata.delete('file[]');
			if(copyData != 'copy'){
				if($scope.purchaseBill.EditBillData.file[0].documentName != '' && $scope.purchaseBill.EditBillData.file[0].documentName != null){
					$scope.purchaseBill.documentData = $scope.purchaseBill.EditBillData.file;
				}
			}
			
			//Remark
			$scope.purchaseBill.remark = $scope.purchaseBill.EditBillData.remark;
			var jsonExpense = angular.fromJson($scope.purchaseBill.EditBillData.expense);
			if(jsonExpense.length>0)
			{
				$scope.openExpenseRawData=true;
				vm.AccExpense = angular.copy(jsonExpense);
			}
			else
			{
				$scope.openExpenseRawData=false;
				vm.AccExpense = [];
			}

			if($scope.enableDisableAdvanceMou)
			{
				if(measurementUnitDropData.length == 0){
					loadAdvanceMeasurementUnit(function(advanceRes){
						measurementUnitDropData = advanceRes;
					});
				}
			}

			//Product Array
			var jsonProduct = angular.fromJson($scope.purchaseBill.EditBillData.productArray);
			vm.AccBillTable = angular.copy(jsonProduct.inventory);
			
			var EditProducArray = angular.copy(jsonProduct.inventory);
			var count = EditProducArray.length;
			var d = 0; // For Overcome Duplication 
			for(var w=0;w<count;w++){
				productFactory.getSingleProduct(EditProducArray[w].productId).then(function(resData){
					/** Tax **/
						vm.AccBillTable[d].productName = resData.productName;
						vm.productHsn[d] = resData.hsn;
						if(!EditProducArray[d].hasOwnProperty('cgstPercentage')){
							vm.AccBillTable[d].cgstPercentage = parseFloat(resData.vat);
							vm.AccBillTable[d].sgstPercentage = parseFloat(resData.additionalTax); // Additional Tax
							$scope.calculateTaxReverse(vm.AccBillTable[d],vm.AccBillTable[d].cgstPercentage,vm.AccBillTable[d].sgstPercentage,0);
						}
						vm.AccBillTable[d].amount = EditProducArray[d].amount;

						if($scope.enableDisableAdvanceMou)
						{
							var tempIndex = d;
							vm.measurementUnitDrop[tempIndex] = [];
							var unitParams = ['highest','higher','medium','mediumLower','lower','lowest'];
							for (var i = 0; i < unitParams.length; i++) {
								if (i < unitParams.length - 1) {
									if (angular.isObject(resData[unitParams[i]+'MeasurementUnit']) && angular.isDefined(resData[unitParams[i]+'MeasurementUnit'].measurementUnitId)) {
										resData[unitParams[i]+'MeasurementUnit']['measurementUnit'] = unitParams[i];
										vm.measurementUnitDrop[tempIndex].push(resData[unitParams[i]+'MeasurementUnit']);
									}
								}else{
									if (angular.isObject(resData.measurementUnit) && angular.isDefined(resData.measurementUnit.measurementUnitId)) {
										resData.measurementUnit['measurementUnit'] = unitParams[i];
										vm.measurementUnitDrop[tempIndex].push(resData.measurementUnit);
									}
								}
							}
							// if (angular.isObject(resData.highestMeasurementUnit)) {
							// 	resData.highestMeasurementUnit['measurementUnit'] = 'highest';
							// 	vm.measurementUnitDrop[tempIndex].push(resData.highestMeasurementUnit);
							// }

							// if (angular.isObject(resData.higherMeasurementUnit)) {
							// 	resData.higherMeasurementUnit['measurementUnit'] = 'higher';
							// 	vm.measurementUnitDrop[tempIndex].push(resData.higherMeasurementUnit);
							// }

							// if (angular.isObject(resData.measurementUnit)) {
							// 	resData.measurementUnit['measurementUnit'] = 'lowest';
							// 	vm.measurementUnitDrop[tempIndex].push(resData.measurementUnit);
							// }
							measurementUnitDropData = vm.measurementUnitDrop[tempIndex];
							
							if(vm.measurementUnitDrop[tempIndex].length == 0)
							{
								loadAdvanceMeasurementUnit(function(advanceRes){
									measurementUnitDropData = advanceRes;
									vm.measurementUnitDrop[tempIndex] = advanceRes;
									vm.AccBillTable[tempIndex].measurementUnit= fetchArrayService.myIndexOfObject(advanceRes,vm.AccBillTable[tempIndex].measurementUnit,'measurementUnitId');
								});
							}
							else{
								vm.measurementUnitDrop[tempIndex] = measurementUnitDropData;
								vm.AccBillTable[tempIndex].measurementUnit= fetchArrayService.myIndexOfObject(measurementUnitDropData,vm.AccBillTable[tempIndex].measurementUnit,'measurementUnitId');
							}
						}

						//$scope.calculateTaxReverseTwo(vm.AccBillTable[d],vm.productTax[d].tax,vm.productTax[d].additionalTax,d);
						d++;
					/** End **/
				});
			}
			
			// Extracharge,Advance
			$scope.purchaseBill.extraCharge = $filter('setDecimal')($scope.purchaseBill.EditBillData.extraCharge,$scope.noOfDecimalPoints); //ExtraCharge
			$scope.purchaseBill.advance = $filter('setDecimal')($scope.purchaseBill.EditBillData.advance,$scope.noOfDecimalPoints); //Advance
			//Total Discount
			$scope.purchaseBill.overallDiscountType = $scope.purchaseBill.EditBillData.totalDiscounttype;
			$scope.purchaseBill.overallDiscount = parseFloat($scope.purchaseBill.EditBillData.totalDiscount) > 0 ? $scope.purchaseBill.EditBillData.totalDiscount : 0;

			//Total Overall Discount
			$scope.purchaseBill.totalCgstPercentage = $scope.purchaseBill.EditBillData.totalCgstPercentage > 0 ? $scope.purchaseBill.EditBillData.totalCgstPercentage : 0;
			$scope.purchaseBill.totalSgstPercentage = $scope.purchaseBill.EditBillData.totalSgstPercentage > 0 ? $scope.purchaseBill.EditBillData.totalSgstPercentage : 0;
			$scope.purchaseBill.totalIgstPercentage = $scope.purchaseBill.EditBillData.totalIgstPercentage > 0 ? $scope.purchaseBill.EditBillData.totalIgstPercentage : 0;
		
			toaster.clear();
			if(copyData == 'copy'){
				$scope.purchaseBill.EditBillData = undefined;
				$scope.changeProductArray = true;
				$scope.changeProductAdvancePrice = true;
			}
		}
		else{
			vm.disableCompany = false;
			
			//get Company
			vm.companyDrop=[];
			apiCall.getCall(apiPath.getAllCompany).then(function(response2){
				vm.companyDrop = response2;
				$scope.defaultComapny();  // Set Default Company and Other Data
			});
			
			//vm.AccBillTable = [];
			vm.AccBillTable = [{"productId":"","productName":"","color":"","frameNo":"","discountType":"flat","price":0,"discount":"","qty":1,"amount":"","size":"","variant":""}];
			vm.AccExpense = [];
			vm.productHsn = [];

			if($scope.enableDisableAdvanceMou)
			{
				if(measurementUnitDropData.length == 0)
				{
					loadAdvanceMeasurementUnit(function(advanceRes){
						measurementUnitDropData = advanceRes;
						vm.measurementUnitDrop[0] = advanceRes;
					});
				}
				else{
					vm.measurementUnitDrop[tempIndex] = measurementUnitDropData;
				}
			}

			
			$scope.purchaseBill.overallDiscountType = 'flat';
		}
	}	
	/** End **/
	
	$scope.EditAddBill();
  
	//Change in Product Table
	$scope.changeProductTable = function(){
		$scope.changeProductArray = true;
		$scope.changeProductAdvancePrice = true;
	}
	
	//Change in Product Advance
	$scope.changeProductAdvance = function(){
		$scope.changeProductAdvancePrice = true;
	}
	
	//Changed date
	$scope.changeBillDate = function(Fname){
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		var  date = new Date(vm.dt1);
		var fdate  = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
		formdata.set(Fname,fdate);
	}
	
	$scope.changeInBill = function(Fname,value) {
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		if(value != "" && value != undefined){
			formdata.set(Fname,value);
		}
  	}
	
	$scope.setVenderId = function(Fname,value){
		$scope.purchaseBill.ledgerEditableData = {};
		$scope.purchaseBill.ledgerEditableData = value;
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		formdata.set(Fname,value.ledgerId);
	}
	
	$scope.changePaymentInBill = function(Fname,value) {
		if(formdata.has(Fname)){
			formdata.delete(Fname);
		}
		formdata.delete('bankName');
		formdata.delete('checkNumber');
		formdata.delete('bankLedgerId');

		if (value != 'bank' && value != 'card') {
			$scope.purchaseBill.BankName = "";
			$scope.purchaseBill.chequeNo = "";
			$scope.purchaseBill.bankLedgerId = "";
		} else {
			$scope.purchaseBill.BankName ? formdata.set('bankName',$scope.purchaseBill.BankName) : '';
			$scope.purchaseBill.chequeNo ? formdata.set('checkNumber',$scope.purchaseBill.chequeNo) : '';
			$scope.purchaseBill.bankLedgerId ? formdata.set('bankLedgerId',$scope.purchaseBill.bankLedgerId.ledgerId) : '';
		}
		formdata.set(Fname,value);
  	}
	
  /* End */
  
	//Change Invoice Number When Company Changed
	$scope.changeCompany = function(item)
	 {
		if(angular.isObject(item)){
			 // if ($scope.formBill.companyDropDown.$touched) {
			vm.loadData = true;
			toaster.clear();
			toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
			
			$scope.noOfDecimalPoints = parseInt(item.noOfDecimalPoints);
			
			//Get Vendors
			$scope.clientGetAllFunction(item.companyId);
			$scope.displayDefaultCompanyName = item.companyName;
			//Auto Suggest Product Dropdown data
			vm.productNameDrop = [];
			productFactory.getProductByCompany(item.companyId).then(function(data){
				vm.productNameDrop = data;
				vm.loadData = false;
				toaster.clear();
			});

			//Get Bank Ledger of this Company
			loadBankLedgerOfCompany(item.companyId,function(responseBank){
				
			});

			vm.AccBillTable = [{"productId":"","productName":"","color":"","frameNo":"","discountType":"flat","price":0,"discount":"","qty":1,"amount":"","size":"","variant":""}];
			vm.productHsn = [];
			$scope.purchaseBill.advance = 0;
			
			$scope.printButtonType = item.printType == '' ? 'print':item.printType;
			
			formdata.delete('companyId');
			formdata.set('companyId',item.companyId);
		}
	}
	
  $scope.disableButton = false;

	$scope.pop = function(generate)
	{
		$scope.disableButton = true;
						
		if($scope.purchaseBill.EditBillData){
			
			formdata.delete('companyId');
			
			toaster.clear();
			toaster.pop('wait', 'Please Wait', 'Data Updating....',600000);
			
			var BillPath = apiPath.postPurchaseBill+'/'+$scope.purchaseBill.EditBillData.purchaseId;
			 if($scope.changeProductArray){
				formdata.set('balance',$scope.purchaseBill.balanceTable);
				 formdata.set('grandTotal',$scope.grandTotalTable);
				 $scope.purchaseBill.advance ? formdata.set('advance',$scope.purchaseBill.advance):formdata.set('advance',0);
			
				formdata.set('total',$scope.totalTable);
				 formdata.set('tax',$scope.purchaseBill.tax);
				
				formdata.delete('extraCharge');
				
				$scope.purchaseBill.extraCharge ? formdata.set('extraCharge',$scope.purchaseBill.extraCharge) : formdata.set('extraCharge',0);
			
				formdata.delete('totalDiscounttype');
				formdata.delete('totalDiscount');
		
				$scope.purchaseBill.overallDiscountType ? formdata.set('totalDiscounttype',$scope.purchaseBill.overallDiscountType):formdata.set('totalDiscounttype','flat');
				$scope.purchaseBill.overallDiscount ? formdata.set('totalDiscount',$scope.purchaseBill.overallDiscount):formdata.set('totalDiscount',0);

				formdata.set('totalCgstPercentage',checkGSTValue($scope.purchaseBill.totalCgstPercentage));
				formdata.set('totalSgstPercentage',checkGSTValue($scope.purchaseBill.totalSgstPercentage));
				formdata.set('totalIgstPercentage',checkGSTValue($scope.purchaseBill.totalIgstPercentage));
			}
		}
		else{
			toaster.clear();
			toaster.pop('wait', 'Please Wait', 'Data Inserting....',600000);
			
			var  date = new Date(vm.dt1);
			var fdate  = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
				
			if(!formdata.has('companyId')){
				formdata.set('companyId',$scope.purchaseBill.companyDropDown.companyId);
			}
			console.log($scope.purchaseBill.ledgerEditableData);
			if(!formdata.has('vendorId')){
				formdata.set('vendorId',$scope.purchaseBill.ledgerEditableData.ledgerId);
			}
			
			!formdata.has('billNumber') ? formdata.set('billNumber',$scope.purchaseBill.billNumber) : '';
			
			if(!formdata.has('entryDate')){
				formdata.set('entryDate',fdate);
			}
			
			 formdata.set('transactionDate',fdate);
			
				if(!formdata.has('paymentMode')){
					formdata.set('paymentMode',$scope.purchaseBill.paymentMode);
				}
				
				 formdata.set('grandTotal',$scope.grandTotalTable);
				 	// console.log($scope.purchaseBill.advance);
				if($scope.purchaseBill.advance){
				
					formdata.set('advance',$scope.purchaseBill.advance);
				}
				else{
					
					formdata.set('advance',0);
				}
				
				formdata.set('balance',$scope.purchaseBill.balanceTable);
				
				var BillPath = apiPath.postPurchaseBill;
			
			
			formdata.set('total',$scope.totalTable);
			formdata.set('tax',$scope.purchaseBill.tax);
			
			formdata.delete('totalDiscounttype');
			formdata.delete('totalDiscount');
			
			$scope.purchaseBill.overallDiscountType ? formdata.set('totalDiscounttype',$scope.purchaseBill.overallDiscountType):formdata.set('totalDiscounttype','flat');
			$scope.purchaseBill.overallDiscount ? formdata.set('totalDiscount',$scope.purchaseBill.overallDiscount):formdata.set('totalDiscount',0);
			
			formdata.set('totalCgstPercentage',checkGSTValue($scope.purchaseBill.totalCgstPercentage));
			formdata.set('totalSgstPercentage',checkGSTValue($scope.purchaseBill.totalSgstPercentage));
			formdata.set('totalIgstPercentage',checkGSTValue($scope.purchaseBill.totalIgstPercentage));
				
			if($scope.purchaseBill.extraCharge){
				
				formdata.delete('extraCharge');
				formdata.set('extraCharge',$scope.purchaseBill.extraCharge);
			}
			else{
				formdata.delete('extraCharge');
				formdata.set('extraCharge',0);
			}
			
			formdata.delete('isDisplay');
			formdata.set('isDisplay','yes');
		}
	 
	 if($scope.changeProductArray){
		 
		 var  date = new Date();
		var tdate  = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
			if(!formdata.has('transactionDate')){
				formdata.set('transactionDate',tdate);
			}
		  
		 //Inventory
		 var json2 = angular.copy(vm.AccBillTable);
		 for(var i=0;i<json2.length;i++){
			angular.forEach(json2[i], function (value,key) {
				var setData = value;
				if(key == 'measurementUnit'){
					if(angular.isObject(value)){
						setData = value.measurementUnitId;
					}
				}
				formdata.set('inventory['+i+']['+key+']',setData);
			});	
		 }
		if(vm.AccExpense.length>0)
		{
			if(vm.AccExpense[0].expenseValue!=0)
			{
				  //copy expense data
				  var json3 = angular.copy(vm.AccExpense);
				
				for(var i=0;i<json3.length;i++){
				 
					angular.forEach(json3[i], function (value,key) {
					
					formdata.set('expense['+i+']['+key+']',value);
					});
				}
			}
		}
	 }
	 
	 formdata.delete('transactionType');
	 formdata.set('transactionType','purchase_tax');
	 
	var headerData = {'Content-Type': undefined};
	if ($scope.purchaseType == 'purchaseOrder') 
	{
		headerData.isPurchaseOrder = "ok";
	}

		apiCall.postCallHeader(BillPath,headerData,formdata).then(function(data){
			
			toaster.clear();
			
			//Delete Inventory Data From Formdata Object
			var json3 = angular.copy(vm.AccBillTable);
			for(var i=0;i<json3.length;i++){
				angular.forEach(json3[i], function (value,key) {
					formdata.delete('inventory['+i+']['+key+']');
				});
			}
			
			var json4 = angular.copy(vm.AccExpense);
			for(var i=0;i<json4.length;i++){
					angular.forEach(json4[i], function (value,key) {
					formdata.delete('expense['+i+']['+key+']');
				});
			}
			
			

			if(!$scope.purchaseBill.EditBillData){
				formdata.delete('entryDate');
			}
			formdata.delete('transactionDate');
			formdata.delete('total');
			formdata.delete('tax');
			formdata.delete('grandTotal');
			formdata.delete('advance');
			formdata.delete('balance');
			formdata.delete('labourCharge');
			formdata.delete('isDisplay');
			
			if(data == apiResponse.ok){
				
				if($scope.purchaseBill.EditBillData){
					toaster.pop('success', 'Title', 'Update Successfully');
				}
				else{
					toaster.pop('success', 'Title', 'Insert Successfully');
				}
				
				$scope.disableButton = false;
				angular.element("input[type='file']").val(null);
				angular.element(".fileAttachLabel").html('');
				formdata.delete('file[]');
				formdata.delete('companyId');
				formdata.delete('billNumber');
				formdata.delete('paymentMode');
				formdata.delete('bankName');
				formdata.delete('checkNumber');
				formdata.delete('remark');
				
				$scope.clearScannedResult();
				
				var companyObject = $scope.purchaseBill.companyDropDown;
				$scope.purchaseBill = [];
				vm.dt1 = new Date();
				$scope.openExpenseRawData=false;
				vm.AccBillTable = [{"productId":"","productName":"","color":"","frameNo":"","discountType":"flat","price":0,"discount":"","qty":1,"amount":"","size":"","variant":""}];
				vm.AccExpense = [];
				
				vm.productHsn = [];
				//vm.cityDrop = [];
				
				$scope.changeProductArray = false;
				$scope.changeProductAdvancePrice = false;
				vm.disableCompany = false; 
				
				$scope.ReloadAfterSave(companyObject);
				
				$scope.purchaseBill.paymentMode = 'cash';
				
				$anchorScroll();
				$("#contactNoSelect").focus();
			}
			else{
				toaster.clear();
				if(apiResponse.noContent == data){
					
					toaster.pop('warning', 'Opps!!', 'Field Not Change');
				}
				else if(data.status == 500){
					toaster.pop('warning', 'Something Wrong', data.statusText);
				}
				else if(data.status == 0){
					toaster.pop('info', 'Check Your Internet Connection');
				}
				else{
					toaster.pop('warning', 'Something Wrong', data);
				}
				 $scope.disableButton = false;
			}
		}).catch(function (reason) {
			 if (reason.status === 500) {
				console.log('Encountered server error');
			 }
		});
	}
 
	$scope.cancel = function(copyData = ""){
		
		if(copyData == 'copy'){
			var CopyBillData = $scope.purchaseBill.EditBillData;
		}
		
		$scope.purchaseBill = [];
		$scope.disableButton = false; 
		$scope.openExpenseRawData=false;
		var formdata = undefined;
		formdata = new FormData();
		
		angular.element("input[type='file']").val(null);
		angular.element(".fileAttachLabel").html('');
		formdata.delete('file[]');
		
			//Delete Inventory Data From Formdata Object
			var json3 = angular.copy(vm.AccBillTable);
			for(var i=0;i<json3.length;i++){
				angular.forEach(json3[i], function (value,key) {
					formdata.delete('inventory['+i+']['+key+']');
				});
			}
			
		formdata.delete('entryDate');
		formdata.delete('billNumber');
		formdata.delete('transactionDate');
		formdata.delete('total');
		formdata.delete('tax');
		formdata.delete('grandTotal');
		formdata.delete('advance');
		formdata.delete('balance');
		formdata.delete('labourCharge');
		formdata.delete('isDisplay');
		formdata.delete('companyId');
		formdata.delete('paymentMode');
		formdata.delete('bankName');
		formdata.delete('checkNumber');
		formdata.delete('remark');
		
		$scope.clearScannedResult();
				
		vm.dt1 = new Date();
		vm.AccBillTable = [{"productId":"","productName":"","color":"","frameNo":"","discountType":"flat","price":0,"discount":"","qty":1,"amount":"","size":"","variant":""}];
		vm.AccExpense = [];
		vm.productHsn = [];
		$scope.purchaseBill.overallDiscountType = 'flat';
		$scope.changeProductArray = false;
		$scope.changeProductAdvancePrice = false;
		vm.disableCompany = false;
		
		if(copyData == 'copy'){
			getSetFactory.set(CopyBillData);
			$scope.EditAddBill('copy');
		}
		else{
			$scope.defaultComapny();
			$scope.purchaseBill.paymentMode = 'cash';
		}
		$("#contactNoSelect").focus();
		$anchorScroll();
	}

	$scope.scannedImageSaveToFormData = function(url,callback){
		var xhr = new XMLHttpRequest();
		  xhr.onload = function() {
			var reader = new FileReader();
			reader.onloadend = function() {
			  callback(reader.result);
			}
			reader.readAsDataURL(xhr.response);
		  };
		  xhr.open('GET', url);
		  xhr.responseType = 'blob';
		  xhr.send();
	}

	//Set Multiple File In Formdata On Change
	$scope.uploadFile = function(files) {
		
		var flag = 0;
		for(var m=0;m<files.length;m++){
			if(parseInt(files[m].size) > maxImageSize){
				flag = 1;
				toaster.clear();
				//toaster.pop('alert','Image Size is Too Long','');
				toaster.pop('alert', 'Opps!!', 'Image Size is Too Long');
				formdata.delete('file[]');
				angular.element("input[type='file']").val(null);
				angular.element(".fileAttachLabel").html('');
				break;
			}
		}
		
		if(flag == 0){
			formdata.delete('file[]');
			angular.forEach(files, function (value,key) {
				formdata.set('file[]',value);
			});
		}
	};
	
	/** Next Previews **/
		$scope.goToNextPrevious = function(nextPre){
			
				toaster.clear();
				if($scope.purchaseBill.companyDropDown){
					
					//Code Start
						toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
						var formdata = new FormData();
						var preHeaderData = {'Content-Type': undefined,'companyId':$scope.purchaseBill.companyDropDown.companyId};
						if ($scope.purchaseType == 'purchaseOrder') 
						{
							preHeaderData.isPurchaseOrder = "ok";
						}
							var Path = apiPath.postPurchaseBill;
							
						if(nextPre == "first" || nextPre == "last"){
							preHeaderData.operation = nextPre;
						}
						else{
							if($scope.purchaseBill.EditBillData){
								if(nextPre == 'next'){
									preHeaderData.nextPurchaseId = $scope.purchaseBill.EditBillData.purchaseId;
								}
								else{
									preHeaderData.previousPurchaseId = $scope.purchaseBill.EditBillData.purchaseId;
								}
							}
							else{
								if(nextPre == 'next'){
									preHeaderData.nextPurchaseId = 0;
								}
								else{
									preHeaderData.previousPurchaseId = 0;
								}
							}
						}
						
						apiCall.getCallHeader(Path,preHeaderData).then(function(response){
							
							if(angular.isArray(response)){
								$scope.purchaseBill = [];
								getSetFactory.set(response[0]);
								$scope.EditAddBill();
								$anchorScroll();
							}
							else
							{
								if(apiResponse.noContent == response){
									toaster.clear();
									toaster.pop('warning', 'Opps!!', 'Data Not Available');
								}
								else if(response.status == 500){
									toaster.clear();
									toaster.pop('warning', 'Something Wrong', response.statusText);
								}
								else{
									toaster.clear();
									toaster.pop('warning', 'Something Wrong', response);
								}
							}
						})
					//End
				}
				else{
					toaster.pop('info', 'please Select Company', '');
				}
		}
	/** End **/
	
	/** Delete Bill **/
	$scope.deleteBill = function(size)
	{
			toaster.clear();
			if (Modalopened) return;
			
			var modalInstance = $modal.open({
				  templateUrl: 'app/views/PopupModal/Delete/deleteDataModal.html',
				  controller: deleteDataModalController,
				  size: size
				});
			
				Modalopened = true;
				
				modalInstance.result.then(function () {
				 
				 var id = $scope.purchaseBill.EditBillData.purchaseId;
			
				 /**Delete Code **/
					var deletePath = apiPath.postPurchaseBill+'/'+id;
				  
					apiCall.deleteCall(deletePath).then(function(deleteres){
						
						if(apiResponse.ok == deleteres){
							
							$scope.cancel();
							toaster.pop('success', 'Title', 'Data Successfully Deleted');
						}
						else{
							toaster.pop('warning', '', deleteres);
						}
					});
		
				 /** End **/
					 Modalopened = false;
					 
				}, function () {
					 Modalopened = false;
				});
		}
  
	/** End Delete Bill **/
	
	/** Invoice **/
		$scope.goInvoiceNumber = function()
		{
			
			toaster.clear();
			if($scope.purchaseBill.searchInvoiceNumber == '' || angular.isUndefined($scope.purchaseBill.searchInvoiceNumber)){
				toaster.pop('error', 'Search Box in Blank');
				return false;
			}
			
			toaster.pop('wait', 'Please Wait', 'Searching...',600000);
			var BillPath = apiPath.PurchaseBillByCompany+$scope.purchaseBill.companyDropDown.companyId;
			var preHeaderData = {'Content-Type': undefined,'billNumber':$scope.purchaseBill.searchInvoiceNumber};
			if ($scope.purchaseType == 'purchaseOrder') 
			{
				preHeaderData.isPurchaseOrder = "ok";
			}

			apiCall.getCallHeader(BillPath,preHeaderData).then(function(response){
				
				toaster.clear();
				if(angular.isArray(response)){

					if(response.length > 1){
						$scope.openBillHistoryModal('lg',response);
					}
					else{
						$scope.purchaseBill = [];
						getSetFactory.set(response[0]);
						$scope.EditAddBill();
						$anchorScroll();
					}
				}
				else{
					if(apiResponse.noContent == response || apiResponse.notFound == response){
						toaster.clear();
						toaster.pop('info', 'Opps!!', 'Data Not Available');
					}
					else if(response.status == 500){
						toaster.clear();
						toaster.pop('warning', 'Something Wrong', response.statusText);
					}
					else{
						toaster.clear();
						toaster.pop('warning', 'Something Wrong', response);
					}
				}
			});
		}
	/** End **/
	
  // Datepicker
  // ----------------------------------- 
	this.minStart = new Date();

  this.today = function() {
    this.dt1 = new Date();
  };
  
	if(!$scope.purchaseBill.EditBillData){
		this.today();
	}

  this.clear = function () {
    //this.dt1 = null;
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
    //this.mytime = null;
  };

  //default value
  this.test1 = new Date();
  
   /** Product Redirect Edit Start **/
	$scope.editProductWithRedirect = function(index){
		
		getSetFactory.blank();
		var id = vm.AccBillTable[index].productId;
		
		productFactory.getSingleProduct(id).then(function(response){
			getSetFactory.set(response);
			$scope.openProduct('lg',index);
		});
	}
  /** Product Redirect Edit **/
  
  $scope.purchaseBill.ledgerEditableData = {};
   /** Ledger Redirect Edit Start **/
	$scope.editLedgerWithRedirect = function(){
		
		getSetFactory.blank();
		if($scope.getLength($scope.purchaseBill.ledgerEditableData) > 0){
			getSetFactory.set($scope.purchaseBill.ledgerEditableData);
			$scope.openLedger('lg');
		}
	}
	
	$scope.getLength = function(obj) {
		return Object.keys(obj).length;
	}
  /** Ledger Redirect Edit **/
  
  /* Ledger Model Start */
	$scope.openLedger = function (size,index = 'purchaseBill') {
	
	if (Modalopened) return;

	if($scope.purchaseBill.companyDropDown){
		
		var modalInstance = $modal.open({
		  templateUrl: 'app/views/PopupModal/Accounting/ledgerModal.html',
		  controller: AccLedgerModalController,
		  size: size,
		  resolve:{
			  ledgerIndex: function(){
				  return index;
			  },
			  companyId: function(){
				return $scope.purchaseBill.companyDropDown;
			  }
		  }
		});
		
		Modalopened = true;
		
		var state = $('#modal-state');
		modalInstance.result.then(function (data) {
			//$scope.clientGetAllFunction(data.index.company_id,data.index.ledger_id);
			if(data.index.hasOwnProperty('getSetLedgerId')){
				var ledId = data.index.getSetLedgerId;
				var ledName = data.index.ledgerName;
				$scope.purchaseBill.ledgerEditableData = {};
			}
			else{
				var ledId = data.index.ledger_id;
				var ledName = data.index.ledger_name;
			}
			$scope.clientGetAllFunction($scope.purchaseBill.companyDropDown.companyId,ledId);
			formdata.delete('vendorId');
			formdata.set('vendorId',ledId);
			$scope.purchaseBill.ledgerName = ledName;
			
			Modalopened = false;
		
		}, function (data) {
			
			Modalopened = false;
		});
	}
	else{
		
		alert('Please Select Company');
	}
  }
  /* Ledger Model End */
  
  /** Product Model Start **/
  $scope.openProduct = function (size,index) {
	
	if (Modalopened) return;
	
	toaster.pop('wait', 'Please Wait', 'popup opening....',600000);
	
	if($scope.purchaseBill.companyDropDown){
		
		var modalInstance = $modal.open({
		  templateUrl: 'app/views/PopupModal/Accounting/productModal.html',
		  controller: 'AccProductModalController as form',
		  size: size,
		  resolve:{
			  productIndex: function(){
				  return index;
			  },
			  companyId: function(){
				return $scope.purchaseBill.companyDropDown;
			  }
		  }
		});

		Modalopened = true;
		
		modalInstance.opened.then(function() {
			toaster.clear();
		});

		modalInstance.result.then(function (data) {
		 
			toaster.clear();
			toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
			
			var companyID = data.companyId;
			var productIndex = data.index;
			
			if(data.hasOwnProperty('productId')){
				var productID = data.productId;
				
				productFactory.setUpdatedProduct(productID).then(function(response){
					if(angular.isObject(response)){
						productFactory.getProductByCompany(companyID).then(function(responseCompayWise){
							vm.productNameDrop = responseCompayWise;
							vm.AccBillTable[data.index].productName = response.productName;
							$scope.setProductData(response,productIndex);
							toaster.clear();
						});
					}
					else{
						toaster.pop('warning', response);
					}
				});
			}
			else{
				var productName = data.productId;
				var color = data.color;
				var size = data.size;
				var variant = data.variant;
				
				productFactory.setNewProduct(companyID,productName,color,size,variant).then(function(response){
					if(angular.isObject(response)){
						productFactory.getProductByCompany(companyID).then(function(responseCompayWise){
							vm.productNameDrop = responseCompayWise;
							vm.AccBillTable[data.index].productName = response.productName;
							$scope.setProductData(response,productIndex);
							toaster.clear();
						});
					}
					else{
						toaster.pop('warning', response);
					}
				});
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
  /** Product Model End **/
	

	$scope.openScanPopup = function(imageUrl){
		
		$templateCache.remove('http://'+window.location.host+'/front-end/app/views/QuickMenu/DocumentScan/DWT_Upload_Download_Demo.html');
		
		 if (Modalopened) return;
		 
		 toaster.pop('wait', 'Please Wait', 'popup opening....',600000);
		 
		var modalInstance = $modal.open({
		  templateUrl: 'app/views/QuickMenu/DocumentScan/DWT_Upload_Download_Demo.html?buster='+Math.random(),
		  controller: documentScanController,
		  size: 'lg',
		  resolve:{
			  imageUrl: function(){
				  return imageUrl;
			  }
		  }
		 // preserveScope: true
		});
		
		Modalopened = true;
		
		modalInstance.opened.then(function() {
			toaster.clear();
		});
		
		modalInstance.result.then(function (data) {
		 
		if(data.length > 0){
		
			  $scope.countScannedDocumet = data.length;
			  
			  var CountImg = data.length;
			  var srNo = 0;
			  
			  for(var ImgIndex = 0;ImgIndex < CountImg;ImgIndex++){
				  
				   var noIndex = ImgIndex;
					 var ImgResponse = data[noIndex];
					  formdata.set("scanFile["+srNo+"]",ImgResponse);
					  srNo++;
			  }
			toaster.pop('success',data.length+' Document Scanned','');
		}
		Modalopened = false;
			
		}, function (data) {
			if(data == "clear"){
				$scope.clearScannedResult();
				toaster.pop('info','Documents Clear','');
				 // DWObject.RemoveAllImages();
			}
			 Modalopened = false; 
		});
		
	}		
	
  $scope.SetBarcodData = function(Bcode){
		var proBarcode = Bcode;
	
			var headerSearch = {'Content-Type': undefined,'productCode':proBarcode};
	
			apiCall.getCallHeader(apiPath.getAllProduct,headerSearch).then(function(response){
				
				var companyId = $scope.purchaseBill.companyDropDown.companyId;
				
				/** Inner Loop **/
					/** Check Product is Already in Array or not **/
					var checkFlag = 0;
						var cnt = vm.AccBillTable.length;
						for(var m=0;m<cnt;m++){
							
							var arrayData = vm.AccBillTable[m];
							
							if(companyId == response.company.companyId){
								
								if(arrayData.productId == response.productId){
									toaster.clear();
									toaster.pop('info', 'Product Already Selected', '');
					
									checkFlag = 1;
									//console.log(arrayData);
									break;
								}
							}
							else{
								
								toaster.clear();
								toaster.pop('info', 'Product has Diffrent Company', '');
								checkFlag = 1;
								break;
							}
							
						}
					/** End Check Product **/
					if(checkFlag == 0){
						
						var barcodeflag = 0;
						var checkCnt = vm.AccBillTable.length;
							for(var cVar=0;cVar<checkCnt;cVar++){
								
								var arrayData = vm.AccBillTable[cVar];
								
								if(arrayData.productId == ""){
									
									vm.AccBillTable[cVar].productName = response.productName;
									//vm.AccBillTable[data.index].productId = response.productId;
									
									$scope.setProductData(response,cVar);
									toaster.clear();
									toaster.pop('success', 'Barcode Scanned', '');
					
									barcodeflag = 1;
									//console.log(arrayData);
									break;
								}
							}
							
							var nextindex = parseInt(cnt)-1;
							if(barcodeflag == 0){
								
								$scope.addRow(nextindex);
								var fatIndex = nextindex+1;
								vm.AccBillTable[fatIndex].productName = response.productName;
								
								$scope.setProductData(response,fatIndex);
								toaster.clear();
								toaster.pop('success', 'Barcode Scanned', '');	
								
								$scope.$digest();
							}
					}
				/** End loop **/
				
			});
		//End Api
  }
  
	$scope.presssuburb = function(event){
		 if(event.target.value.length == 14){
			$scope.SetBarcodData(event.target.value);
		 }
	}
	
	 $scope.DWT_AcquireImage= function()
	 {
			
			scanner.scan(displayImagesOnPage,
            {
            	"use_asprise_dialog": false, // Whether to use Asprise Scanning Dialog
			    "show_scanner_ui": false,
                "output_settings": [
                    {
                        "type": "return-base64",
                        "format": "jpg",
                        "jpeg_quality": "80"
                    }
                ]
            }
        );

			// var DWObject = $window.Dynamsoft.WebTwainEnv.GetWebTwain('dwtcontrolContainer');
			
			// 	 DWObject.RemoveAllImages();
   //           // var DWObject = Dynamsoft.WebTwainEnv;
			// //DWObject.IfDisableSourceAfterAcquire = true; 
			//    var bSelected = DWObject.SelectSource();
				
			// 	if(bSelected){
			// 			DWObject.OpenSource();
			// 			DWObject.IfShowUI = false;
			// 			// DWObject.IfFeederEnabled = true;

			// 			// DWObject.IfAutoFeed = true;

			// 		 DWObject.XferCount = -1;
			// 		//DWObject.PageSize = EnumDWT_CapSupportedSizes.TWSS_USLEGAL;
			// 		// DWObject.Unit = EnumDWT_UnitType.TWUN_INCHES;
			// 		//DWObject.SetImageLayout(0, 0, 5, 5);
			// 		 DWObject.AcquireImage(); //using ADF  for scanning

			// 			DWObject.IfShowFileDialog = false;

			// 			 if (DWObject.ErrorCode != 0) {  
			// 				 alert (DWObject.ErrorString);
			// 			 }
						 
			// 			DWObject.RegisterEvent("OnPostAllTransfers", function () {
			// 				var imageUrl = DWObject.GetImageURL(0);
			// 				if(imageUrl != ''){
			// 					$scope.openScanPopup(imageUrl);
			// 				}
			// 			 });
			// 	}
    }

     /** Processes the scan result */
        function displayImagesOnPage(successful, mesg, response) {
            if(!successful) { // On error
                console.error('Failed: ' + mesg);
                return;
            }

            if(successful && mesg != null && mesg.toLowerCase().indexOf('user cancel') >= 0) { // User cancelled.
                console.info('User cancelled');
                return;
            }

            var scannedImages = scanner.getScannedImages(response, true, false); // returns an array of ScannedImage
            for(var i = 0; (scannedImages instanceof Array) && i < scannedImages.length; i++) {
                var scannedImage = scannedImages[i];
                processScannedImage(scannedImage);
            }
        }

    /** Images scanned so far. */
        var imagesScanned = [];

        /** Processes a ScannedImage */
        function processScannedImage(scannedImage) 
        {
        	// $scope.countScannedDocumet = 1;
        	// formdata.set("scanFile[0]",scannedImage.src);
            var blob = base64ImageToBlob(scannedImage.src);
            $scope.openScanPopup(blob);
        }

        function base64ImageToBlob(str) {
			  // extract content type and base64 payload from original string
			  var pos = str.indexOf(';base64,');
			  var type = str.substring(5, pos);
			  var b64 = str.substr(pos + 8);

			  // decode base64
			  var imageContent = atob(b64);

			  // create an ArrayBuffer and a view (as unsigned 8-bit)
			  var buffer = new ArrayBuffer(imageContent.length);
			  var view = new Uint8Array(buffer);

			  // fill the view, using the decoded base64
			  for(var n = 0; n < imageContent.length; n++) {
			    view[n] = imageContent.charCodeAt(n);
			  }

			  // convert ArrayBuffer to Blob
			  var blob = new Blob([buffer], { type: type });

			  return blob;
			}

	 /** History Modal **/
		
		$scope.openBillHistoryModal = function (size,responseData) {
			
			toaster.clear();
			if (Modalopened) return;
				
				toaster.pop('wait', 'Please Wait', 'Modal Data Loading....',60000);
				
				var modalInstance = $modal.open({
				  templateUrl: 'app/views/PopupModal/QuickMenu/myHistoryPurchaseBillModalContent.html',
				  controller: historySalesBillModaleCtrl,
				  size: size,
				  resolve:{
					  responseData: function(){
						return responseData;
					  },
					  draftOrSalesOrder: function(){
						return 'draft';
					  }
				  }
				});
				
			   Modalopened = true;
			   modalInstance.opened.then(function() {
					toaster.clear();
				});
				modalInstance.result.then(function () {
					toaster.clear();
					Modalopened = false;
					// getSetFactory.set(singleData);
					$scope.EditAddBill();
					$anchorScroll();
				}, function () {
					toaster.clear();
					Modalopened = false;
				});
		};
		/** End History Modal **/
		
		$scope.openInNextTab = function(url){
			$window.open(url,'_blank');
		}
		
		$scope.documentDelete = function(item){
			//alert('here');
			item.ShowConfirm == true ? item.ShowConfirm = false : item.ShowConfirm = true;
		}
		
		$scope.documentDeleteConfirm = function(item,index){
			
			var documentID = item.documentId;
			
			if(documentID == '' || documentID == null || documentID == undefined)
			{
				toaster.pop('error','Document Not Found');
				return false;
			}
			
			var headerData = {'Content-Type': undefined,'type':'purchase-bill'};
			
			apiCall.deleteCallHeader(apiPath.documentDelete+documentID,headerData).then(function(response){
				if(response == apiResponse.ok){
					toaster.pop('success','Document Successfully Deleted');
					$scope.purchaseBill.documentData.splice(index,1);
				}
				else{
					toaster.pop('warning',response);
				}
			});
		}

	$scope.getCurrentFinancialYear = function() 
	{
		  var fiscalyear = "";
		  var today = new Date();
		  if ((today.getMonth() + 1) <= 3) {
		    fiscalyear = (today.getFullYear() - 1) + "-" + today.getFullYear()
		  } else {
		    fiscalyear = today.getFullYear() + "-" + (today.getFullYear() + 1)
		  }
		  return fiscalyear
	}
		
}
PurchaseBillController.$inject = ["$rootScope","$scope","apiCall","apiPath","$http","$window","$modal","purchaseType","validationMessage","productArrayFactory","getSetFactory","toaster","apiResponse","$anchorScroll","maxImageSize","$sce","$templateCache","getLatestNumber","productFactory","$filter","$state","fetchArrayService","bankFactory"];