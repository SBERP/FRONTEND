
/**=========================================================
 * Module: BranchCtrl.js
 * Controller for ngTables
 =========================================================*/

App.controller('InvStockSummaryController', InvStockSummaryController);

function InvStockSummaryController($rootScope,$scope, $filter, ngTableParams,apiCall,apiPath,$location,apiResponse,toaster,getSetFactory,fetchArrayService,$modal) {
  'use strict';
  var vm = this;
  $scope.filteredItems=[];
	//$scope.brandradio="";
	$scope.enableDisableColor = true;
	$scope.enableDisableSize = true;
	$scope.enableItemizedPurchaseSales = true;
	var Modalopened = false;
	// $scope.enableDisableBestBefore = true;
	//get setting data
	$scope.getOptionSettingData = function()
	{
		toaster.clear();
		if ($rootScope.$storage.settingOptionArray.length > 0)
		{
			var product_setting = fetchArrayService.getfilteredSingleObject($rootScope.$storage.settingOptionArray,'product','settingType');
			var inventory_setting = fetchArrayService.getfilteredSingleObject($rootScope.$storage.settingOptionArray,'inventory','settingType');
			if (angular.isObject(product_setting))
			{
				if(product_setting.settingType=="product")
				{
					var arrayData1 = product_setting;
					$scope.enableDisableColor = arrayData1.productColorStatus=="enable" ? true : false;
					$scope.enableDisableSize = arrayData1.productSizeStatus=="enable" ? true : false;
					// $scope.enableDisableBestBefore = arrayData1.productBestBeforeStatus=="enable" ? true : false;
				}
			}
			if (angular.isObject(inventory_setting)) {
				var arrayData1 = inventory_setting;
				$scope.enableItemizedPurchaseSales = arrayData1.inventoryItemizeStatus=="enable" ? true : false;
			}
		}
		else
		{
			apiCall.getCall(apiPath.settingOption).then(function(response){
				var responseLength = response.length;
				for(var arrayData=0;arrayData<responseLength;arrayData++)
				{
					if(angular.isObject(response) || angular.isArray(response))
					{
						if(response[arrayData].settingType=="product")
						{
							var arrayData1 = response[arrayData];
							$scope.enableDisableColor = arrayData1.productColorStatus=="enable" ? true : false;
							$scope.enableDisableSize = arrayData1.productSizeStatus=="enable" ? true : false;
							// $scope.enableDisableBestBefore = arrayData1.productBestBeforeStatus=="enable" ? true : false;
						}
						if (response[arrayData].settingType=="inventory") {
							var arrayData1 = response[arrayData];
							$scope.enableItemizedPurchaseSales = arrayData1.inventoryItemizeStatus=="enable" ? true : false;
						}
					}
				}
			});
		}
	}

	$scope.getOptionSettingData();
  var data = [];
	var flag = 0;
	$scope.totalQty=0;
	$scope.pageQty=0;
	
	function filterDataForTable()
	{
		//console.time();
		var count = data.length;
		var iIndex = 0;
		while(iIndex < count) 
		{
		  	var index = fetchArrayService.myIndexOfObject(vm.productCategoryData,data[iIndex].product.productCategoryId,'productCategoryId');
			data[iIndex].productCategoryName = ""; //initialization of new property 
			data[iIndex].productCategoryName =	index.productCategoryName;  //set the data from nested obj into new property
			
			var groupIndex = fetchArrayService.myIndexOfObject(vm.productGroupData,data[iIndex].product.productGroupId,'productGroupId');
			
			data[iIndex].productGroupName = ""; //initialization of new property 
			data[iIndex].productGroupName = groupIndex.productGroupName;  //set the data from nested obj into new property
		  
			data[iIndex].productName = ""; //initialization of new property 
			data[iIndex].productName = data[iIndex].product.productName;  //set the data from nested obj into new property
			
			data[iIndex].color = ""; 
			data[iIndex].color = data[iIndex].product.color;
			data[iIndex].size = ""; 
			data[iIndex].size = data[iIndex].product.size;
			
			data[iIndex].qty = parseInt(data[iIndex].qty);
			
			iIndex++;
		}
		//console.timeEnd();
	}

	
	//calculate total qty
	$scope.calculateQty = function(){
		// console.log("viewwwwwwwwwwwww");
		$scope.pageQty=0;
		var dataLength = $scope.filteredItems.length;
		for(var index=0;index<dataLength;index++)
		{
			$scope.pageQty = $scope.pageQty+$scope.filteredItems[index].qty;
		}
		return $scope.pageQty;
	}

	//calculate total qty
	$scope.calculateTotalQty = function(){
		// console.log("viewwwwwwwwwwwww");
		$scope.totalQty=0;
		var dataLength = data.length;
		for(var index=0;index<dataLength;index++)
		{
			$scope.totalQty = $scope.totalQty+data[index].qty;
		}
		return $scope.totalQty;
	}

	$scope.showProduct = function(){
		
		if($scope.stateCheck){
			$scope.getProduct($scope.stateCheck.companyId);
		}
		else{
			
			toaster.clear();
			toaster.pop('wait', 'Please Wait', 'Data Loading....',60000);
			
			apiCall.getCall(apiPath.getAllProduct).then(function(response){
				
				toaster.clear();
				if(angular.isArray(response)){
					data = response;
					filterDataForTable();
				}
				else{
					data = [];
					toaster.pop('alert', 'Opps!!', 'No Product Available');
				}
				
				 vm.tableParams.reload();
				 vm.tableParams.page(1);
			});
		}
	}
	
	$scope.init = function (){
		
		vm.productCategoryData=[];
		apiCall.getCall(apiPath.getAllCategory).then(function(response2){
			vm.productCategoryData = response2;
		});
		
		vm.productGroupData=[];
		apiCall.getCall(apiPath.getAllGroup).then(function(response2){
			vm.productGroupData = response2;
		});

		vm.states=[];
		apiCall.getCall(apiPath.getAllCompany).then(function(response2){
			
			vm.states = response2;
			//Set default Company
			$scope.stateCheck = apiCall.getDefaultCompanyFilter(response2);
			$scope.getProduct($scope.stateCheck.companyId);
		});
		
	}
	$scope.init();
	
	$scope.getProduct = function(id){
		
		toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Data Loading....',60000);
			
		apiCall.getCall(apiPath.stockSummary+id+apiPath.stockSummary2).then(function(response){
			
			toaster.clear();
			
			if(angular.isArray(response)){
				data = response;
				filterDataForTable();
			}
			else{
				data = [];
				toaster.pop('alert', 'Opps!!', 'No Product Available');
			}
			
			if(flag == 0){
				//console.log('zero');
				$scope.TableData();
			}
			else{
				//console.log('one');
				 vm.tableParams.reload();
				 vm.tableParams.page(1);
			}
		});
	}
	

	$scope.TableData = function(){
		
	  vm.tableParams = new ngTableParams({
		  page: 1,            // show first page
		  count: 10,          // count per page
		  sorting: {
			  productName: 'asc'     // initial sorting
		  }
	  }, {
		  //counts: [],
		  total: data.length, // length of data
		  getData: function($defer, params) {
			 
			  // use build-in angular filter
			  if(!$.isEmptyObject(params.$params.filter) && ((typeof(params.$params.filter.productName) != "undefined" && params.$params.filter.productName != "")  || (typeof(params.$params.filter.productCategoryName) != "undefined" && params.$params.filter.productCategoryName != "") || (typeof(params.$params.filter.productGroupName) != "undefined" && params.$params.filter.productGroupName != "") || (typeof(params.$params.filter.color) != "undefined" && params.$params.filter.color != "") || (typeof(params.$params.filter.size) != "undefined" && params.$params.filter.size != "") || (typeof(params.$params.filter.qty) != "undefined" && params.$params.filter.qty != "")))
			  {
					 var orderedData = params.filter() ?
					 $filter('filter')(data, params.filter()) :
					 data;

					  vm.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
					  $scope.searchQty=0; 
					  params.total(orderedData.length); // set total for recalc pagination
					  $defer.resolve(vm.users);
					  var dataLength1 = orderedData.length;
					    //calculate search qty
						for(var index=0;index<dataLength1;index++)
						{
							$scope.searchQty = $scope.searchQty+orderedData[index].qty;
						}
			  }
			else
			{
				params.total(data.length);
				  
			}
			 
			 if(!$.isEmptyObject(params.$params.sorting))
			  {
				 //alert('ggg');
				  var orderedData = params.sorting() ?
						  $filter('orderBy')(data, params.orderBy()) :
						  data;
		  
				  $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));

			  }
			$scope.totalData = data.length;
			$scope.pageNumber = params.page();
            $scope.itemsPerPage = params.count();
            $scope.totalPages = Math.ceil($scope.totalData/params.count());
		  }
	  });
		flag = 1;
	}
	$scope.itemizeTrnModal = function(productId,size){
		if (Modalopened) return;
  		toaster.pop('wait', 'Please Wait', 'popup opening....',600000);
		var modalInstance = $modal.open({
		  templateUrl: 'app/views/PopupModal/Accounting/ItemizeStockModal.html',
		  controller: 'AccItemizeStockModalController as table',
		  size: size,
		  resolve:{
			  productId: function(){
				  return productId;
			  },
			  stockType: function(){
				  return 'stockSummary';
			  }
		  }
		});
		Modalopened = true;
		modalInstance.opened.then(function() {
			toaster.clear();
		});
		modalInstance.result.then(function () {
			Modalopened = false;
		},function(){
			Modalopened = false;
		});
	}
}
InvStockSummaryController.$inject = ["$rootScope","$scope", "$filter", "ngTableParams","apiCall","apiPath","$location","apiResponse","toaster","getSetFactory","fetchArrayService","$modal"];