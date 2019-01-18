
/**=========================================================
 * Module: ModalController
 * Provides a simple way to implement bootstrap modals from templates
 =========================================================*/
//$.getScript('app/vendor/ng-table/ng-table.min.js');
//$.getScript('app/vendor/ng-table/ng-table.min.css');

App.directive("fileread", [function () {
  return {
    scope: {
      opts: '='
    },
    link: function ($scope, $elm, $attrs) {
      $elm.on('change', function (changeEvent) {
        var reader = new FileReader();
        
        reader.onload = function (evt) {
          $scope.$apply(function () {
            var data = evt.target.result;
            
            var workbook = XLSX.read(data, {type: 'binary'});
            
            var headerNames = XLSX.utils.sheet_to_json( workbook.Sheets[workbook.SheetNames[0]], { header: 1 })[0];
            
            var data = XLSX.utils.sheet_to_json( workbook.Sheets[workbook.SheetNames[0]]);
            
            $scope.opts.columnDefs = [];
            headerNames.forEach(function (h) {
              $scope.opts.columnDefs.push({ field: h });
            });
            
            $scope.opts.data = data;
            
            //$elm.val(null);
          });
        };
        
        reader.readAsBinaryString(changeEvent.target.files[0]);
      });
    }
  }
}]);

App.controller('InventoryBatchModalController',InventoryBatchModalController);

function InventoryBatchModalController($scope, $modalInstance,$rootScope,$http,apiCall,apiPath,apiResponse,$timeout,getSetFactory,$state,$window,toaster,inventoryType) {
  'use strict';
  
	 var data = [];
	 var vm = this;
	 
	 $scope.inventoryType = inventoryType;
	 
	 $scope.dropdownData = [];
	 
	 vm.batchdropdown = [];
	 
	 var MappingChanged = 0;
	 var MappingData;
	 
	 $scope.remarkData = [];  // Data After api Response (data not Inserted)
	 
	 
	/** Excel **/
		
		vm.gridOptions = {
			columnDefs: [
			{ name: 'parentName', displayName: 'Parent Name', field: 'parentName' },
			{ name: 'brandName', displayName: 'Brand Name', field: 'brandName' },
			{ name: 'description', displayName: 'Description', field: 'descrition' }
		  ],
			enableColumnMenus: false
		};

  
	/** End **/
	
	$scope.getExcelData = function(){
		
		console.log(vm.gridOptions.data);
		if($scope.inventoryType == "Brand"){
			
			vm.batchdropdown = [{"key":"productParentCategoryId","value":"Parent Name"},{"key":"productCategoryName","value":"Brand Name"},{"key":"productCategoryDescription","value":"Description"}];
			
			MappingData = ['productParentCategoryId','productCategoryName','productCategoryDescription','isDisplay'];
			
			$scope.dropdownData.parentName = vm.batchdropdown[0];
			$scope.dropdownData.brandName = vm.batchdropdown[1];
			$scope.dropdownData.description = vm.batchdropdown[2];
		
		}
		else if($scope.inventoryType == "Category"){
			
			vm.batchdropdown = [{"key":"productParentGroupId","value":"Parent Name"},{"key":"productGroupName","value":"Category Name"},{"key":"productGroupDescription","value":"Description"}];
			
			MappingData = ['productParentGroupId','productGroupName','productGroupDescription','isDisplay'];
			
			$scope.dropdownData.parentName = vm.batchdropdown[0];
			$scope.dropdownData.brandName = vm.batchdropdown[1];
			$scope.dropdownData.description = vm.batchdropdown[2];
		
		}
		else if($scope.inventoryType == "Product"){
			
			vm.batchdropdown = [{"key":"companyId","value":"Company"},
			{"key":"branchId","value":"Branch"},
			{"key":"productCategoryId","value":"Brand"},
			{"key":"productGroupId","value":"Category"},
			{"key":"productName","value":"P.Name"},
			{"key":"color","value":"Color"},
			{"key":"size","value":"Size"},
			{"key":"productDescription","value":"Description"},
			{"key":"measurementUnit","value":"Measurement"},
			{"key":"purchasePrice","value":"Pur.Price"},
			{"key":"wholesaleMargin","value":"TaxMargin"},
			{"key":"wholesaleMarginFlat","value":"TaxMarginFlat"},
			{"key":"semiWholesaleMargin","value":"semiTaxMargin"},
			{"key":"vat","value":"Vat"},
			{"key":"margin","value":"Margin"},
			{"key":"marginFlat","value":"MarginFlat"},
			{"key":"additionalTax","value":"Add.Tax"},
			{"key":"mrp","value":"MRP"},
			{"key":"minimumStockLevel","value":"minimumStock"},
			{"key":"productMenu","value":"ProductMenu"},
			{"key":"productType","value":"ProductType"},
			{"key":"maxSaleQty","value":"MaxSaleQty"},
			{"key":"notForSale","value":"NotForSale"},
			{"key":"bestBeforeTime","value":"BestBeforeTime"},
			{"key":"bestBeforeType","value":"BestBeforeType"},
			{"key":"cessFlat","value":"CessFlat"},
			{"key":"cessPercentage","value":"CessPercentage"},
			{"key":"opening","value":"opening"}
			];
			
			MappingData = ['companyId','branchId','productCategoryId','productGroupId','productName','color','size','productDescription','measurementUnit','purchasePrice','wholesaleMargin','wholesaleMarginFlat','semiWholesaleMargin','vat','margin','marginFlat','additionalTax','mrp','minimumStockLevel','productMenu','productType','maxSaleQty','notForSale','bestBeforeTime','bestBeforeType','cessFlat','cessPercentage','opening'];
			
			$scope.dropdownData.brandName = vm.batchdropdown[0];
			$scope.dropdownData.description = vm.batchdropdown[1];
			$scope.dropdownData.Companybrand = vm.batchdropdown[2];
			$scope.dropdownData.category = vm.batchdropdown[3];
			$scope.dropdownData.productName = vm.batchdropdown[4];
			$scope.dropdownData.color = vm.batchdropdown[5];
			$scope.dropdownData.size = vm.batchdropdown[6];
			$scope.dropdownData.desc = vm.batchdropdown[7];
			$scope.dropdownData.measurement = vm.batchdropdown[8];
			$scope.dropdownData.purchasePrice = vm.batchdropdown[9];
			$scope.dropdownData.taxMargin = vm.batchdropdown[10];
			$scope.dropdownData.taxMarginFlat = vm.batchdropdown[11];
			$scope.dropdownData.semiTaxMargin = vm.batchdropdown[12];
			$scope.dropdownData.vat = vm.batchdropdown[13];
			$scope.dropdownData.margin = vm.batchdropdown[14];
			$scope.dropdownData.marginFlat = vm.batchdropdown[15];
			$scope.dropdownData.additionalTax = vm.batchdropdown[16];
			$scope.dropdownData.mrp = vm.batchdropdown[17];
			$scope.dropdownData.minimumStock = vm.batchdropdown[18];
			$scope.dropdownData.productMenu = vm.batchdropdown[19];
			$scope.dropdownData.productType = vm.batchdropdown[20];
			$scope.dropdownData.maxSaleQty = vm.batchdropdown[21];
			$scope.dropdownData.notForSale = vm.batchdropdown[22];
			$scope.dropdownData.bestBeforeTime = vm.batchdropdown[23];
			$scope.dropdownData.bestBeforeType = vm.batchdropdown[24];
			$scope.dropdownData.cessFlat = vm.batchdropdown[25];
			$scope.dropdownData.cessPercentage = vm.batchdropdown[26];
			$scope.dropdownData.opening = vm.batchdropdown[27];
		}
		
		
		
		//console.log(vm.batchdropdown);
		
		$scope.getArray = vm.gridOptions.data;
		
		
		$scope.hideExport = 0;
		
	}

    $scope.ok = function () {
      $modalInstance.close('closed');
    };
	
	$scope.closeButton = function () {

		$modalInstance.dismiss();
    };
	
    $scope.cancel = function () {
	
		
		$modalInstance.dismiss();
    };
	

	
	$scope.openSampleFile = function(){
		
		if($scope.inventoryType == "Brand"){
			
			var filePath = "app/SampleDocument/Inventory/Brand/Sample.xls";
		}
		else if($scope.inventoryType == "Category"){
			
			var filePath = "app/SampleDocument/Inventory/Category/Sample.xls";
		}
		else if($scope.inventoryType == "Product"){
			
			var filePath = "app/SampleDocument/Inventory/Product/Sample.xls";
		
		}
		
		$window.open(filePath,"_self");
	}
	
	$scope.validFile = true;
	
	 $scope.uploadFile = function(files) {
		 
		var validExts = new Array(".xlsx", ".xls",".csv");
		var fileExt = files[0].name;
		// console.log("file = ",files[0].type);
		// var fileType1 = files[0].type;
		// alert("type =",fileType1);
		// return false;
		fileExt = fileExt.substring(fileExt.lastIndexOf('.'));
		
		if (validExts.indexOf(fileExt) < 0 && files[0].type!="application/vnd.ms-excel") {
			
			alert("Invalid file selected, valid files are of " +
				   validExts.toString() + " types.");
			$scope.validFile = true;
			
		}
		else{
			
			$scope.validFile = false;
			//console.log(files[0]);
		}
		
		$scope.$digest();
		
		//vm.gridOptions.core.handleWindowResize();
	}
	 
	 
	$scope.insertBatchData = function(){
		
		var excelData = angular.copy(vm.gridOptions.data);
		
		//console.log(excelData);
		
		
		
		if($scope.inventoryType == "Brand"){
			
			$scope.insertBrandData(excelData);
			
		}
		else if($scope.inventoryType == "Category"){
			
			$scope.insertCategoryData(excelData);
			
		}
		else if($scope.inventoryType == "Product"){
			
			$scope.insertProductData(excelData);
			
		}
		
		//batchFormData.append('',);
		//toaster.pop('wait', 'Please Wait', 'Data Inserting....');
	}
	
	$scope.changeBatchDropdownData = function(index,item){
		
		console.log(index+" : "+item);
		//MappingChanged = 1;
		
		MappingData[index] = item;
		
		console.log(MappingData);
	}
	
	$scope.keyExists = function(key, items) {
		
		//console.log(items);
		 if (items.hasOwnProperty(key)) {
			return items[key];
		  }
		else{
			return "";
		}

	}
  
	/** Brand **/
	
		$scope.insertBrandData = function(response){
			
			console.log(response);
			
			var excelData = response;
			var countOFData = excelData.length;
			var batchFormData = new FormData();
			
			/** Mapping **/
				
				console.log(MappingData);
				var mapCount = MappingData.length;
				
				//return false;
				for(var mapIndex=0;mapIndex < mapCount;mapIndex++){
					
					batchFormData.append("mapping["+mapIndex+"]",MappingData[mapIndex]);
					
				}
			/** End **/
			
			for(var i=0;i<countOFData;i++){
				
				//var singleArray = [];
				var innerObject = {};
				
				//singleArray = excelData[i];
				
				innerObject.parentID = $scope.keyExists('ParentName',excelData[i]);
				innerObject.name = $scope.keyExists('BrandName',excelData[i]);
				innerObject.desc = $scope.keyExists('Description',excelData[i]);
				innerObject.display = "yes";
				
				//var extradata = {};
				// if(!excelData[i].hasOwnProperty('description')){
					// excelData[i].productCategoryDescription = "";
				// }
				
				// excelData[i].productParentCategoryId = "";
				// excelData[i].isDisplay = "yes";
			
				//excelData[i].push(extradata);
				var j = 0;
				
				angular.forEach(innerObject, function(value, key) {
					
					
					batchFormData.append("data["+i+"]["+j+"]",value);
					j++;
				});
			}
			
			toaster.pop('wait', 'Please Wait', 'Data Inserting....',300000000);
			
			apiCall.postCall(apiPath.batchBrand,batchFormData).then(function(response){
				
				toaster.clear();
				if(apiResponse.ok == response){
					
					toaster.pop('success', 'Title', 'Data Inserted SuccessFully');
					  $modalInstance.close('closed');
				}
				else{
					
					if(angular.isArray(response)){
						
						$scope.remarkData = response;
						$scope.hideExport = 1;
						
					}
					else{
						
						if(apiResponse.mappingError == response){
							
							toaster.pop('warning', 'opps!','Please Set Proper Mapping');
						}
						else{
							toaster.pop('warning', 'opps!',response);
						}
					}
					
				}
			});
		}
	/** End **/
	

	/** Category **/
		
		$scope.insertCategoryData = function(response){
			
			var excelData = response;
			var countOFData = excelData.length;
			
			var batchFormData = new FormData();
			
			/** Mapping **/
				
				console.log(MappingData);
				var mapCount = MappingData.length;
				
				//return false;
				for(var mapIndex=0;mapIndex < mapCount;mapIndex++){
					
					batchFormData.append("mapping["+mapIndex+"]",MappingData[mapIndex]);
					
				}
			/** End **/
			
			for(var i=0;i<countOFData;i++){
				
				var innerObject = {};
				
				innerObject.parentID = $scope.keyExists('ParentName',excelData[i]);
				innerObject.name = $scope.keyExists('CategoryName',excelData[i]);
				innerObject.desc = $scope.keyExists('Description',excelData[i]);
				innerObject.display = "yes";
				
				//var extradata = {};
				// if(!excelData[i].hasOwnProperty('description')){
					// excelData[i].productGroupDescription = "";
				// }
				
				// excelData[i].productGroupParentId = "";
				// excelData[i].isDisplay = "yes";
			
				//excelData[i].push(extradata);
				var j = 0;
				
				angular.forEach(innerObject, function(value, key) {
					
					
					batchFormData.append("data["+i+"]["+j+"]",value);
					j++;
					
				});
			}
			
			toaster.pop('wait', 'Please Wait', 'Data Inserting....',30000000);
			
			apiCall.postCall(apiPath.batchCategory,batchFormData).then(function(response){
				
				toaster.clear();
				if(apiResponse.ok == response){
					
					toaster.pop('success', 'Title', 'Data Inserted SuccessFully');
					  $modalInstance.close('closed');
				}
				else{
					if(angular.isArray(response)){
						
						$scope.remarkData = response;
						$scope.hideExport = 1;
						
					}
					else{
						
						if(apiResponse.mappingError == response){
							
							toaster.pop('warning', 'opps!','Please Set Proper Mapping');
						}
						else{
							toaster.pop('warning', 'opps!',response);
						}
					}
				}
			});
		}
	
	/** End **/
	
	/** Product **/
	
		$scope.insertProductData = function(response){
			
			var excelData = response;
			var countOFData = excelData.length;
			
			var batchFormData = new FormData();
			
			/** Mapping **/
				
				console.log(MappingData);
				var mapCount = MappingData.length;
				
				//return false;
				for(var mapIndex=0;mapIndex < mapCount;mapIndex++){
					
					batchFormData.append("mapping["+mapIndex+"]",MappingData[mapIndex]);
					
				}
			/** End **/
			
			for(var i=0;i<countOFData;i++){
				
				var innerObject = {};
				
				//singleArray = excelData[i];
				
				innerObject.companyName = $scope.keyExists('CompanyName',excelData[i]);
				innerObject.BranchName = $scope.keyExists('BranchName',excelData[i]);
				innerObject.BrandName = $scope.keyExists('BrandName',excelData[i]);
				innerObject.CategoryName = $scope.keyExists('CategoryName',excelData[i]);
				innerObject.ProductName = $scope.keyExists('ProductName',excelData[i]);
				innerObject.Color = $scope.keyExists('Color',excelData[i]);
				innerObject.Size = $scope.keyExists('Size',excelData[i]);
				innerObject.Description = $scope.keyExists('Description',excelData[i]);
				innerObject.Measurement = $scope.keyExists('Measurement',excelData[i]);
				innerObject.PurchasePrice = $scope.keyExists('PurchasePrice',excelData[i]);
				
				innerObject.TaxMargin = $scope.keyExists('TaxMargin',excelData[i]);
				innerObject.TaxMarginFlat = $scope.keyExists('TaxMarginFlat',excelData[i]);
				innerObject.semiTaxMargin = $scope.keyExists('semiTaxMargin',excelData[i]);
				innerObject.Vat = $scope.keyExists('Vat',excelData[i]);
				innerObject.Margin = $scope.keyExists('Margin',excelData[i]);
				innerObject.marginFlat = $scope.keyExists('marginFlat',excelData[i]);
				innerObject.AdditionalTax = $scope.keyExists('AdditionalTax',excelData[i]);
				
				innerObject.MRP = $scope.keyExists('MRP',excelData[i]);
				innerObject.minimumStock = $scope.keyExists('minimumStock',excelData[i]);
				innerObject.ProductMenu = $scope.keyExists('ProductMenu',excelData[i]);
				innerObject.ProductType = $scope.keyExists('ProductType',excelData[i]);
				innerObject.MaxSaleQty = $scope.keyExists('MaxSaleQty',excelData[i]);
				innerObject.NotForSale = $scope.keyExists('NotForSale',excelData[i]);
				innerObject.BestBeforeTime = $scope.keyExists('BestBeforeTime',excelData[i]);
				innerObject.BestBeforeType = $scope.keyExists('BestBeforeType',excelData[i]);
				innerObject.CessFlat = $scope.keyExists('CessFlat',excelData[i]);
				innerObject.CessPercentage = $scope.keyExists('CessPercentage',excelData[i]);
				innerObject.opening = $scope.keyExists('opening',excelData[i]);
				// innerObject.MinimumStock = $scope.keyExists('MinimumStock',excelData[i]);
				
				
				
				var j = 0;
				
				angular.forEach(innerObject, function(value, key) {
					
					
					batchFormData.append("data["+i+"]["+j+"]",value);
					j++;
					
				});
			}
			
			toaster.pop('wait', 'Please Wait', 'Data Inserting....',3000000000);
			
			apiCall.postCall(apiPath.batchProduct,batchFormData).then(function(response){
				
				toaster.clear();
				if(apiResponse.ok == response){
					
					toaster.pop('success', 'Title', 'Data Inserted SuccessFully');
					  $modalInstance.close('closed');
				}
				else{
					
					if(angular.isArray(response)){
						
						$scope.remarkData = response;
						$scope.hideExport = 1;
						
					}
					else{
						
						if(apiResponse.mappingError == response.mapping_error){
							
							toaster.pop('warning', 'opps!','Please Set Proper Mapping');
						}
						else{
							toaster.pop('warning', 'opps!',response);
						}
					}
				}
			});
		}
	
	/** End **/
	
	$scope.exportData = function () {
       alasql('SELECT * INTO XLSX("remark.xlsx",{headers:true}) FROM ?',[$scope.remarkData]);
    };
}

InventoryBatchModalController.$inject = ["$scope", "$modalInstance","$rootScope","$http","apiCall","apiPath","apiResponse","$timeout","getSetFactory","$state","$window","toaster","inventoryType"];
