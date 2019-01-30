
/**=========================================================
 * Module: AddBranchController.js
 * Controller for input components
 =========================================================*/

App.controller('AddInvProductController', AddInvProductController);

function AddInvProductController($scope,toaster,$filter,apiCall,apiPath,$stateParams,$state,apiResponse,validationMessage,getSetFactory,$modal,productFactory,fetchArrayService,maxImageSize) {
  'use strict';
  
  var vm = this;
  $scope.addInvProduct = [];
  var formdata = new FormData();
  var Modalopened = false;

  var api_measurementUnit = apiPath.settingMeasurementUnit;
  var api_quantity_pricing = apiPath.getAllProduct+'/';
  var api_product_document = apiPath.getAllProduct;
  vm.measureUnitTable = [{fromQty : 1 , toQty : 1, salesPrice : 0}];
  $scope.changeMeasureUnitTableArray = false;
	/* VALIDATION */
	
	$scope.errorMessage = validationMessage; //Error Messages In Constant
	$scope.defaultHighestPrice = 0;
	$scope.defaultHigherPrice = 0;
	$scope.defaultLowestPrice = 0;
	$scope.noOfDecimalPoints = 2;
	/* VALIDATION END */
	
  // Chosen data
  // ----------------------------------- 
		
  this.measureUnitDrop = [
    'piece',
    'pair'
  ];
  // this.advanceMeasureUnitDrop = [
  //   'Gram',
  //   'Kg',
  //   'Litre',
  //   'Miligram',
  //   'Piece',
  //   'Pair',
  //   'Dozen'
  // ]; 
  this.advanceMeasureUnitDrop = [];

  this.productTypeDrop = [
    'product',
    'accessories',
    'service'
  ];
  this.bestBeforeDrop = [
    'day',
    'month',
    'year'
  ];
	
	
	
	$scope.defaultCompany  = function(){
			
		//Set default Company
		apiCall.getCall(apiPath.getAllCompany).then(function(response){
		
			$scope.addInvProduct.company = apiCall.getDefaultCompanyFilter(response);
			
			vm.branchDrop = [];
			var getAllBranch = apiPath.getOneBranch+$scope.addInvProduct.company.companyId;
			//Get Branch
			apiCall.getCall(getAllBranch).then(function(response4){
				vm.branchDrop = response4;
			});
			
			formdata.append('companyId',$scope.addInvProduct.company.companyId);
			$scope.noOfDecimalPoints = $scope.addInvProduct.company.noOfDecimalPoints;
		});

		
		loadAdvanceMeasurementUnit(function(response){
			vm.advanceMeasureUnitDrop = response;
		});

	}
		
	function loadAdvanceMeasurementUnit (callback)
	{
		//Set Advance Measurement Unit
		apiCall.getCall(api_measurementUnit).then( function (response) {
			callback(response);
		});
	}

	function loadProductDocuments (productId,callback)
	{
		//Get Documents Images
		apiCall.getCall(api_product_document+'/'+productId+'/document').then( function (response) {
			callback(response);
		});
	}

	function loadQuantityPricing (productId,callback)
	{
		//Set Advance Measurement Unit
		apiCall.getCall(api_quantity_pricing+productId+'/quantity-pricing').then( function (response) {
			callback(response);
		});
	}

	function loadCompanyData(companyId,callback)
	{
		//Get Documents Images
		apiCall.getCall(apiPath.getAllCompany+'/'+companyId).then( function (response) {
			callback(response);
		});
	}

	function loadBranchData(branchId,callback)
	{
		//Get Documents Images
		apiCall.getCall(apiPath.getAllBranch+'/'+branchId).then( function (response) {
			callback(response);
		});
	}

	//Company Dropdown data
	vm.companyDrop = [];
	
	apiCall.getCall(apiPath.getAllCompany).then(function(responseCompanyDrop){
		vm.companyDrop = responseCompanyDrop;
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

	$scope.enableDisableColor = true;
	$scope.addDiv=false;
	$scope.enableDisableSize = true;
	$scope.enableDisableBestBefore = true;
	$scope.enableAdvanceMou = false;
	$scope.enableDisableMRPRequire = false;
	$scope.enableDisableWebIntegration = false;
	$scope.enableDisableMargin = false;
	$scope.enableDisableVariant = false;
	//get setting data
	$scope.getOptionSettingData = function()
	{
		toaster.clear();
		apiCall.getCall(apiPath.settingOption).then(function(response){
			var responseLength = response.length;
			console.log(response);
			for(var arrayData=0;arrayData<responseLength;arrayData++)
			{
				if(angular.isObject(response) || angular.isArray(response))
				{
					if(response[arrayData].settingType=="product")
					{
						// console.log('product: ',response[arrayData]);
						var arrayData1 = response[arrayData];
						$scope.enableDisableColor = arrayData1.productColorStatus=="enable" ? true : false;
						$scope.addDiv = $scope.enableDisableColor==false? true :false;
						$scope.enableDisableSize = arrayData1.productSizeStatus=="enable" ? true : false;
						$scope.enableDisableBestBefore = arrayData1.productBestBeforeStatus=="enable" ? true : false;
						$scope.enableAdvanceMou = arrayData1.productAdvanceMouStatus=="enable" ? true : false;
						$scope.enableDisableMRPRequire = arrayData1.productMrpRequireStatus=="enable" ? true : false;
						$scope.enableDisableMargin = arrayData1.productMarginStatus=="enable" ? true : false;
						$scope.enableDisableVariant = arrayData1.productVariantStatus=="enable" ? true : false;
					}
					if (response[arrayData].settingType == "webintegration") 
					{
						var arrayData1 = response[arrayData];
						$scope.enableDisableWebIntegration = arrayData1.webintegrationStatus=="on" ? true : false;
					}
				}
			}
		});
	}
	$scope.getOptionSettingData();

	$scope.addInvProduct.documentName='';
	$scope.dateTimeFlag=false;
	$scope.updateDate = "";
	$scope.userName = "";
	$scope.addInvProduct.purchasePrice = 0;
	$scope.addInvProduct.lowerPurchasePrice = 0;
	$scope.addInvProduct.mediumLowerPurchasePrice = 0;
	$scope.addInvProduct.mediumPurchasePrice = 0;
	$scope.addInvProduct.higherPurchasePrice = 0;
	$scope.addInvProduct.highestPurchasePrice = 0;
	$scope.addInvProduct.lowestUnitQty = 1;
	$scope.addInvProduct.lowerUnitQty = 1;
	$scope.addInvProduct.mediumLowerUnitQty = 1;
	$scope.addInvProduct.mediumUnitQty = 1;
	$scope.addInvProduct.higherUnitQty = 1;
	//Edit Product
	if(Object.keys(getSetFactory.get()).length > 0)
	{
		//if(getSetFactory.get() > 0){
		var editProductData = getSetFactory.get();
		getSetFactory.blank();
		editProductData = angular.copy(editProductData);
		// console.log("editProductData..",editProductData);
		/* Set Modified Date */
			$scope.dateTimeFlag=true;
			if(editProductData.updatedAt!='00-00-0000')
			{
				$scope.updateDate = editProductData.updatedAt+' '+editProductData.updatedTime;
			}
			else
			{
				$scope.updateDate = editProductData.createdAt+' '+editProductData.createdTime;
			}

			//get user data
			if(editProductData.updatedBy==0 && editProductData.createdBy==0)
			{
				var getAllUser = apiPath.getAllStaff;
				apiCall.getCall(getAllUser).then(function(userResponse){
					// console.log("user response = ",userResponse);
					var userResponseLength = userResponse.length;
					for(var index=0;index<userResponseLength;index++)
					{
						if(userResponse[index].userType=="admin")
						{
							$scope.userName = userResponse[index].userName;
							// console.log("user data ",$scope.userName);
							break;
						}
					}
				});
			}
			else if(editProductData.updatedBy!=0 || editProductData.createdBy!=0)
			{
				var updatedByUser = 0;
				if(editProductData.updatedBy!=0)
				{
					updatedByUser = editProductData.updatedBy;
				}
				else if(editProductData.createdBy!=0)
				{
					updatedByUser = editProductData.createdBy;
				}

				//get data as per user-id
				if (updatedByUser != 0)
				{
					var getAllUser = apiPath.getOneStaff+updatedByUser;
					apiCall.getCall(getAllUser).then(function(userResponse){
						$scope.userName = userResponse.userName;
						// console.log("user response = ",userResponse);
						
					});
				}
				
			}

		/* End */
		// console.log("product-data",editProductData);
		
		$scope.addInvProduct.getSetProductId = editProductData.productId;
		
		//var editProduct = apiPath.getAllProduct+'/'+$scope.addInvProduct.getSetProductId;
	
		//apiCall.getCall(editProduct).then(function(res){
			$scope.addInvProduct.name = editProductData.productName;
			$scope.addInvProduct.productDescription = editProductData.productDescription;
			$scope.addInvProduct.color = editProductData.color;
			$scope.addInvProduct.size = editProductData.size;
			$scope.addInvProduct.variant = editProductData.variant;
			$scope.addInvProduct.barcodeNo = editProductData.productCode;
			$scope.addInvProduct.highestUnitQty = editProductData.highestUnitQty;
			$scope.addInvProduct.higherUnitQty = editProductData.higherUnitQty;
			$scope.addInvProduct.lowestUnitQty = editProductData.lowestUnitQty;
			$scope.addInvProduct.lowerUnitQty = editProductData.lowerUnitQty;
			$scope.addInvProduct.mediumUnitQty = editProductData.mediumUnitQty;
			$scope.addInvProduct.mediumLowerUnitQty = editProductData.mediumLowerUnitQty;

			$scope.addInvProduct.highestMouConv = editProductData.highestMouConv;
			$scope.addInvProduct.higherMouConv = editProductData.higherMouConv;
			$scope.addInvProduct.lowestMouConv = editProductData.lowestMouConv;
			$scope.addInvProduct.lowerMouConv = editProductData.lowerMouConv;
			$scope.addInvProduct.mediumMouConv = editProductData.mediumMouConv;
			$scope.addInvProduct.mediumLowerMouConv = editProductData.mediumLowerMouConv;
			
			loadCompanyData(editProductData.companyId,function(companyData){
				$scope.addInvProduct.company = companyData;
			});
			
			//Get Branch
			vm.branchDrop = [];
			var getAllBranch = apiPath.getOneBranch+editProductData.companyId;
			// console.log('here...'+getAllBranch);
			apiCall.getCall(getAllBranch).then(function(response4){
				vm.branchDrop = response4;
				$scope.addInvProduct.branch = fetchArrayService.getfilteredSingleObject(response4,editProductData.branchId,'branchId');
			});
			$scope.addInvProduct.category = editProductData.productCategory;
			$scope.addInvProduct.group = editProductData.productGroup;

			//Measure DropDown Selection
			loadAdvanceMeasurementUnit( function (response)
			{
				vm.advanceMeasureUnitDrop = response;
				$scope.addInvProduct.highestMeasureUnit = angular.isObject(editProductData.highestMeasurementUnit) ? editProductData.highestMeasurementUnit : {};
				$scope.addInvProduct.higherMeasureUnit = angular.isObject(editProductData.higherMeasurementUnit) ? editProductData.higherMeasurementUnit : {};
				$scope.addInvProduct.measureUnit = angular.isObject(editProductData.measurementUnit) ? editProductData.measurementUnit : {};
				$scope.addInvProduct.mediumMeasureUnit = angular.isObject(editProductData.mediumMeasurementUnit) ? editProductData.mediumMeasurementUnit : {};
				$scope.addInvProduct.mediumLowerMeasureUnit = angular.isObject(editProductData.mediumLowerMeasurementUnit) ? editProductData.mediumLowerMeasurementUnit : {};
				$scope.addInvProduct.lowerMeasureUnit = angular.isObject(editProductData.lowerMeasurementUnit) ? editProductData.lowerMeasurementUnit : {};
				// $scope.addInvProduct.measureUnit = editProductData.measurementUnit;
			});
			
			$scope.addInvProduct.primaryMeasureUnit = editProductData.primaryMeasureUnit;

			$scope.changeMeasureUnitTableArray = false;
			// vm.measureUnitTable = angular.isArray(editProductData.quantityWisePricing) ? editProductData.quantityWisePricing : [];

			loadQuantityPricing(editProductData.productId,function (response)
			{
				vm.measureUnitTable = [];
				if (angular.isArray(response)){
					vm.measureUnitTable = response;
				}
			});

			$scope.addInvProduct.higherPurchasePrice = editProductData.higherPurchasePrice;
			$scope.addInvProduct.highestPurchasePrice = editProductData.highestPurchasePrice;
			$scope.addInvProduct.mediumPurchasePrice = editProductData.mediumPurchasePrice;
			$scope.addInvProduct.mediumLowerPurchasePrice = editProductData.mediumLowerPurchasePrice;
			$scope.addInvProduct.lowerPurchasePrice = editProductData.lowerPurchasePrice;
			$scope.addInvProduct.purchasePrice = editProductData.purchasePrice;


			$scope.defaultHigherPrice = editProductData.higherPurchasePrice;
			$scope.defaultHighestPrice = editProductData.highestPurchasePrice;
			$scope.defaultLowestPrice = editProductData.purchasePrice;

			$scope.addInvProduct.wholesaleMarginFlat = editProductData.wholesaleMarginFlat;
			$scope.addInvProduct.wholesaleMargin = editProductData.wholesaleMargin;
			$scope.addInvProduct.semiWholesaleMargin = editProductData.semiWholesaleMargin;
			$scope.addInvProduct.vat = editProductData.vat;
			$scope.addInvProduct.mrp = editProductData.mrp;
			$scope.addInvProduct.additionalTax = editProductData.additionalTax;
			$scope.addInvProduct.marginFlat = editProductData.marginFlat;
			$scope.addInvProduct.margin = editProductData.margin;
			
			if(editProductData.hsn == null){
				$scope.addInvProduct.hsn = '';
			}
			else{
				$scope.addInvProduct.hsn = editProductData.hsn;
			}
			if(editProductData.igst == null){
				$scope.addInvProduct.igst = '';
			}
			else{
				$scope.addInvProduct.igst = editProductData.igst;
			}

			$scope.addInvProduct.document = [];
			loadProductDocuments( editProductData.productId ,function (response)
			{
				if(!angular.isArray(response)){
					$scope.addInvProduct.document = [];
				}
				else{
					$scope.addInvProduct.document = [];
					// console.log("response..doc..",response);
					$scope.addInvProduct.document = response;
					// var documentLength = response.length;
					// for(var productIndex=0;productIndex<documentLength;productIndex++)
					// {
					// 	$scope.addInvProduct.document[productIndex] = [];
					// 	$scope.addInvProduct.document[productIndex]['documentName'] = response[productIndex].documentName;
					// 	$scope.addInvProduct.document[productIndex]['documentPath'] = response[productIndex].documentPath;
					// 	$scope.addInvProduct.document[productIndex]['documentType'] = response[productIndex].documentType;
					// }
				}
			});

			// console.log("add product = ",$scope.addInvProduct);
			$scope.addInvProduct.purchaseCgst = editProductData.purchaseCgst == null ? '' : editProductData.purchaseCgst;
			$scope.addInvProduct.purchaseSgst = editProductData.purchaseSgst == null ? '' : editProductData.purchaseSgst;
			$scope.addInvProduct.purchaseIgst = editProductData.purchaseIgst == null ? '' : editProductData.purchaseIgst;
			
			$scope.addInvProduct.minimumStockLevel = editProductData.minimumStockLevel;
			$scope.addInvProduct.productType = editProductData.productType;
			$scope.addInvProduct.productMenu = editProductData.productMenu ? editProductData.productMenu : 'not';
			$scope.addInvProduct.bestBeforeType = editProductData.bestBeforeType;
			$scope.addInvProduct.bestBeforeTime = editProductData.bestBeforeTime;
			$scope.addInvProduct.cessFlat = editProductData.cessFlat;
			$scope.addInvProduct.cessPercentage = editProductData.cessPercentage;
			$scope.addInvProduct.taxInclusive = editProductData.taxInclusive;
			$scope.addInvProduct.webIntegration = editProductData.webIntegration;
			$scope.addInvProduct.opening = editProductData.opening;
			$scope.addInvProduct.remark = editProductData.remark;
			$scope.addInvProduct.maxSaleQty = editProductData.maxSaleQty;
			$scope.addInvProduct.notForSale = editProductData.notForSale== "true" ? true : false;
			
		//});
	}
	else{
		
		$scope.defaultCompany();
		
		// vm.measureUnitTable = [{"fromQty":"","toQty":"","SalePrice":""}];

		// $scope.addInvProduct.measureUnit = 'piece';
		// formdata.append('measurementUnit',$scope.addInvProduct.measureUnit);

		$scope.addInvProduct.primaryMeasureUnit = 'lowest';
		formdata.set('primaryMeasureUnit',$scope.addInvProduct.primaryMeasureUnit);

		$scope.addInvProduct.productType ='product';
		formdata.set('productType',$scope.addInvProduct.productType);
		$scope.addInvProduct.bestBeforeType ='day';
		formdata.set('bestBeforeType',$scope.addInvProduct.bestBeforeType);
		$scope.addInvProduct.taxInclusive = 'exclusive';
		$scope.addInvProduct.notForSale = 'false';
		formdata.set('notForSale',$scope.addInvProduct.notForSale);
		$scope.addInvProduct.productMenu = 'not';
		formdata.set('productMenu',$scope.addInvProduct.productMenu);
		$scope.addInvProduct.bestBeforeTime=0;
		formdata.set('bestBeforeTime',$scope.addInvProduct.bestBeforeTime);
		$scope.addInvProduct.highestUnitQty = 1.00;
		formdata.set('highestUnitQty',$scope.addInvProduct.highestUnitQty);

		productFactory.getProduct();
	}

	$scope.addRow = function (index)
	{
		// (vm.measureUnitTable.length > 9) ? toaster.pop('info',"Maximum Limit is 10") : ''; 
		var plusOne = index+1;
		
		var data = {};	
		data.productPricingId = null;
		data.fromQty = '';
		data.toQty ='';
		data.salesPrice ='';

		vm.measureUnitTable.splice(plusOne,0,data);
		$scope.changeMeasureUnitTableArray = true;
    };

    $scope.removeRow = function (idx) 
    {
		vm.measureUnitTable.splice(idx,1);
		$scope.changeMeasureUnitTableArray = true;
	};

	$scope.changeInMeasureUnitTable = function ()
	{
		$scope.changeMeasureUnitTableArray = true;
	}

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
  
	$scope.changeCompany = function(Fname,state)
	{
		$scope.noOfDecimalPoints = $scope.addInvProduct.company.noOfDecimalPoints;
	  	vm.branchDrop = [];
		var getAllBranch = apiPath.getOneBranch+state;
		//Get Branch
		apiCall.getCall(getAllBranch).then(function(response4){
			vm.branchDrop = response4;
				
		});
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		formdata.append(Fname,state);
  	}
  
	//Changed Data When Update
	$scope.changeInvProductData = function(Fname,value)
	{
		// console.log(Fname+'..',value);
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		formdata.set(Fname,value);
	}

	$scope.someOfGST = function(Fname)
	{
		if (Fname == 'cgst' || Fname == 'sgst') 
		{
			$scope.addInvProduct.igst = parseFloat($scope.addInvProduct.vat) + parseFloat($scope.addInvProduct.additionalTax);
			var tax = 0;
			if (!isNaN($scope.addInvProduct.igst)){
				tax = parseFloat($scope.addInvProduct.igst);
			}

			$scope.changeInvProductData('igst',tax);
		}
		else if (Fname == 'igst')
		{
			$scope.addInvProduct.vat = parseFloat($scope.addInvProduct.igst)/2;
			$scope.addInvProduct.additionalTax = parseFloat($scope.addInvProduct.igst)/2;
			var vat = 0;
			if (!isNaN($scope.addInvProduct.vat)) {
				vat = parseFloat($scope.addInvProduct.vat);
			}
			$scope.changeInvProductData('vat',vat);
			var adTax = 0;
			if (!isNaN($scope.addInvProduct.additionalTax)) {
				adTax = parseFloat($scope.addInvProduct.additionalTax);
			}
			$scope.changeInvProductData('additionalTax',adTax);
		}
	}

	$scope.displayParseFloat=function(val) 
	{
		return isNaN(parseFloat(val)) ? 0: parseFloat(val);
	}

	$scope.pop = function() 
	{
		if ($scope.addInvProduct.getSetProductId)
		{
			toaster.clear();
			toaster.pop('wait','Data Updating...','',60000);

			//Quantity pricing
			if ($scope.changeMeasureUnitTableArray) 
			{
				var json2 = angular.copy(vm.measureUnitTable);
				if (json2.length != 0)
				{
					for (var i=0;i<json2.length;i++) {
						angular.forEach(json2[i], function (value,key) {
							formdata.set('quantityWisePricing['+i+']['+key+']',value);
						});
					}
				}
				else{
					formdata.set('quantityWisePricing','');
				}
			}

			//formdata.append('branchId',1);
			formdata.set('isDisplay','yes');
			var editProduct = apiPath.getAllProduct+'/'+$scope.addInvProduct.getSetProductId;
			apiCall.postCall(editProduct,formdata).then(function(response5)
			{
				console.log("response5...:))",response5);
				toaster.clear();
				if (apiResponse.ok == response5) {
					
					productFactory.setUpdatedProduct($scope.addInvProduct.getSetProductId).then(function(response){
						toaster.pop('success', 'Title', 'SuccessFull');
						window.history.back();
					});
				}
				else{
					formdata.delete('isDisplay');
					toaster.pop('warning', 'Opps!!', response5);
				}
			});
		}
		else{
			
			toaster.clear();
			toaster.pop('wait','Data Inserting...','',60000);

			//Quantity pricing
			  var json2 = angular.copy(vm.measureUnitTable);
			 
			 for (var i=0;i<json2.length;i++) {
				 
				angular.forEach(json2[i], function (value,key) {
					formdata.set('quantityWisePricing['+i+']['+key+']',value);
				});
			 }

			// console.log("product   == ",$scope.addInvProduct);
			// formdata.append('productType',$scope.addInvProduct.productType);
			// formdata.append('bestBeforeType',$scope.addInvProduct.bestBeforeType);
			formdata.set('isDisplay','yes');
			apiCall.postCall(apiPath.getAllProduct,formdata).then(function(response5) {
				toaster.clear();
				if (apiResponse.ok == response5) {
					toaster.pop('success', 'Title', 'SuccessFull');
					productFactory.setNewProduct($scope.addInvProduct.company.companyId,$scope.addInvProduct.name,$scope.addInvProduct.color,$scope.addInvProduct.size,$scope.addInvProduct.variant).then(function(response){
						if(angular.isObject(response)){
							$state.go('app.InvProduct');
						}
					});
				}
				else{
					formdata.delete('isDisplay');
					toaster.pop('warning', 'Opps!!', response5);
				}
			});
		}
	};
  
  $scope.cancel = function() {
	  
		$scope.addInvProduct = [];
		
		
		// Delete formdata  keys
		// for (var key of formdata.keys()) {
		   // formdata.delete(key); 
		// }
		  var formdata = undefined;
		  formdata = new FormData();
		
		$scope.defaultCompany();
		
		toaster.pop('info', 'Form Reset', 'Message');
  };
  
  $scope.openCategoryBatchModal = function(){
		
		var modalInstance = $modal.open({
			
			templateUrl: 'app/views/PopupModal/Inventory/InventoryBatchModal.html',
			controller: 'InventoryBatchModalController as vm',
			size: 'lg',
			resolve:{
				inventoryType: function(){
					
					return "Product";
				}
			}
		});
		
		modalInstance.result.then(function (data) {
		 
		  console.log('Ok');	
		  $scope.init();
		  
		
		}, function (data) {
		  console.log('Cancel');	

		});
	}

	//single image cover-image validation and add it to formdata
	$scope.uploadFile = function(files) {
	  	if(parseInt(files[0].size) <= maxImageSize){
			
			angular.element("img.showImg").css("display","block");
			
			console.log('Small File');
			formdata.delete('coverImage[]');
			
			formdata.append("coverImage[]", files[0]);
			
			var reader = new FileReader();
			reader.onload = function(event) {
				$scope.image_source = event.target.result
				$scope.$digest();

			}
			// console.log('Small File vv');
			// when the file is read it triggers the onload event above.
			reader.readAsDataURL(files[0]);
			// console.log('Small File aa');
		
		}
		else{
			
			formdata.delete('coverImage[]');
			toaster.clear();
			//toaster.pop('alert','Image Size is Too Long','');
			toaster.pop('alert', 'Opps!!', 'Image Size is Too Long');
			
			angular.element("input[type='file']").val(null);
			angular.element("img.showImg").css("display","none");
			$scope.$digest();
		}
	};

	//multiple images validation and add it to formdata
	$scope.uploadMultipleFile = function(files) {
		toaster.clear();
		var flag = 0;
		
		for(var m=0;m<files.length;m++){
			
			if(parseInt(files[m].size) > maxImageSize){
				
				flag = 1;
				formdata.delete('file[]');
				angular.element("input[type='file']").val(null);
				angular.element(".multipleFileAttachLabel").html('');
				break;
			}
			
		}
		
		if(flag == 0){
			
			formdata.delete('file[]');
			
			angular.forEach(files, function (value,key) {
				formdata.append('file[]',value);
			});
		}
		else{
			toaster.pop('alert', 'Opps!!', 'Image Size is Too Long');
		}
	};
	

	/** Batch **/
   
		$scope.openProductBatchModal = function(){
			
			if (Modalopened) return;
			
			var modalInstance = $modal.open({
				
				templateUrl: 'app/views/PopupModal/Inventory/InventoryBatchModal.html',
				controller: 'InventoryBatchModalController as vm',
				size: 'flg',
				resolve:{
					inventoryType: function(){
						
						return "Product";
					}
				}
			});
			
			 Modalopened = true;
			 
			modalInstance.result.then(function (data) {
			 
			  console.log('Ok');	
			  productFactory.blankProduct();
			  $scope.init();
			  Modalopened = false;
			
			}, function (data) {
			  console.log('Cancel');	
				Modalopened = false;
				
			});
		}
	
   /** End **/

   /** Docuemnt Delete **/
		// $scope.openInNextTab = function(url){
		// 	$window.open(url,'_blank');
		// }
		
		$scope.documentDelete = function(item){
			item.ShowConfirm == true ? item.ShowConfirm = false : item.ShowConfirm = true;
		}
		
		$scope.documentDeleteConfirm = function(item,index){
			// console.log("item...",item);
			var documentID = item.documentId;
			
			if(documentID == '' || documentID == null || documentID == undefined)
			{
				toaster.pop('error','Document Not Found');
				return false;
			}
			
			var headerData = {'Content-Type': undefined,'type':'product'};
			
			apiCall.deleteCallHeader(apiPath.documentDelete+documentID,headerData).then(function(response){
				if(response == apiResponse.ok){
					toaster.pop('success','Document Successfully Deleted');
					$scope.addInvProduct.document.splice(index,1);
				}
				else{
					toaster.pop('warning',response);
				}
			});
		}
		/*
		*	Unit Qty wise Price changing
		*/

		$scope.changePurchasePrice = function(fname,value){
			var unitVariantArray = ['highest','higher','medium','mediumLower','lower','lowest'];
			if (fname.search('UnitQty') >= 0) {
				var currentUnitQty = fname.replace('UnitQty','');
				var i = unitVariantArray.indexOf(currentUnitQty);
				if (i == unitVariantArray.length - 1) {
					$scope.addInvProduct.purchasePrice = parseFloat(($scope.addInvProduct[unitVariantArray[i-1]+'PurchasePrice'] / value).toFixed($scope.noOfDecimalPoints));
					$scope.changeInvProductData('purchasePrice',$scope.addInvProduct.purchasePrice);
				}else{
					$scope.addInvProduct[unitVariantArray[i]+'PurchasePrice'] = parseFloat(($scope.addInvProduct[unitVariantArray[i-1]+'PurchasePrice'] / value).toFixed($scope.noOfDecimalPoints));
					$scope.changeInvProductData(unitVariantArray[i]+'PurchasePrice',$scope.addInvProduct[unitVariantArray[i]+'PurchasePrice']);
				}
				$scope.calculateConvRatio();
			}
		}
		$scope.calculateConvRatio = function(){
			var unitVariantArray = ['highest','higher','medium','mediumLower','lower','lowest'];
			var primaryIndex = unitVariantArray.indexOf($scope.addInvProduct.primaryMeasureUnit);
			$scope.addInvProduct[$scope.addInvProduct.primaryMeasureUnit+'MouConv'] = 1;
			$scope.changeInvProductData($scope.addInvProduct.primaryMeasureUnit+'MouConv',$scope.addInvProduct[$scope.addInvProduct.primaryMeasureUnit+'MouConv']);
			for (var i = primaryIndex - 1; i >= 0; i--) {
				$scope.addInvProduct[unitVariantArray[i]+'MouConv'] = parseFloat(($scope.addInvProduct[unitVariantArray[i + 1]+'MouConv'] * $scope.addInvProduct[unitVariantArray[i + 1]+'UnitQty']).toFixed($scope.noOfDecimalPoints));
				$scope.changeInvProductData(unitVariantArray[i]+'MouConv',$scope.addInvProduct[unitVariantArray[i]+'MouConv']);
			}
			for (var i = primaryIndex + 1; i < unitVariantArray.length; i++) {
				$scope.addInvProduct[unitVariantArray[i]+'MouConv'] = parseFloat(($scope.addInvProduct[unitVariantArray[i - 1]+'MouConv'] / $scope.addInvProduct[unitVariantArray[i]+'UnitQty']).toFixed($scope.noOfDecimalPoints));
				$scope.changeInvProductData(unitVariantArray[i]+'MouConv',$scope.addInvProduct[unitVariantArray[i]+'MouConv']);
			}
		}
		$scope.calculateConvRatio();
		// $scope.changePurchasePrice = function(fname,value){
		// 	var highestPrice = $scope.addInvProduct.highestPurchasePrice;
		// 	var higherPrice = $scope.addInvProduct.higherPurchasePrice;
		// 	var lowestPrice = $scope.addInvProduct.purchasePrice;
		// 	var highestUnitQty = $scope.addInvProduct.highestUnitQty;
		// 	var higherUnitQty = $scope.addInvProduct.higherUnitQty;
		// 	var lowestUnitQty = $scope.addInvProduct.lowestUnitQty;
		// 	var defaultHighest = $scope.defaultHighestPrice;
		// 	var defaultHigher = $scope.defaultHigherPrice;
		// 	var defaultLowest = $scope.defaultLowestPrice;
		// 	if (fname == 'highestPurchasePrice') {
		// 		$scope.defaultHighestPrice = value;
		// 		if (higherUnitQty > 0) {
					
		// 			$scope.addInvProduct.higherPurchasePrice = parseFloat(Math.round(value / higherUnitQty ,$scope.noOfDecimalPoints));
		// 		}
		// 		if (lowestUnitQty > 0 && higherUnitQty > 0) {
		// 			$scope.addInvProduct.purchasePrice = parseFloat(Math.round(value / (higherUnitQty*lowestUnitQty),$scope.noOfDecimalPoints));
		// 		}
		// 	}
		// 	if (fname == 'higherUnitQty' && value > 0) {
		// 		if (highestPrice != null && highestPrice != undefined && highestPrice != 0) {
		// 			$scope.addInvProduct.higherPurchasePrice = parseFloat(Math.round(highestPrice / value,$scope.noOfDecimalPoints));
		// 		}
		// 	}
		// 	if (fname == 'higherPurchasePrice' && value > 0 && higherUnitQty > 0) {
		// 		$scope.defaultHigherPrice = value;
		// 		if (defaultHighest == null || defaultHighest == undefined || defaultHighest == 0) {
		// 			$scope.addInvProduct.highestPurchasePrice = parseFloat(Math.round(value * higherUnitQty,$scope.noOfDecimalPoints));
		// 		}
		// 		if (lowestUnitQty > 0) {
		// 			$scope.addInvProduct.purchasePrice = parseFloat(Math.round(value / lowestUnitQty,$scope.noOfDecimalPoints));
		// 		}
		// 	}
		// 	if (fname == 'lowestUnitQty' && value > 0) {
		// 		if (higherPrice != null && higherPrice != undefined && higherPrice != 0) {
		// 			$scope.addInvProduct.purchasePrice = parseFloat(Math.round(higherPrice / value,$scope.noOfDecimalPoints));
		// 		}
		// 	}
		// 	if (fname == 'purchasePrice') {
		// 		if (lowestUnitQty > 0) {
		// 			if (defaultHigher == null || defaultHigher == undefined || defaultHigher == 0) {
		// 				$scope.addInvProduct.higherPurchasePrice = parseFloat(Math.round(value * lowestUnitQty,$scope.noOfDecimalPoints));
		// 			}	
		// 			if (higherUnitQty > 0) {
		// 				$scope.addInvProduct.highestPurchasePrice = parseFloat(Math.round(value * lowestUnitQty * higherUnitQty,$scope.noOfDecimalPoints));
		// 			}
		// 		}
		// 	}
		// }
	/** End **/
}
AddInvProductController.$inject = ["$scope","toaster","$filter","apiCall","apiPath","$stateParams","$state","apiResponse","validationMessage","getSetFactory","$modal","productFactory","fetchArrayService","maxImageSize"];