App.controller('SalesReturnBillController', SalesReturnBillController);
function SalesReturnBillController($rootScope,$scope,apiCall,apiPath,$http,$window,$modal,validationMessage,saleType,productArrayFactory,getSetFactory,toaster,apiResponse,$anchorScroll,maxImageSize,$sce,$templateCache,getLatestNumber,productFactory,stateCityFactory,$filter,$state,clientFactory,fetchArrayService,bankFactory) {
	'use strict';

	var vm = this;
	var formdata = new FormData();
	var Modalopened = false;
	vm.productHsn = [];
	// Scope Define
	$scope.changeProductArray = false; // Change When Update in Product Table Array
	$scope.changeProductAdvancePrice = false;  // Change Advance Price of Product
	$scope.displayDefaultCompanyName = "";
	$scope.quickBill = [];
	$scope.noOfDecimalPoints = 2;
	$scope.saleType = saleType;
	vm.measurementUnitDrop = [];
	$scope.erpPath = $rootScope.erpPath; //Erp Path
	var dateFormats = $rootScope.dateFormats; //Date Format
	$scope.openedItemizeTree = 0;
	vm.serviceDate = new Date();
	vm.paymentModeDrop =['cash','bank','card','credit','neft','rtgs','imps','nach','ach'];
	vm.bankDrop=[];
	$scope.grandTotalTable;
	bankFactory.getBank().then(function(response){
		var count = response.length;
		while(count--){
			vm.bankDrop.push(response[count].bankName);
		}
	});
	// Scope Define End
	// Get Current Financial Year to display
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
	$scope.defaultComapny = function()
	{
		toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);

		vm.loadData = true;
		
		//Set default Company
		var  response2 = apiCall.getDefaultCompanyFilter(vm.companyDrop);
		var id = response2.companyId;
		$scope.displayDefaultCompanyName = response2.companyName;
		
		/* Branch */
		loadBranchesOfCompany(id,function(branchres){
			toaster.clear();
			if(angular.isArray(branchres)){
				if (branchres.length > 0){
					$scope.quickBill.branchId = branchres[0];
					formdata.set('branchId',branchres[0].branchId);
				}
			}
		});
		/* End */

		$scope.quickBill.companyId = response2;
		
		formdata.delete('companyId');
		formdata.set('companyId',response2.companyId);
		$scope.noOfDecimalPoints = parseInt(response2.noOfDecimalPoints);
		// Invoice#
		//Auto Suggest Product Dropdown data
		vm.productNameDrop = [];
		//Get Bank Ledger of this Company

		$scope.printButtonType = response2.printType == '' ? 'print':response2.printType;
	}
	function loadBranchesOfCompany(companyId,callback)
	{
		/* Branch */
		vm.branchDrop = [];
		var getAllBranch = apiPath.getOneBranch+companyId;
			//Get Branch
			apiCall.getCall(getAllBranch).then(function(response4){
				vm.branchDrop = response4;
				callback(response4);
			});
			/* End */
		}
	// Pre Defined Functions ends
	apiCall.getCall(apiPath.getAllCompany).then(function(response2){		
		toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
		vm.companyDrop = response2;
		$scope.defaultComapny();
	});
	$scope.enableDisableAdvanceMou = false;
	$scope.enableDisableColor = false;
	$scope.enableDisableSize = false;
	$scope.enableDisableVariant = false;
	$scope.enableDisableFrameNo = false;

	$scope.enableDisableAddress = false;
	$scope.enableDisableWorkNo = false;
	$scope.enableDisableState = false;
	$scope.enableDisableCity = false;
	$scope.enableDisableEmailId = false;
	$scope.enableDisableProfession = false;
	
	$scope.enableDisableSalesman = false;

	$scope.enableItemizedPurchaseSales = false;
	$scope.enableDisableTaxReadOnly = false;
	$scope.divTag = false;
	$scope.divAdvanceMou = false;
	$scope.colspanValue = '6';
	$scope.colspanAdvanceValue = '7';
	$scope.totalTd = '13';
	$scope.igstDisable=true;
	$scope.csgstDisable=false;
	var settingResponse = [];
	$scope.ProductColorSizeVarDesign = 'productColorSizeWidth';
	//get setting data
	$scope.getOptionSettingData = function(){
		toaster.clear();
		apiCall.getCall(apiPath.settingOption).then(function(response){
			settingResponse = response;
			getSettingData(response);
			$scope.EditAddBill();
		});
	}
	$scope.getOptionSettingData();

	function getSettingData(response)
	{
		var responseLength = response.length;
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
					if($scope.divTag==false && $scope.enableDisableFrameNo==false)
					{
						if($scope.enableDisableAdvanceMou == true){
							$scope.colspanAdvanceValue = '6';
							$scope.colspanValue = '5';
							$scope.totalTd = '12';
						}
						else{
							$scope.colspanAdvanceValue = '5';
							$scope.colspanValue = '4';
							$scope.totalTd = '11';
						}
						
					}
					else if($scope.divTag==false || $scope.enableDisableFrameNo==false)
					{
						$scope.colspanAdvanceValue = '6';
						$scope.colspanValue = '5';
						$scope.totalTd = '12';
					}
					else
					{
						$scope.colspanAdvanceValue = '7';
						$scope.colspanValue = '6';
						$scope.totalTd = '13';
					}
					// $scope.colspanAdvanceValue = $scope.divTag==false ? '6' : '7';
					// $scope.colspanAdvanceValue = $scope.divTag==false && $scope.enableDisableFrameNo==false ? '5' : '6';
				}
				else if(response[arrayData].settingType=="client")
				{
					var arrayData1 = response[arrayData];
					$scope.enableDisableAddress = arrayData1.clientAddressStatus=="enable" ? true : false;
					$scope.enableDisableWorkNo = arrayData1.clientWorkNoStatus=="enable" ? true : false;
					$scope.enableDisableState = arrayData1.clientStateStatus=="enable" ? true : false;
					$scope.enableDisableCity = arrayData1.clientCityStatus=="enable" ? true : false;
					$scope.enableDisableEmailId = arrayData1.clientEmailIdStatus=="enable" ? true : false;
					$scope.enableDisableProfession = arrayData1.clientProfessionStatus=="enable" ? true : false;
					if(arrayData1.clientStateStatus=="disable")
					{
						$scope.quickBill.stateAbb = {};
					}
					if(arrayData1.clientCityStatus=="disable")
					{
						$scope.quickBill.cityId = {};
					}
				}
				else if(response[arrayData].settingType=="bill")
				{
					var arrayData1 = response[arrayData];
					$scope.enableDisableSalesman = arrayData1.billSalesmanStatus=="enable" ? true : false;
					
				}
				else if(response[arrayData].settingType=="inventory")
				{
					var arrayData1 = response[arrayData];
					$scope.enableItemizedPurchaseSales = arrayData1.inventoryItemizeStatus=="enable" ? true : false;
					
                }       
                else if (response[arrayData].settingType=="taxation") 
                {
                    var arrayData1 = response[arrayData];
                    $scope.enableDisableGST = arrayData1.taxationGstStatus=="enable" ? true : false;
                    // console.log('$scope.enableDisableGST',$scope.enableDisableGST);
                }
				else if (response[arrayData].settingType=="advance") 
				{
					var arrayData1 = response[arrayData];
					$scope.enableDisableTaxReadOnly = arrayData1.advanceTaxReadOnlyStatus=="enable" ? true : false;
				}
			}
		}
	}
	/*
	* Advance Qty Pricing Load
	*/
	function loadQuantityPricing (productId,callback)
	{
		//Set Advance Measurement Unit
		apiCall.getCall(apiPath.getAllProduct+'/'+productId+'/quantity-pricing').then( function (response) {
			callback(response);
		});
	}
	/*
	* Search Invoice
	*/
	$scope.goInvoiceNumber = function()
	{
		toaster.clear();
		if($scope.quickBill.searchInvoiceNumber == '' || angular.isUndefined($scope.quickBill.searchInvoiceNumber)){
			toaster.pop('error', 'Search Box in Blank');
			return false;
		}
		toaster.pop('wait', 'Please Wait', 'Searching...',600000);
		
		if($scope.saleType == 'SalesReturn'){
			var BillPath = apiPath.getBill+$scope.quickBill.companyId.companyId;
			var preHeaderData = {'Content-Type': undefined,'invoiceNumber':$scope.quickBill.searchInvoiceNumber};
			preHeaderData.salesType = 'whole_sales';
		}			 
		apiCall.getCallHeader(BillPath,preHeaderData).then(function(response){
			
			toaster.clear();
			if(angular.isArray(response)){
				
				if(response.length > 1){
					$scope.openBillHistoryModal('lg',response);
				}
				else{
					
					$scope.quickBill = [];
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
	/** Barcode Modal Start **/
	$scope.openBarcodeModal = function(size,index){
		if (Modalopened) return;
		toaster.pop('wait', 'Please Wait', 'popup opening....',600000);
		var selectedProduct = vm.AccBillTable[index];
		var modalInstance = $modal.open({
			templateUrl: 'app/views/PopupModal/Accounting/barcodeModal.html',
			controller: 'AccBarcodeModalController as form',
			size: size,
			resolve:{
				productIndex: function(){
					return index;
				},
				productData: function(){
					return selectedProduct;
				},
				companyId: function(){
					return $scope.quickBill.companyId;
				},
				transactionType: function(){
					return 'sales';
				}
			}
		});
		Modalopened = true;

		modalInstance.opened.then(function() {
			toaster.clear();
		});
		modalInstance.result.then(function (data) {
			vm.AccBillTable[index].itemizeDetail = data;
			$scope.changeProductArray = true;
			Modalopened = false;
		},function(){
			Modalopened = false;
		});
	}
  /**
  Barcode Modal End
  **/
  $scope.openBillHistoryModal = function (size,responseData,draftOrSalesOrder) {

  	toaster.clear();
  	if (Modalopened) return;

  	toaster.pop('wait', 'Please Wait', 'Modal Data Loading....',60000);

  	var modalInstance = $modal.open({
  		templateUrl: 'app/views/PopupModal/QuickMenu/myHistorySalesBillModalContent.html',
  		controller: historySalesBillModaleCtrl,
  		size: size,
  		resolve:{
  			responseData: function(){
  				return responseData;
  			},
  			draftOrSalesOrder: function(){
  				return draftOrSalesOrder;
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
  		$scope.EditAddBill();
  		$anchorScroll();
  	}, function () {
  		toaster.clear();
  		Modalopened = false;
  	});
  };
	/*
	* Get Set Invoice Product Data
	*/
	$scope.EditAddBill = function() {
		$scope.openedItemizeTree = 0;
		if(Object.keys(getSetFactory.get()).length) {
			vm.productNameDrop = [];
			vm.AccBillTable = [{"productId":"","productName":"","color":"","frameNo":"","discountType":"flat","price":0,"discount":"","qty":1,"amount":"","size":"","variant":""}];
			vm.productHsn = [];
			if ($scope.enableDisableAdvanceMou) {
				vm.measurementUnitDrop = [];
			}
			vm.loadData = true;
			formdata = undefined;
			formdata = new FormData();
			$scope.quickBill.EditBillData = getSetFactory.get();
			getSetFactory.blank();
			var jsonProduct = angular.fromJson($scope.quickBill.EditBillData.productArray);
			var jsonExpense = angular.fromJson($scope.quickBill.EditBillData.expense);
			$scope.quickBill.paymentMode = 'cash';
			$scope.expenseAmount=[];
			if('expense' in $scope.quickBill.EditBillData)
			{
				if(Array.isArray(jsonExpense))
				{
					if(jsonExpense.length>0)
					{
						$scope.openExpenseRawData=true;
						vm.AccExpense = angular.copy(jsonExpense);
					}
				}		
			}
			else
			{
				$scope.openExpenseRawData=false;
				vm.AccExpense = [];
			}
			stateCityFactory.getState().then(function(response3){
				toaster.clear();
				$scope.quickBill.EditBillData.client.stateName = stateCityFactory.getDefaultState($scope.quickBill.EditBillData.client.stateAbb).stateName;
				if($scope.quickBill.companyId.state.stateAbb==$scope.quickBill.EditBillData.client.stateAbb)
				{
					$scope.igstDisable=true;
					$scope.csgstDisable=false;
					$scope.totalCSgstDisable = false;
					$scope.totalIgstDisable = true;
				}
				else
				{
					$scope.csgstDisable = true;
					$scope.igstDisable = false;
					$scope.totalCSgstDisable = true;
					$scope.totalIgstDisable = false;
					/* End */
				}
				$scope.quickBill.EditBillData.client.cityName = stateCityFactory.getDefaultCity($scope.quickBill.EditBillData.client.cityId).cityName;
			});
			vm.disableCompany = false;
			var setCompanyData = $scope.quickBill.EditBillData.company;
			formdata.set('companyId',setCompanyData.companyId);
			$scope.quickBill.companyId = setCompanyData;
			var editBillAllData = $scope.quickBill.EditBillData;
			formdata.set('branchId',editBillAllData.branch.branchId);
			loadBranchesOfCompany(setCompanyData.companyId,function(branchres) {
				$scope.quickBill.branchId = editBillAllData.branch;
			}); //get All Branches of Company
			vm.productNameDrop = jsonProduct.inventory;
			vm.loadData = false;
		}else{
			vm.disableCompany = false;
			//get Company
			vm.companyDrop=[];
			apiCall.getCall(apiPath.getAllCompany).then(function(response2){
				toaster.clear();
				toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
				vm.companyDrop = response2;
				$scope.defaultComapny();
			});
			$scope.quickBill = [];
			vm.AccBillTable = [{"productId":"","productName":"","color":"","frameNo":"","discountType":"flat","price":0,"discount":"","qty":1,"amount":"","size":"","variant":""}];
			vm.AccExpense = [];
			vm.productHsn = [];
			$scope.quickBill.totalDiscounttype = 'flat';
		}
	};
	/*
	* Set Sold Product data
	*/
	$scope.setProductData = function(item,index) {
		vm.AccBillTable[index] = angular.copy(item);
		if (angular.isArray(item.itemizeDetail)) {
			vm.AccBillTable[index].itemizeDetail = item.itemizeDetail;
		}else if(item.itemizeDetail == ''){
			vm.AccBillTable[index].itemizeDetail = [];
		}else if (angular.isString(item.itemizeDetail)) {
			vm.AccBillTable[index].itemizeDetail = angular.fromJson(item.itemizeDetail);
		}
		if ($scope.enableDisableAdvanceMou) {
			vm.measurementUnitDrop[index] = [];
			productFactory.getSingleProduct(item.productId).then(function(resData){
				// vm.productHsn[index] = resData.hsn;
				var unitParams = ['highest','higher','medium','mediumLower','lower','lowest'];
				for (var i = 0; i < unitParams.length; i++) {
					if (i < unitParams.length - 1) {
						if (angular.isObject(resData[unitParams[i]+'MeasurementUnit']) && angular.isDefined(resData[unitParams[i]+'MeasurementUnit'].measurementUnitId)) {
							resData[unitParams[i]+'MeasurementUnit'].measurementUnit = unitParams[i];
							vm.measurementUnitDrop[index].push(resData[unitParams[i]+'MeasurementUnit']);
							if (item.measurementUnit == resData[unitParams[i]+'MeasurementUnit'].measurementUnitId) {
								vm.AccBillTable[index].measurementUnit = resData[unitParams[i]+'MeasurementUnit'];
							}
						}
					}else{
						if (angular.isObject(resData.measurementUnit) && angular.isDefined(resData.measurementUnit.measurementUnitId)) {
							resData.measurementUnit.measurementUnit = unitParams[i];
							vm.measurementUnitDrop[index].push(resData.measurementUnit);
							if (item.measurementUnit == resData.measurementUnit.measurementUnitId) {
								vm.AccBillTable[index].measurementUnit = resData.measurementUnit;
							}
						}
					}
				}
			});
		}
	}
	//Change in Product Table
	$scope.changeProductTable = function(){
		$scope.changeProductArray = true;
		$scope.changeProductAdvancePrice = true;
	}
	
	//Change in Product Advance
	$scope.changeProductAdvance = function(){
		$scope.changeProductAdvancePrice = true;
	}
	/*
	* Quantity Change
	*/
	$scope.changeQuantity = function(index)
	{
		var productId = vm.AccBillTable[index].productId;

		productFactory.getSingleProduct(productId).then(function(response)
		{
			if ($scope.enableDisableAdvanceMou)
			{
				if (response.taxInclusive == 'inclusive')
				{
					$scope.getAdvanceMouCalculationPrice(response,index, function (responsePrice) {
						var calPrice = responsePrice;
						vm.AccBillTable[index].amount = $filter('setDecimal')(calPrice * vm.AccBillTable[index].qty,$scope.noOfDecimalPoints);
						if(vm.AccBillTable[index].amount == 0){
							vm.AccBillTable[index].amount = $filter('setDecimal')(response.mrp * vm.AccBillTable[index].qty,$scope.noOfDecimalPoints);
                        }
                        if($scope.enableDisableGST){
						$scope.calculateTaxReverseTwo(vm.AccBillTable[index],vm.AccBillTable[index].cgstPercentage,vm.AccBillTable[index].sgstPercentage,vm.AccBillTable[index].igstPercentage,index);
                    }
                });
				}
				else{
					$scope.getAdvanceMouCalculationPrice(response,index, function (responsePrice) {
						vm.AccBillTable[index].price = responsePrice;
						$scope.calculateTaxReverse(vm.AccBillTable[index],vm.AccBillTable[index].cgstPercentage,vm.AccBillTable[index].sgstPercentage,vm.AccBillTable[index].igstPercentage);
					});
				}
			}
			else
			{
				if (response.taxInclusive == 'inclusive')
				{
					vm.AccBillTable[index].amount = $filter('setDecimal')(response.purchasePrice * vm.AccBillTable[index].qty,$scope.noOfDecimalPoints);
					if(vm.AccBillTable[index].amount == 0){
						vm.AccBillTable[index].amount = $filter('setDecimal')(response.mrp * vm.AccBillTable[index].qty,$scope.noOfDecimalPoints);
                    }
                    if($scope.enableDisableGST){
					$scope.calculateTaxReverseTwo(vm.AccBillTable[index],vm.AccBillTable[index].cgstPercentage,vm.AccBillTable[index].sgstPercentage,vm.AccBillTable[index].igstPercentage,index);
                }
            }else{
					$scope.calculateTaxReverse(vm.AccBillTable[index],vm.AccBillTable[index].cgstPercentage,vm.AccBillTable[index].sgstPercentage,vm.AccBillTable[index].igstPercentage);
				}
			}
		});
	}
	/*
	* Advance MOU Calculation
	*/
	$scope.getAdvanceMouCalculationPrice = function(item,index,callback)
	{
		var grandPrice = 0;
		if ($scope.enableDisableAdvanceMou) 
		{
			var defaultMeasure = undefined;
			var selectedMeasure = {};
			if(angular.isObject(vm.AccBillTable[index].measurementUnit))
			{
				selectedMeasure = vm.AccBillTable[index].measurementUnit;
				if(item.primaryMeasureUnit != 'lowest' && item.primaryMeasureUnit != undefined) {
					defaultMeasure = item[item.primaryMeasureUnit+'MeasurementUnit'];
				}else{
					defaultMeasure = item.measurementUnit;
				}
			}
			else
			{
				if(item.primaryMeasureUnit != 'lowest' && item.primaryMeasureUnit != undefined) {
					vm.AccBillTable[index].measurementUnit = item[item.primaryMeasureUnit+'MeasurementUnit'];
					defaultMeasure = item[item.primaryMeasureUnit+'MeasurementUnit'];
					selectedMeasure = item[item.primaryMeasureUnit+'MeasurementUnit'];
					grandPrice = productArrayFactory.calculate(item[item.primaryMeasureUnit+'PurchasePrice'],0,item.wholesaleMargin) + parseFloat(item.wholesaleMarginFlat);
				}else{
					vm.AccBillTable[index].measurementUnit = item.measurementUnit;
					defaultMeasure = item.measurementUnit;
					selectedMeasure = item.measurementUnit;
					grandPrice = productArrayFactory.calculate(item.purchasePrice,0,item.wholesaleMargin) + parseFloat(item.wholesaleMarginFlat);
				}
			}
			if(item.measurementUnit == null){
				vm.AccBillTable[index].measurementUnit = undefined;
			}
			var check_default_and_selected_flag = 0;

			if (angular.isObject(defaultMeasure) && angular.isObject(selectedMeasure)) { 

				if (Object.keys(defaultMeasure).length && Object.keys(selectedMeasure).length) {

					if (selectedMeasure.measurementUnitId == defaultMeasure.measurementUnitId) {

						check_default_and_selected_flag = 1;
					}else{
						check_default_and_selected_flag = 0;
					}
				}
			}
			var primaryMeasure = item.primaryMeasureUnit;
			if(!check_default_and_selected_flag)
			{
				if (angular.isObject(selectedMeasure))
				{
					if (Object.keys(selectedMeasure).length) 
					{
						primaryMeasure = selectedMeasure.measurementUnit;
					}
				}
			}
			if(primaryMeasure != 'lowest' && primaryMeasure != undefined) {
				vm.AccBillTable[index].measurementUnit = item[primaryMeasure+'MeasurementUnit'];
				vm.AccBillTable[index].measurementUnit.measurementUnit = primaryMeasure;
				grandPrice = productArrayFactory.calculate(item[primaryMeasure+'PurchasePrice'],0,item.wholesaleMargin) + parseFloat(item.wholesaleMarginFlat);
			}else{
				vm.AccBillTable[index].measurementUnit = item.measurementUnit;
				vm.AccBillTable[index].measurementUnit.measurementUnit = primaryMeasure;
				grandPrice = productArrayFactory.calculate(item.purchasePrice,0,item.wholesaleMargin) + parseFloat(item.wholesaleMarginFlat);
			}

			if (check_default_and_selected_flag) {
				loadQuantityPricing(item.productId,function (response)
				{
					vm.AccBillTable[index].realQtyData = parseFloat(item[selectedMeasure.measurementUnit+'MouConv']) * parseInt(vm.AccBillTable[index].qty);
					if(angular.isArray(response))
					{
						var flagPricing = 0;
						var salesPrice = 0;
						if(response.length > 0)
						{
							var qtyIndex = 0;
							var qtyCount = response.length;
							while(qtyIndex < qtyCount)
							{
								var singlePricing = response[qtyIndex];
								var userQty = parseInt(vm.AccBillTable[index].qty);
								if(userQty >= parseInt(singlePricing.fromQty) && userQty <= parseInt(singlePricing.toQty))
								{
									flagPricing = 1;
									salesPrice = singlePricing.salesPrice;
									break;
								}
								qtyIndex++;
							}
						}

						if (flagPricing) {
							grandPrice = productArrayFactory.calculate(salesPrice,0,0);
						}
					}
					callback(grandPrice);
				});
			}
			else{
				loadQuantityPricing(item.productId,function (response)
				{
					var inpQty = parseInt(vm.AccBillTable[index].qty);
					var userQtyConverted = 1;
					userQtyConverted = parseFloat(item[selectedMeasure.measurementUnit+'MouConv']);
					vm.AccBillTable[index].realQtyData = userQtyConverted * inpQty;
					if(angular.isArray(response))
					{
						var flagPricing = 0;
						var salesPrice = 0;
						if(response.length > 0)
						{
							var qtyIndex = 0;
							var qtyCount = response.length;
							while(qtyIndex < qtyCount)
							{
								var singlePricing = response[qtyIndex];
								var userQty = inpQty * userQtyConverted;
								if(userQty >= parseInt(singlePricing.fromQty) && userQty <= parseInt(singlePricing.toQty))
								{
									flagPricing = 1;
									salesPrice = singlePricing.salesPrice * userQtyConverted;
									break;
								}
								if (qtyIndex == qtyCount - 1) {
									if(userQty >= parseInt(singlePricing.toQty))
									{
										flagPricing = 1;
										salesPrice = singlePricing.salesPrice * userQtyConverted;
										break;
									}
								}
								qtyIndex++;
							}
						}

						if (flagPricing) {
							grandPrice = productArrayFactory.calculate(salesPrice,0,0);
						}
					}
					callback(grandPrice);
				});
			}
		} // IF Adavande MOU
		else {
			callback(grandPrice);
		}
	}
		// End Table 

		function checkGSTValue(value){

			if(angular.isUndefined(value) || value == '' || isNaN(value)){
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
		if (angular.isArray(vm.AccBillTable)) {
			var count = vm.AccBillTable.length;
			for(var i = 0; i < count; i++)
			{
				var product = vm.AccBillTable[i];
				total += parseInt(product.qty);
			}
		}
		return isNaN(total) ? 0 : total;
	}

	$scope.zeroSingleGst = function()
	{
		$scope.quickBill.totalCgstPercentage = 0;
		$scope.quickBill.totalSgstPercentage = 0;
		$scope.quickBill.totalIgstPercentage = 0;
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
	}
	/* End */

	//Total Tax For Product Table
	$scope.getTotalTax = function()
	{
		var total = 0;
		if (angular.isArray(vm.AccBillTable)) {
			var count = vm.AccBillTable.length;
			var getTotalAmount = 0;
			var totalCessAmount = 0;
			for(var i = 0; i < count; i++)
			{
				var cessAmount = 0;
				var product = vm.AccBillTable[i];
				// var vartax = vm.productTax[i];
				var totaltax = checkGSTValue(product.cgstPercentage) + checkGSTValue(product.sgstPercentage) + checkGSTValue(product.igstPercentage);
				if(product.discountType == 'flat') {
					var getAmount = $filter('setDecimal')((product.price*product.qty) - product.discount,$scope.noOfDecimalPoints);
				}
				else{
					var getAmount  =  $filter('setDecimal')((product.price*product.qty)-((product.price*product.qty)*product.discount/100),$scope.noOfDecimalPoints);
				}

				getTotalAmount += getAmount;
				if (angular.isDefined(product.cessAmount)) {
					cessAmount = product.cessAmount;
				}
				total += productArrayFactory.calculateTax(getAmount,totaltax,0) + parseFloat(cessAmount);
			}
		}
		

		if($scope.quickBill.totalDiscounttype == 'flat') {
			getTotalAmount =  $filter('setDecimal')(getTotalAmount - checkGSTValue($scope.quickBill.totalDiscount),$scope.noOfDecimalPoints);
		}
		else{
			var discount = $filter('setDecimal')(getTotalAmount*checkGSTValue($scope.quickBill.totalDiscount)/100,$scope.noOfDecimalPoints);
			getTotalAmount =  getTotalAmount-discount;
		}

		var totalOverallTax = checkGSTValue($scope.quickBill.totalCgstPercentage) + checkGSTValue($scope.quickBill.totalSgstPercentage) + checkGSTValue($scope.quickBill.totalIgstPercentage);

		total += $filter('setDecimal')(getTotalAmount*checkGSTValue(totalOverallTax)/100,$scope.noOfDecimalPoints);

		$scope.quickBill.totalCgstAmount =  $filter('setDecimal')(productArrayFactory.calculateTax(getTotalAmount,$scope.quickBill.totalCgstPercentage,0),$scope.noOfDecimalPoints);
		$scope.quickBill.totalSgstAmount =  $filter('setDecimal')(productArrayFactory.calculateTax(getTotalAmount,$scope.quickBill.totalSgstPercentage,0),$scope.noOfDecimalPoints);
		$scope.quickBill.totalIgstAmount =  $filter('setDecimal')(productArrayFactory.calculateTax(getTotalAmount,$scope.quickBill.totalIgstPercentage,0),$scope.noOfDecimalPoints);
		return total;
	}
	
	$scope.getTotal = function()
	{
		var total = 0;
		if (angular.isArray(vm.AccBillTable)) {
			var count = vm.AccBillTable.length;
			while(count--) {
				var product = vm.AccBillTable[count];
				total += parseFloat(product.amount);
			}
		}
		
		if($scope.quickBill.totalDiscounttype == 'flat') {
			total =  $filter('setDecimal')(total - checkGSTValue($scope.quickBill.totalDiscount),$scope.noOfDecimalPoints);
		}
		else{
			var discount = $filter('setDecimal')(total*checkGSTValue($scope.quickBill.totalDiscount)/100,$scope.noOfDecimalPoints);
			total =  total-discount;
		}

		var getCgst = checkGSTValue($scope.quickBill.totalCgstPercentage);
		var getSgst = checkGSTValue($scope.quickBill.totalSgstPercentage);
		var getIgst = checkGSTValue($scope.quickBill.totalIgstPercentage);
		var TaxSum = getCgst+getSgst+getIgst;

		var gst = $filter('setDecimal')(total*TaxSum/100,$scope.noOfDecimalPoints);
		total += gst;

		if(!isNaN($scope.quickBill.extraCharge) && $scope.quickBill.extraCharge != ''){
			total+=parseFloat($scope.quickBill.extraCharge);
		}	
		return total;
		
	}
	/** Tax Calculation **/
	
	$scope.calculateTaxReverse = function(item,cgst,sgst,igst)
	{
		var getCgst = checkGSTValue(cgst);
		var getSgst = checkGSTValue(sgst);
		var getIgst = checkGSTValue(igst);
		var amount = 0;
		var getCess = checkGSTValue(item.cessPercentage);
		var getFlatCess = 0;
		if (item.hasOwnProperty('realQtyData') && angular.isDefined(item.realQtyData) && item.realQtyData != 'undefined') {
			getFlatCess = parseFloat(parseFloat(item.realQtyData) * parseFloat(item.cessFlat));
		}else{
			getFlatCess = parseFloat(item.qty) * parseFloat(item.cessFlat);
		}
		if (isNaN(getFlatCess)) {
			getFlatCess = 0;
		}
		if(item.discountType == 'flat') {
			amount =  $filter('setDecimal')((item.price*item.qty) - item.discount,$scope.noOfDecimalPoints);
		}
		else{
			amount  =  $filter('setDecimal')((item.price*item.qty)-((item.price*item.qty)*item.discount/100),$scope.noOfDecimalPoints);
		}
		item.cessAmount = $filter('setDecimal')((amount*getCess/100)+getFlatCess,$scope.noOfDecimalPoints);
		if($scope.igstDisable)
		{
			item.cgstAmount =  $filter('setDecimal')(productArrayFactory.calculateTax(amount,getCgst,0),$scope.noOfDecimalPoints);
			item.sgstAmount =  $filter('setDecimal')(productArrayFactory.calculateTax(amount,getSgst,0),$scope.noOfDecimalPoints);
			item.igstAmount =  0;
		}
		else{
			item.cgstAmount =  0;
			item.sgstAmount =  0;
			item.igstAmount =  $filter('setDecimal')(productArrayFactory.calculateTax(amount,getIgst,0),$scope.noOfDecimalPoints);
		}
		item.amount = $filter('setDecimal')(amount+item.cgstAmount+item.sgstAmount+item.igstAmount+item.cessAmount,$scope.noOfDecimalPoints);
	}
	/** END **/
	
	
	/** Tax Calculation **/
	
	$scope.calculateTaxReverseTwo = function(item,cgst,sgst,igst,index)
	{
		var getCgst = checkGSTValue(cgst);
		var getSgst = checkGSTValue(sgst);
		var getIgst = checkGSTValue(igst);
		var getCess = checkGSTValue(item.cessPercentage);
		var getFlatCess = 0;
		if (item.hasOwnProperty('realQtyData') && angular.isDefined(item.realQtyData) && item.realQtyData != 'undefined') {
			getFlatCess = parseFloat(item.realQtyData * item.cessFlat);
		}else{
			getFlatCess = item.qty * item.cessFlat;
		}
		if (isNaN(getFlatCess)) {
			getFlatCess = 0;
		}
		var TaxSum = getCgst+getSgst+getIgst+getCess;
		vm.AccBillTable[index].price = $filter('setDecimal')(((item.amount-getFlatCess)/ (1+(TaxSum/100))) / parseInt(item.qty),$scope.noOfDecimalPoints);
		vm.AccBillTable[index].cgstAmount = $filter('setDecimal')(vm.AccBillTable[index].price * getCgst/100,$scope.noOfDecimalPoints);
		vm.AccBillTable[index].sgstAmount = $filter('setDecimal')(vm.AccBillTable[index].price * getSgst/100,$scope.noOfDecimalPoints);
		vm.AccBillTable[index].igstAmount = $filter('setDecimal')(vm.AccBillTable[index].price * getIgst/100,$scope.noOfDecimalPoints);
		vm.AccBillTable[index].cessAmount = $filter('setDecimal')((vm.AccBillTable[index].price * getCess/100)+getFlatCess,$scope.noOfDecimalPoints);
		
		if(!$scope.quickBill.EditBillData){
			$scope.advanceValueUpdate();
		}
		// $scope.advanceValueUpdate();
	}
	/** END **/
	$scope.pop = function(generate)
	{
		$scope.disableButton = true;
		if (angular.isDefined($scope.quickBill.EditBillData.saleId) && $scope.quickBill.EditBillData.saleId != 'undefined') {
			toaster.pop('wait', 'Please Wait', 'Data Inserting....',600000);
			var  date = new Date(vm.dt1);
			var fdate  = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
			if (!formdata.has('entryDate')) {
				formdata.set('entryDate',fdate);
			}
			formdata.set('transactionDate',fdate);
			var productJson = angular.copy(vm.AccBillTable);
			for (var i = 0; i < productJson.length; i++) {
				angular.forEach(productJson[i], function (value,key) {
					var setData = value;
					if(key == 'measurementUnit'){
						if(angular.isObject(value)){
							setData = value.measurementUnitId;
						}
					}
					if (key == 'itemizeDetail') {
						setData = JSON.stringify(value);
					}
					formdata.set('inventory['+i+']['+key+']',setData);
				});
			}
			if(vm.AccExpense.length>0)
			{
				if(vm.AccExpense[0].expenseValue!=0)
				{
					var json3 = angular.copy(vm.AccExpense);

					for(var i=0;i<json3.length;i++){

						angular.forEach(json3[i], function (value,key) {
							
							formdata.set('expense['+i+']['+key+']',value);
						});

					}
				}
			}
			formdata.set('grandTotal',$scope.grandTotalTable);
			formdata.set('saleId',$scope.quickBill.EditBillData.saleId);
			formdata.set('invoiceNumber',$scope.quickBill.EditBillData.invoiceNumber);
			formdata.set('clientId',$scope.quickBill.EditBillData.client.clientId);
			formdata.set('contactNo',$scope.quickBill.EditBillData.client.contactNo);
			formdata.set('total',$scope.total);
			formdata.set('advance',$scope.quickBill.advance);
			formdata.set('balance',$scope.quickBill.balance);
			if (!formdata.has('paymentMode')) {
				formdata.set('paymentMode',$scope.quickBill.paymentMode);
			}
			formdata.set('tax',$scope.quickBill.tax);
			formdata.delete('totalDiscounttype');
			formdata.delete('totalDiscount');
			$scope.quickBill.totalDiscounttype ? formdata.set('totalDiscounttype',$scope.quickBill.totalDiscounttype):formdata.set('totalDiscounttype','flat');
			$scope.quickBill.totalDiscount ? formdata.set('totalDiscount',$scope.quickBill.totalDiscount):formdata.set('totalDiscount',0);
			formdata.set('totalCgstPercentage',checkGSTValue($scope.quickBill.totalCgstPercentage));
			formdata.set('totalSgstPercentage',checkGSTValue($scope.quickBill.totalSgstPercentage));
			formdata.set('totalIgstPercentage',checkGSTValue($scope.quickBill.totalIgstPercentage));
			if($scope.quickBill.extraCharge){
				formdata.delete('extraCharge');
				formdata.set('extraCharge',$scope.quickBill.extraCharge);
			}
			else{
				formdata.delete('extraCharge');
				formdata.set('extraCharge',0);
			}
			var headerData = {'Content-Type': undefined};
			headerData.type = 'sales_return';
			apiCall.postCallHeader(apiPath.postSalesReturn+$scope.quickBill.EditBillData.saleId,headerData,formdata).then(function(response){
				if(apiResponse.ok == response){
					$state.go($state.current, {}, {reload: true});
					toaster.pop('success', 'Data Inserted!!');
				}
				else{
					toaster.pop('warning', 'Opps!!', response);
				}
			});
		}else{
			toaster.pop('info', 'No Sales Bill Selected to Accept Return on.');
			$scope.disableButton = false;
		}
	}
	/*
	* change of company
	*/
	//Change Invoice Number When Company Changed
	$scope.changeCompany = function(item)
	{		
		if(angular.isObject(item)){
			vm.loadData = true;
			toaster.clear();
			toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
			
			loadBranchesOfCompany(item.companyId,function(branchres){
				formdata.delete('branchId');
				if(angular.isArray(branchres)){
					if (branchres.length > 0){
						$scope.quickBill.branchId = branchres[0];
						formdata.set('branchId',branchres[0].branchId);
					}
				}
			}); //Get Branches of Selected Company
			$scope.noOfDecimalPoints = parseInt(item.noOfDecimalPoints);
			$scope.displayDefaultCompanyName = item.companyName;
			vm.productNameDrop = [];
			vm.AccBillTable = [{"productId":"","productName":"","color":"","frameNo":"","discountType":"flat","price":0,"discount":"","qty":1,"amount":"","size":"","variant":""}];
			vm.productHsn = [];
			if ($scope.enableDisableAdvanceMou) {
				vm.measurementUnitDrop = [];
			}
			$scope.quickBill.advance = 0;
			
			$scope.printButtonType = item.printType == '' ? 'print':item.printType;
			
			formdata.delete('companyId');
			formdata.set('companyId',item.companyId);
		}
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
	$scope.itemizeTreeIcon = function(index){
		if (index == $scope.openedItemizeTree) {
			return 'fa-minus-circle';
		}else{
			return 'fa-plus-circle';
		}
	}
	$scope.openedItemizeTreeClass = function(index){
		if (index == $scope.openedItemizeTree) {
			return '';
		}else{
			return 'hidden';
		}
	}
	$scope.expandItemizeTree = function(index){
		if (index == $scope.openedItemizeTree) {
			$scope.openedItemizeTree = 0;
		}else{
			$scope.openedItemizeTree = index;
		}
	}
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
		vm.AccBillTable.splice(plusOne,0,data);
		$scope.changeProductArray = true;
	};
	$scope.removeRow = function (idx) {
		vm.AccBillTable.splice(idx,1);
		vm.productHsn.splice(idx,1);
		$scope.changeProductArray = true;
		$scope.advanceValueUpdate();
	};
	$scope.openExpenseRawData=false;
	$scope.openExpenseRaw = function()
	{
		$scope.openExpenseRawData=true;
		$scope.addExpenseRow(-1);
	}
	$scope.addExpenseRow = function(index){
		
		var plusOne = index+1;
		var data = {};
		data.expenseType = 'flat';
		data.expenseOperation = 'plus';
		vm.AccExpense.splice(plusOne,0,data);
		$scope.changeProductArray = true;
	};
	$scope.removeExpenseRow = function (idx) {
		vm.AccExpense.splice(idx,1);
		$scope.expenseAmount.splice(idx,1);
		$scope.changeProductArray = true;
		$scope.advanceValueUpdate();
	};
	$scope.advanceValueUpdate = function(){
		
		setTimeout(function () { // wait until all resources loaded 
			var expenseData;
			if($scope.openExpenseRawData)
			{
				expenseData = $scope.expenseAmount[$scope.expenseAmount.length-1];
			}
			else
			{
				expenseData = $scope.total_without_expense;
			}
			$scope.quickBill.advance = $filter('setDecimal')(expenseData,2);
			$scope.$digest();
		}, 1000);
	}
	$scope.changePaymentInBill = function(Fname,value) {
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		formdata.delete('bankName');
		formdata.delete('checkNumber');
		formdata.delete('bankLedgerId');

		if(value == 'cash' || value == 'credit') {
			$scope.quickBill.bankName = "";
			$scope.quickBill.checkNumber = "";
			$scope.quickBill.bankLedgerId = "";
		} else {
			$scope.quickBill.bankName ? formdata.set('bankName',$scope.quickBill.bankName) : '';
			$scope.quickBill.chequeNo ? formdata.set('checkNumber',$scope.quickBill.chequeNo) : '';
			$scope.quickBill.bankLedgerId ? formdata.set('bankLedgerId',$scope.quickBill.bankLedgerId.ledgerId) : '';
		}
		formdata.set(Fname,value);
	}
	$scope.changeInBill = function(Fname,value) {

		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		if(value != "" && value != undefined){
			if(Fname=="userId")
			{
				formdata.set(Fname,value.userId);
			}
			else
			{
				formdata.set(Fname,value);
			}
		}
	}

	// Datepicker
  // ----------------------------------- 
  this.minStart = new Date();

  this.today = function() {
  	this.dt1 = new Date();
  };
  
  if(!$scope.quickBill.EditBillData){

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

this.openStartServiceDate = function($event) {

	$event.preventDefault();
	$event.stopPropagation();

	this.openedStartServiceDate = true;
};

this.dateOptions = {
	formatYear: 'yy',
	startingDay: 1
};

this.dateOptions2 = {
	formatYear: 'yy',
	startingDay: 1
};

this.initDate = new Date('2016-15-20');
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
  };

  this.clear = function() {
    //this.mytime = null;
};

  // Input mask
  // ----------------------------------- 

  this.testoption = {
  	"mask": "99-9999999",
  	"oncomplete": function () {
  	},
  	"onKeyValidation": function () {
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

SalesReturnBillController.$inject = ["$rootScope","$scope","apiCall","apiPath","$http","$window","$modal","validationMessage","saleType","productArrayFactory","getSetFactory","toaster","apiResponse","$anchorScroll","maxImageSize","$sce","$templateCache","getLatestNumber","productFactory","stateCityFactory","$filter","$state","clientFactory","fetchArrayService","bankFactory"];