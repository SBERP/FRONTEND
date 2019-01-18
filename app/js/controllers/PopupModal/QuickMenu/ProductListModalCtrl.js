
/**=========================================================
 * Module: AccProductListModalController.js
 * Controller for input components
 =========================================================*/

App.controller('AccProductListModalController', AccProductListModalController);

function AccProductListModalController($scope,toaster,productFactory,fetchArrayService,$modalInstance,$rootScope, $filter, ngTableParams,apiCall,apiPath,companyId,validationMessage,apiResponse,getSetFactory,maxImageSize) {
  'use strict';
  
  $scope.stockModel=[];
			
	var vm = this;
	var formdata = new FormData();
	var data = [];
	$scope.filteredItems;
	$scope.filteredItems1;
	var productArray=[];
	var accArray=[];
	var serviceArray=[];
	$scope.defaultDataLoad = function()
	{
		productFactory.getProductByCompany(companyId.companyId).then(function(response){
			// console.log("companywise product data = ",data);
			var productData = fetchArrayService.getfilteredArray(response,'ok','productMenu');
			// console.log("productData = ",productData);
			data = angular.copy(productData);
			if(data.length!=0)
			{
				for(var arrayData=0;arrayData<data.length;arrayData++)
				{
					if(data[arrayData].productType=="product")
					{
						// console.log("iff");
						productArray.push(data[arrayData]);
					}
					else if(data[arrayData].productType=="accessories")
					{
						accArray.push(data[arrayData]);
					}
					else
					{
						serviceArray.push(data[arrayData]);
					}
				}
			}
		});
	}
	$scope.defaultDataLoad();
	$scope.enableDisableColor = true;
	$scope.enableDisableSize = true;
	// $scope.enableDisableBestBefore = true;
	//get setting data
	$scope.getOptionSettingData = function(){
		toaster.clear();
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
						$scope.enableDisableColor = arrayData1.productColorStatus=="enable" ? true : false;
						// console.log("color = ",$scope.enableDisableColor);
						$scope.enableDisableSize = arrayData1.productSizeStatus=="enable" ? true : false;
						$scope.enableDisableMRPRequire = arrayData1.productMrpRequireStatus=="enable" ? true : false;
						// console.log("size",$scope.enableDisableSize);
						// $scope.enableDisableBestBefore = arrayData1.productBestBeforeStatus=="enable" ? true : false;
					}
				}
			}
		});
	}

	$scope.getOptionSettingData();
	$scope.tableParams = new ngTableParams({
		  page: 1,            // show first page
		  count: 10        // count per page
		  
	  }, {
		  // counts: [],
		  total: data.length, // length of data
		  getData: function($defer, params) {
			 
			var filteredData = params.filter() ?
			  $filter('filter')(data, params.filter()) :
			  data;
			 // $scope.filteredItems1 = orderedData;
			var orderedData = params.sorting() ?
			  $filter('orderBy')(filteredData, params.orderBy()) :
			  data;
			   
			params.total(orderedData.length); // set total for recalc pagination
			$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));

			$scope.totalData = data.length;
			$scope.pageNumber = params.page();
			$scope.itemsPerPage = params.count();
			$scope.totalPages = Math.ceil($scope.totalData/params.count());
			
		  }
	  });

	$scope.tableParams1 = new ngTableParams({
		  page: 1,            // show first page
		  count: 10        // count per page
		  
	  }, {
		  // counts: [],
		  total: data.length, // length of data
		  getData: function($defer, params) {
			 
			var filteredData = params.filter() ?
			  $filter('filter')(data, params.filter()) :
			  data;
			 // $scope.filteredItems1 = orderedData;
			var orderedData = params.sorting() ?
			  $filter('orderBy')(filteredData, params.orderBy()) :
			  data;
			   
			params.total(orderedData.length); // set total for recalc pagination
			$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));

			$scope.totalData = data.length;
			$scope.pageNumber = params.page();
			$scope.itemsPerPage = params.count();
			$scope.totalPages = Math.ceil($scope.totalData/params.count());
			
		  }
	  });

	$scope.tableParams2 = new ngTableParams({
		  page: 1,            // show first page
		  count: 10        // count per page
		  
	  }, {
		  // counts: [],
		  total: data.length, // length of data
		  getData: function($defer, params) {
			 
			var filteredData = params.filter() ?
			  $filter('filter')(data, params.filter()) :
			  data;
			 // $scope.filteredItems1 = orderedData;
			var orderedData = params.sorting() ?
			  $filter('orderBy')(filteredData, params.orderBy()) :
			  data;
			   
			params.total(orderedData.length); // set total for recalc pagination
			$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));

			$scope.totalData = data.length;
			$scope.pageNumber = params.page();
			$scope.itemsPerPage = params.count();
			$scope.totalPages = Math.ceil($scope.totalData/params.count());
			
		  }
	  });

	// vm.tableParams1 = new ngTableParams({
	// 	  page: 1,            // show first page
	// 	  count: 10        // count per page
		  
	//   }, {
	// 	  counts: [],
	// 	  total: data.length, // length of data
	// 	  getData: function($defer, params) {
			 
	// 		var filteredData = params.filter() ?
	// 		  $filter('filter')(data, params.filter()) :
	// 		  data;
	// 		var orderedData = params.sorting() ?
	// 		  $filter('orderBy')(filteredData, params.orderBy()) :
	// 		  data;

	// 		params.total(orderedData.length); // set total for recalc pagination
	// 		$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));

	// 		$scope.totalData = data.length;
	// 		$scope.pageNumber = params.page();
	// 		$scope.itemsPerPage = params.count();
	// 		$scope.totalPages = Math.ceil($scope.totalData/params.count());
			
	// 	  }
	//   });

	// vm.tableParams2 = new ngTableParams({
	// 	  page: 1,            // show first page
	// 	  count: 10        // count per page
		  
	//   }, {
	// 	  counts: [],
	// 	  total: data.length, // length of data
	// 	  getData: function($defer, params) {
			 
	// 		var filteredData = params.filter() ?
	// 		  $filter('filter')(data, params.filter()) :
	// 		  data;
	// 		var orderedData = params.sorting() ?
	// 		  $filter('orderBy')(filteredData, params.orderBy()) :
	// 		  data;

	// 		params.total(orderedData.length); // set total for recalc pagination
	// 		$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));

	// 		$scope.totalData = data.length;
	// 		$scope.pageNumber = params.page();
	// 		$scope.itemsPerPage = params.count();
	// 		$scope.totalPages = Math.ceil($scope.totalData/params.count());
			
	// 	  }
	//   });
	
	$scope.displayParseFloat=function(val) {
		
		return isNaN(parseFloat(val)) ? 0: parseFloat(val);
	}
	

	$scope.allProductData = function(){
		
		var filterArray = {};
		// console.log("selected data = ",$scope.selectedBoxArray);
		// filterArray.index = $scope.productIndex;
		// filterArray.companyId = $scope.addModelProduct.company.companyId;
		// filterArray.productName = $scope.addModelProduct.productName;
		// filterArray.color = $scope.addModelProduct.color;
		// filterArray.size = $scope.addModelProduct.size;
				
		$modalInstance.close($scope.selectedBoxArray);
			
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

	
	$scope.closeButton = function () {

		$modalInstance.dismiss();
    };

  	$scope.selectedBoxArray = [];
	$scope.clientFlag=0;
	
	$scope.changeBox = function(box,pData){
		
		//console.log(box+'...'+pData);
		if(box == true){
			$scope.selectedBoxArray.push(pData);
		}
		else{
			if($scope.selectedBoxArray!=undefined && $scope.selectedBoxArray!='')
			{
				var index = $scope.selectedBoxArray.indexOf(pData);
				$scope.selectedBoxArray.splice(index,1);
			}
		}
		if($scope.selectedBoxArray.length < 1){
			// $scope.sticker.multiQty = 0;
		}
	}
  
	$scope.changeAllBox = function(box){
		
		if(box == false){
			$scope.clientFlag=0;
			$scope.selectedBoxArray = [];
			var cnt  = data.length;
			for(var k=0;k<cnt;k++){
				data[k].selected = false;
			}
		}
		else{
			// console.log("vvv");
			$scope.clientFlag=1;
			$scope.selectedBoxArray = [];

			// console.log("selected box=",$scope.selectedBoxArray);
			var cnt  = $scope.selectedBoxArray.length;
			for(var k=0;k<cnt;k++){
				$scope.selectedBoxArray[k].selected = true;
			}
			
			// console.log("filter =",productArray);
			$scope.selectedBoxArray = productArray;	
		}
	}

	// $scope.changeAllBox1 = function(box){
		
	// 	if(box == false){
	// 		$scope.clientFlag=0;
	// 		$scope.selectedBoxArray = [];
	// 		var cnt  = data.length;
	// 		for(var k=0;k<cnt;k++){
	// 			data[k].selected = false;
	// 		}
	// 	}
	// 	else{
	// 		console.log("vvv");
	// 		$scope.clientFlag=1;
	// 		$scope.selectedBoxArray = [];

	// 		// console.log("selected box=",$scope.selectedBoxArray);
	// 		var cnt  = $scope.selectedBoxArray.length;
	// 		for(var k=0;k<cnt;k++){
	// 			$scope.selectedBoxArray[k].selected = true;
	// 		}
			
	// 		console.log("filter =",accArray);
	// 		$scope.selectedBoxArray = accArray;	
	// 	}
	// }
}
AccProductListModalController.$inject = ["$scope","toaster","productFactory","fetchArrayService","$modalInstance","$rootScope","$filter","ngTableParams","apiCall","apiPath","companyId","validationMessage","apiResponse","getSetFactory","maxImageSize"];