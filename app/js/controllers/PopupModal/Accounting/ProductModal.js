
/**=========================================================
 * Module: AccProductModalController.js
 * Controller for input components
 =========================================================*/

App.controller('AccProductModalController', AccProductModalController);

function AccProductModalController($scope,toaster, $modalInstance,$rootScope,apiCall,apiPath,productIndex,companyId,validationMessage,apiResponse,getSetFactory,maxImageSize,fetchArrayService) {
  'use strict';
  
  $scope.stockModel=[];
			
	var vm = this;
	$scope.addModelProduct = [];
	var formdata = new FormData();
	
	var api_measurementUnit = apiPath.settingMeasurementUnit;
	var api_quantity_pricing = apiPath.getAllProduct+'/';
	var api_product_document = apiPath.getAllProduct;

	vm.measureUnitTable = [];
  	$scope.changeMeasureUnitTableArray = false;

	/* VALIDATION */
		$scope.errorMessage = validationMessage; //Error Messages In Constant
	/* VALIDATION END */
	
	$scope.measureUnitDrop = [
	    'piece',
	    'pair'
	];

	vm.advanceMeasureUnitDrop = [];

  	$scope.productTypeDrop = [
	    'product',
	    'accessories',
	    'service'
  	];
  	$scope.bestBeforeDrop = [
	    'day',
	    'month',
	    'year'
  	];
  
	$scope.defaultCompany = companyId;
	$scope.productIndex = productIndex;
	$scope.addModelProduct.highestUnitQty = 1;
	formdata.set('highestUnitQty',$scope.addModelProduct.highestUnitQty);
	
	//Company Dropdown data
	$scope.companyDrop = [];
	apiCall.getCall(apiPath.getAllCompany).then( function(responseCompanyDrop) {
		$scope.companyDrop = responseCompanyDrop;
		$scope.disableCompany = true;
	});
	
	function loadCompanyData(companyId,callback)
	{
		//Get Company
		apiCall.getCall(apiPath.getAllCompany+'/'+companyId).then( function (response) {
			callback(response);
		});
	}

	//Get Product Images
	function loadProductDocuments (productId,callback)
	{
		//Get Documents Images
		apiCall.getCall(api_product_document+'/'+productId+'/document').then( function (response) {
			callback(response);
		});
	}

	//Category Dropdown data
	$scope.categoryDrop = [];
	apiCall.getCall(apiPath.getAllCategory).then( function(responseDrop) {
		$scope.categoryDrop = responseDrop;
	});
	
	//Group Dropdown data
	$scope.groupDrop = [];
	apiCall.getCall(apiPath.getAllGroup).then( function(responseDrop) {
		$scope.groupDrop = responseDrop;
	});
	
	function loadAdvanceMeasurementUnit (callback)
	{
		//Set Advance Measurement Unit
		apiCall.getCall(api_measurementUnit).then( function (response) {
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

	//Edit Product
	if(Object.keys(getSetFactory.get()).length){

		var editProductData = getSetFactory.get();
		getSetFactory.blank();
		editProductData = angular.copy(editProductData);
		console.log('modal p',editProductData);

		$scope.addModelProduct.getSetProductId = editProductData.productId;
		
		$scope.addModelProduct.productName = editProductData.productName;
		$scope.addModelProduct.productDescription = editProductData.productDescription;
		$scope.addModelProduct.color = editProductData.color;
		$scope.addModelProduct.size = editProductData.size;

		$scope.addModelProduct.highestUnitQty = editProductData.highestUnitQty;
		$scope.addModelProduct.higherUnitQty = editProductData.higherUnitQty;
		$scope.addModelProduct.lowestUnitQty = editProductData.lowestUnitQty;
		
		loadCompanyData(editProductData.companyId,function(companyData){
			$scope.addModelProduct.company = companyData;
			$scope.disableCompany = true;
		});
		
		var getAllBranch = apiPath.getOneBranch+editProductData.companyId;
		//console.log('here...'+getAllBranch);
		apiCall.getCall(getAllBranch).then( function(response4) {
			$scope.branchDrop = response4;
			$scope.addModelProduct.branch = fetchArrayService.getfilteredSingleObject(response4,editProductData.branchId,'branchId');
			// console.log('response4..',response4);
			// console.log('editProductData.branchId..',editProductData.branchId);
			// console.log('$scope.addModelProduct.branch..',$scope.addModelProduct.branch);
		});
		
		$scope.addModelProduct.category = editProductData.productCategory;
		$scope.addModelProduct.group = editProductData.productGroup;
		
		// Product Images
		$scope.addModelProduct.document = [];
		loadProductDocuments( editProductData.productId ,function (response)
		{
			if(!angular.isArray(response)){
				$scope.addModelProduct.document = [];
			}
			else{
				$scope.addModelProduct.document = [];
				$scope.addModelProduct.document = response;
				// var documentLength = response.length;
				// for(var productIndex=0;productIndex<documentLength;productIndex++)
				// {
				// 	$scope.addModelProduct.document[productIndex] = [];
				// 	$scope.addModelProduct.document[productIndex]['documentName'] = response[productIndex].documentName;
				// 	$scope.addModelProduct.document[productIndex]['documentPath'] = response[productIndex].documentPath;
				// 	$scope.addModelProduct.document[productIndex]['documentType'] = response[productIndex].documentType;
				// }
			}
		});

		//Measure DropDown Selection
		loadAdvanceMeasurementUnit( function (response)
		{
			vm.advanceMeasureUnitDrop = response;
			$scope.addModelProduct.highestMeasureUnit = angular.isObject(editProductData.highestMeasurementUnit) ? editProductData.highestMeasurementUnit : {};
			$scope.addModelProduct.higherMeasureUnit = angular.isObject(editProductData.higherMeasurementUnit) ? editProductData.higherMeasurementUnit : {};
			$scope.addModelProduct.measureUnit = angular.isObject(editProductData.measurementUnit) ? editProductData.measurementUnit : {};
			// $scope.addModelProduct.measureUnit = editProductData.measurementUnit;
		});
		
		$scope.addModelProduct.primaryMeasureUnit = editProductData.primaryMeasureUnit;

		$scope.changeMeasureUnitTableArray = false;
		// vm.measureUnitTable = angular.isArray(editProductData.quantityWisePricing) ? editProductData.quantityWisePricing : [];
		//Measure DropDown Selection
		loadQuantityPricing(editProductData.productId,function (response)
		{
			vm.measureUnitTable = [];
			if (angular.isArray(response)){
				vm.measureUnitTable = response;
			}
		});
		// $scope.addModelProduct.measureUnit = editProductData.measurementUnit;
		
		$scope.addModelProduct.higherPurchasePrice = editProductData.higherPurchasePrice;
		$scope.addModelProduct.highestPurchasePrice = editProductData.highestPurchasePrice;
		$scope.addModelProduct.purchasePrice = editProductData.purchasePrice;
		$scope.addModelProduct.wholesaleMarginFlat = editProductData.wholesaleMarginFlat;
		$scope.addModelProduct.wholesaleMargin = editProductData.wholesaleMargin;
		$scope.addModelProduct.semiWholesaleMargin = editProductData.semiWholesaleMargin;
		$scope.addModelProduct.vat = editProductData.vat;
		$scope.addModelProduct.mrp = editProductData.mrp;
		$scope.addModelProduct.additionalTax = editProductData.additionalTax;
		$scope.addModelProduct.marginFlat = editProductData.marginFlat;
		$scope.addModelProduct.margin = editProductData.margin;
		$scope.addModelProduct.barcodeNo = editProductData.productCode;

		$scope.addModelProduct.productType = editProductData.productType;
		$scope.addModelProduct.productMenu = editProductData.productMenu;
		$scope.addModelProduct.bestBeforeType = editProductData.bestBeforeType;
		$scope.addModelProduct.bestBeforeTime = editProductData.bestBeforeTime;
		$scope.addModelProduct.cessFlat = editProductData.cessFlat;
		$scope.addModelProduct.cessPercentage = editProductData.cessPercentage;
		$scope.addModelProduct.taxInclusive = editProductData.taxInclusive;
		$scope.addModelProduct.maxSaleQty = editProductData.maxSaleQty;
		$scope.addModelProduct.webIntegration = editProductData.webIntegration;
		$scope.addModelProduct.opening = editProductData.opening;
		$scope.addModelProduct.remark = editProductData.remark;
		$scope.addModelProduct.notForSale = editProductData.notForSale=="true"?true : false;
		
		if(editProductData.hsn == null){
			$scope.addModelProduct.hsn = '';
		}
		else{
			$scope.addModelProduct.hsn = editProductData.hsn;
		}

		if(editProductData.igst == null){
			$scope.addModelProduct.igst = '';
		}
		else{
			$scope.addModelProduct.igst = editProductData.igst;
		}
		
		$scope.addModelProduct.minimumStockLevel = editProductData.minimumStockLevel;
		
	}
	else{
		
		apiCall.getCall(apiPath.getAllCompany).then(function(responseCompanyDrop){
		
			$scope.companyDrop = responseCompanyDrop;
			$scope.addModelProduct.company = $scope.defaultCompany;
			formdata.delete('companyId');
			formdata.set('companyId',$scope.addModelProduct.company.companyId);
			
			$scope.disableCompany = true;
			
			$scope.branchDrop = [];
			var getAllBranch = apiPath.getOneBranch+$scope.defaultCompany.companyId;
			//Get Branch
			apiCall.getCall(getAllBranch).then(function(response4)
			{
				$scope.branchDrop = response4;
				$scope.addModelProduct.branch = response4[0];
				formdata.delete('branchId');
				formdata.set('branchId',$scope.addModelProduct.branch.branchId);
			});
		});
		
		loadAdvanceMeasurementUnit(function(response){
			vm.advanceMeasureUnitDrop = response;
		});

		$scope.addModelProduct.primaryMeasureUnit = 'lowest';
		formdata.set('primaryMeasureUnit',$scope.addModelProduct.primaryMeasureUnit);
		$scope.addModelProduct.productType ='product';
		$scope.addModelProduct.taxInclusive ='exclusive';
		$scope.addModelProduct.bestBeforeType ='day';
		$scope.addModelProduct.productMenu = 'not';
		$scope.addModelProduct.notForSale = 'false';
		$scope.addModelProduct.bestBeforeTime=0;
	}
	
	$scope.enableAdvanceMou = false;
	$scope.enableDisableColor = true;
	$scope.addDiv=false;
	$scope.enableDisableSize = true;
	$scope.enableDisableBestBefore = true;
	$scope.enableDisableMRPRequire = false;
	$scope.enableDisableWebIntegration = false;
	$scope.enableDisableMargin = false;
	//get setting data
	$scope.getOptionSettingData = function()
	{
		apiCall.getCall(apiPath.settingOption).then(function(response){
			var responseLength = response.length;
			// console.log(response);
			for(var arrayData=0;arrayData<responseLength;arrayData++)
			{
				if(angular.isObject(response) || angular.isArray(response))
				{
					if(response[arrayData].settingType=="product")
					{
						var arrayData1 = response[arrayData];
						$scope.enableAdvanceMou = arrayData1.productAdvanceMouStatus=="enable" ? true : false;
						$scope.enableDisableColor = arrayData1.productColorStatus=="enable" ? true : false;
						$scope.addDiv = $scope.enableDisableColor==false? true :false;
						$scope.enableDisableSize = arrayData1.productSizeStatus=="enable" ? true : false;
						$scope.enableDisableBestBefore = arrayData1.productBestBeforeStatus=="enable" ? true : false;
						$scope.enableDisableMRPRequire = arrayData1.productMrpRequireStatus=="enable" ? true : false;
						$scope.enableDisableMargin = arrayData1.productMarginStatus=="enable" ? true : false;
					}
					if (response[arrayData].settingType=="webintegration") {
						var arrayData1 = response[arrayData];
						$scope.enableDisableWebIntegration = arrayData1.webintegrationStatus=="on" ? true : false;
					}
				}
			}
		});
	}
	$scope.getOptionSettingData();

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

	//single image cover-image validation and add it to formdata
	$scope.uploadFile = function(files) {
	  	if(parseInt(files[0].size) <= maxImageSize){
			
			angular.element("img.showImg").css("display","block");
			
			// console.log('Small File');
			formdata.delete('coverImage[]');
			
			formdata.set("coverImage[]", files[0]);
			
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
				formdata.set('file[]',value);
			});
		}
		else{
			toaster.pop('alert', 'Opps!!', 'Image Size is Too Long');
		}
	};
	

	$scope.changeCompany = function(state)
	{
		$scope.branchDrop = [];
		var getAllBranch = apiPath.getOneBranch+state;
		//Get Branch
		apiCall.getCall(getAllBranch).then(function(response4){
			$scope.branchDrop = response4;
				
		});
	}
	
	
	$scope.displayParseFloat=function(val) {
		
		return isNaN(parseFloat(val)) ? 0: parseFloat(val);
	}
	
	$scope.changeMRP = function(){
		$scope.addModelProduct.mrp = $scope.addModelProduct.purchasePrice;
	}
	
	//Changed Data When Update
	$scope.changeInvProductData = function(Fname,value){
		// console.log(Fname,value);
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}

		if(Fname == 'notForSale'){
			formdata.set(Fname,value);
		}

		// if(value != undefined && value != ''){
			// console.log('form append');
			formdata.set(Fname,value);
		// }
	}

	$scope.someOfGST = function(Fname)
	{
		if (Fname == 'cgst' || Fname == 'sgst') 
		{
			$scope.addModelProduct.igst = parseFloat($scope.addModelProduct.vat) + parseFloat($scope.addModelProduct.additionalTax);
			var tax = 0;
			if (!isNaN($scope.addModelProduct.igst)){
				tax = parseFloat($scope.addModelProduct.igst);
			}

			$scope.changeInvProductData('igst',tax);
		}
		else if (Fname == 'igst')
		{
			$scope.addModelProduct.vat = parseFloat($scope.addModelProduct.igst)/2;
			$scope.addModelProduct.additionalTax = parseFloat($scope.addModelProduct.igst)/2;
			var vat = 0;
			if (!isNaN($scope.addModelProduct.vat)) {
				vat = parseFloat($scope.addModelProduct.vat);
			}
			$scope.changeInvProductData('vat',vat);
			var adTax = 0;
			if (!isNaN($scope.addModelProduct.additionalTax)) {
				adTax = parseFloat($scope.addModelProduct.additionalTax);
			}
			$scope.changeInvProductData('additionalTax',adTax);
		}
	}

	
	$scope.clickSave = function(){
		
		if($scope.addModelProduct.getSetProductId){
			
			var productPath = apiPath.getAllProduct+'/'+$scope.addModelProduct.getSetProductId;

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

		}
		else
		{
			var productPath = apiPath.getAllProduct;

			//Quantity pricing
			var json2 = angular.copy(vm.measureUnitTable);
			 
			for (var i=0;i<json2.length;i++) {
				 
				angular.forEach(json2[i], function (value,key) {
					formdata.set('quantityWisePricing['+i+']['+key+']',value);
				});	
			}
		}
		
		var filterArray = {};
		
		// formdata.set('companyId',$scope.addModelProduct.company.companyId);
		// formdata.set('branchId',$scope.addModelProduct.branch.branchId);
		// formdata.set('productName',$scope.addModelProduct.productName);
		// formdata.set('color',$scope.addModelProduct.color);
		// formdata.set('size',$scope.addModelProduct.size);
		// if($scope.addModelProduct.productDescription){
			
			// formdata.set('productDescription',$scope.addModelProduct.productDescription);
		// }
		
		// formdata.set('productCategoryId',$scope.addModelProduct.category.productCategoryId);
		// formdata.set('productGroupId',$scope.addModelProduct.group.productGroupId);
		// formdata.set('measurementUnit',$scope.addModelProduct.measureUnit);
		// formdata.set('purchasePrice',$scope.addModelProduct.purchasePrice);
		
		// if($scope.addModelProduct.wholesaleMarginFlat){
			// formdata.set('wholesaleMarginFlat',$scope.addModelProduct.wholesaleMarginFlat);
		// }
		
		// if($scope.addModelProduct.wholesaleMargin){
			// formdata.set('wholesaleMargin',$scope.addModelProduct.wholesaleMargin);
		// }
		// if($scope.addModelProduct.semiWholesaleMargin){
			// formdata.set('semiWholesaleMargin',$scope.addModelProduct.semiWholesaleMargin);
		// }
		
		// if($scope.addModelProduct.vat){
			// formdata.set('vat',$scope.addModelProduct.vat);
		// }
		// if($scope.addModelProduct.additionalTax){
			// formdata.set('additionalTax',$scope.addModelProduct.additionalTax);
		// }
		// if($scope.addModelProduct.marginFlat){
			// formdata.set('marginFlat',$scope.addModelProduct.marginFlat);
		// }
		// if($scope.addModelProduct.margin){
			// formdata.set('margin',$scope.addModelProduct.margin);
		// }
		// if($scope.addModelProduct.mrp){
			// formdata.set('mrp',$scope.addModelProduct.mrp);
		// }
		
		// if($scope.addModelProduct.minimumStockLevel){
			// formdata.set('minimumStockLevel',$scope.addModelProduct.minimumStockLevel);
		// }
		
		// if($scope.addModelProduct.hsn){
			// formdata.set('hsn',$scope.addModelProduct.hsn);
		// }
		
		// if($scope.addModelProduct.igst){
			// formdata.set('igst',$scope.addModelProduct.igst);
		// }
		
		// $scope.addModelProduct.purchaseCgst ? formdata.set('purchaseCgst',$scope.addModelProduct.purchaseCgst) : 0;
		// $scope.addModelProduct.purchaseSgst ? formdata.set('purchaseSgst',$scope.addModelProduct.purchaseSgst) : 0;
		// $scope.addModelProduct.purchaseIgst ? formdata.set('purchaseIgst',$scope.addModelProduct.purchaseIgst) : 0;
		
		// formdata.set('isDisplay','yes');
		apiCall.postCall(productPath,formdata).then(function(response5){
		
			if(apiResponse.ok == response5)
			{
				if($scope.addModelProduct.getSetProductId){
					//console.log("innnn");
					filterArray.productId = $scope.addModelProduct.getSetProductId;
				}
				//console.log("hhhh");
				filterArray.index = $scope.productIndex;
				filterArray.companyId = $scope.addModelProduct.company.companyId;
				filterArray.productName = $scope.addModelProduct.productName;
				filterArray.color = $scope.addModelProduct.color;
				filterArray.size = $scope.addModelProduct.size;
				
				$modalInstance.close(filterArray);
			}
			else{
				
				alert(response5);
			}
			
		});
	}
	
	if($rootScope.ArraystockModel)
	{
		$scope.stockModel.state=$rootScope.ArraystockModel.state;
		$scope.stockModel.state2=$rootScope.ArraystockModel.state2;
		$scope.stockModel.state3=$rootScope.ArraystockModel.state3;
	}
  // $scope.stockModel.state;

    $scope.ok = function () {
      $modalInstance.close('closed');
    };

    $scope.cancel = function () {
	
		$scope.addModelProduct = [];
		
		$scope.addModelProduct.measureUnit = 'piece';
		// if($scope.stockModel)
		 // {
			// $rootScope.ArraystockModel=[];
			// $rootScope.ArraystockModel.state=$scope.stockModel.state;
			// $rootScope.ArraystockModel.state2=$scope.stockModel.state2;
			// $rootScope.ArraystockModel.state3=$scope.stockModel.state3;
		 // }
		//$modalInstance.dismiss();
    };
	
	$scope.closeButton = function () {

		$modalInstance.dismiss();
    };
  
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
					$scope.addModelProduct.document.splice(index,1);
				}
				else{
					toaster.pop('warning',response);
				}
			});
		}
	/** End **/

}
AccProductModalController.$inject = ["$scope","toaster","$modalInstance","$rootScope","apiCall","apiPath","productIndex","companyId","validationMessage","apiResponse","getSetFactory","maxImageSize","fetchArrayService"];