/**=========================================================
 * Module: InvStockCtrl.js
 * Controller for ngTables
 =========================================================*/
App.controller('InvStockController', InvStockController);
function InvStockController($rootScope,$scope, $filter, ngTableParams,getSetFactory,apiCall,apiPath,$window,apiResponse,toaster,fetchArrayService,$modal,$state) {
  'use strict';
  var vm = this;
	//$scope.brandradio="";
	 var erpPath = $rootScope.erpPath; //Erp Path
	 
	 $scope.disableButton = false;
	 
	 var flag = 0;
	 $scope.AllTransactionData = [];
	 vm.tableParams;
	$scope.getArray;
	$scope.enableItemizedPurchaseSales = false;
	var data = [];
	var getData = getSetFactory.get();
	getSetFactory.blank();
	var Modalopened = false;
	//console.log(getData);
	//return false;
	
	//var getData = { "Content-Type": undefined, "fromDate": "1-02-2017", "toDate": "25-02-2017", "companyId": "45", "productId": "1108" };
	// var getData = { "Content-Type": undefined, "fromDate": "1-02-2017", "toDate": "25-02-2017", "companyId": "45"};
	//var CompanyID = getData.companyId;
	
	function filterProductData () {
        vm.states.map(function(mData) {
            mData['displayProductName'] = mData['productName'];
            if ($scope.enableAlterLanguage && mData['altProductName'] != null && mData['altProductName'] != '') {
                mData['displayProductName'] = mData['altProductName'];
            }
            if (color_setting || size_setting || variant_setting) {
                var settingArray = [];
                if (color_setting) {
                    settingArray.push(mData['color']);
                }
                if (size_setting) {
                    settingArray.push(mData['size']);
                }
                if (variant_setting) {
                    settingArray.push(mData['variant']);
                }
                mData['displayProductName'] += " (";
                for (var i = 0; i < settingArray.length; i++) {
                    if (i != 0) {
                        mData['displayProductName'] += " | ";
                    }
                    mData['displayProductName'] += settingArray[i];
                }
                mData['displayProductName'] += ")";
            }
            return mData;
        });
    }

	$scope.displayFromDate = getData.fromDate;
	$scope.displayToDate = getData.toDate;
	
	var CompanyID = getData.companyId;
	
	delete getData.companyId;
	
	
	var dataSet = angular.copy(getData);
	vm.states = [];
	
	if(dataSet.productId) {
		var Path = apiPath.getAllProduct+'/'+dataSet.productId;
		
		apiCall.getCall(Path).then(function(response) {
			toaster.clear();
			toaster.pop('wait', 'Please Wait', 'Data Loading....',60000);
			
			//console.log(response);
			vm.states.push(response);
			filterProductData();
			$scope.allProductModel = response;
			apiCall.getCall(apiPath.getAllCompany+'/'+response.companyId).then(function(response2){
				// console.log(response2);
				$scope.displayCompany = response2.companyName;
				$scope.apiCallStock();
			});
		});
		
	}
	else{
		var Path = apiPath.getProductByCompany+CompanyID;
		
		apiCall.getCallHeader(Path,dataSet).then(function(response) {
			
			toaster.pop('wait', 'Please Wait', 'Data Loading....',60000);
			
			//console.log(response);
			if(apiResponse.notFound != response){
				
				vm.states = response;
				filterProductData();
				$scope.allProductModel = response[0];
				apiCall.getCall(apiPath.getAllCompany+'/'+response[0].companyId).then(function(response2){
					$scope.displayCompany = response2.companyName;
				});
					$scope.apiCallStock();
			}
			else{
				toaster.clear();
				toaster.pop('info', 'Message', 'No Product Available');		
			}
		});
	}

	$scope.enableAlterLanguage = false;
	$scope.alterLanguageKey = "productName";
	var color_setting = false,size_setting = false,variant_setting = false;

	$scope.getOptionSettingData = function()
	{
		toaster.clear();
		if ($rootScope.$storage.settingOptionArray.length > 0)
		{
			var inventory_setting = fetchArrayService.getfilteredSingleObject($rootScope.$storage.settingOptionArray,'inventory','settingType');
			var product_setting = fetchArrayService.getfilteredSingleObject($rootScope.$storage.settingOptionArray,'product','settingType');
  			var language_setting = fetchArrayService.getfilteredSingleObject($rootScope.$storage.settingOptionArray,'language','settingType');

			if (angular.isObject(inventory_setting)) {
				var arrayData1 = inventory_setting;
				$scope.enableItemizedPurchaseSales = arrayData1.inventoryItemizeStatus=="enable" ? true : false;
			}
			if (angular.isObject(product_setting)) {
                if (product_setting.productColorStatus == "enable") {
                    color_setting = true;
                }
                if (product_setting.productSizeStatus == "enable") {
                    size_setting = true;
                }
                if (product_setting.productVariantStatus == "enable") {
                    variant_setting = true;
                }
            }
			if (angular.isObject(language_setting)) {
				var arrayData1 = language_setting;
				$scope.enableAlterLanguage = arrayData1.languageSettingType=="hindi" ? true : false;
				if ($scope.enableAlterLanguage) {
					$scope.alterLanguageKey = "altProductName";
				}
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
						if (response[arrayData].settingType=="inventory") {
							var arrayData1 = response[arrayData];
							$scope.enableItemizedPurchaseSales = arrayData1.inventoryItemizeStatus=="enable" ? true : false;
						}
						if (response[arrayData].settingType=="product") {
							var arrayData1 = response[arrayData];
							if (arrayData1.productColorStatus == "enable") {
			                    color_setting = true;
			                }
			                if (arrayData1.productSizeStatus == "enable") {
			                    size_setting = true;
			                }
			                if (arrayData1.productVariantStatus == "enable") {
			                    variant_setting = true;
			                }
						}
						if (response[arrayData].settingType=="language") {
							var arrayData1 = response[arrayData];
							$scope.enableAlterLanguage = arrayData1.languageSettingType=="hindi" ? true : false;
							if ($scope.enableAlterLanguage) {
								$scope.alterLanguageKey = "altProductName";
							}
						}
					}
				}
			});
		}
	}
	$scope.getOptionSettingData();
	$scope.showProduct = function(){
		
		toaster.clear();
		$scope.disableButton = false;
		
		var dropProductId = $scope.allProductModel.productId;
		
		var subFlag = 0;
		//alert($scope.allProductModel.productId);
		data = [];
		var productLength = $scope.AllTransactionData.length;
		for(var allProductIndex=0;allProductIndex<productLength;allProductIndex++){
			
			var singleProductArray = $scope.AllTransactionData[allProductIndex];
			
		
			if(singleProductArray.length != 0){
				
				if(singleProductArray[0].product.productId == dropProductId)
				{
					subFlag = 1;
					var singleTransactionDataDrop = singleProductArray;
					
					//$scope.allProductModel = singleProductArray[0].product;
					
					//console.log(singleTransactionData);
					$scope.calculation(singleTransactionDataDrop);
					
					break;
					
				}
			}
			
		}
		
		if(subFlag == 0){
			
			toaster.pop('info', 'Message', 'No Data Found');
			vm.tableParams.reload();
			vm.tableParams.total(data.length);
			 vm.tableParams.page(1);
			
		}
		
	}
	
	
	$scope.apiCallStock = function(){
		
		apiCall.getCallHeader(apiPath.getProductByCompany+CompanyID+'/transaction',getData).then(function(responseDrop){
		
			//console.log(responseDrop);
				
				if(apiResponse.noContent == responseDrop || responseDrop == ""){
					
					toaster.clear();
					
					toaster.pop('info', 'Message', 'No Data Found');
					 
				
				}
				else if(apiResponse.contentNotProper == responseDrop){
					
					toaster.clear();
					toaster.pop('info', 'Message', 'Please Fill Go to Search');
					
					
				}
				else{
					
					toaster.clear();
					
					$scope.AllTransactionData = responseDrop;
					
					// if(responseDrop[0].length != 0){
						
						
						
						// var singleTransactionData = responseDrop[0];
						
						// $scope.allProductModel = responseDrop[0][0].product;
						// $scope.displayCompany = responseDrop[0][0].company.companyName;
						
						// $scope.calculation(singleTransactionData);
						
					// }
					// else{
						
						
						// toaster.pop('info', 'Message', 'No Data Found');
					// }
					$scope.showProduct();
					
					
					
				}
			
		});
	
	}
	
	
	
	
 
	$scope.calculation = function(responseDrop){
		$scope.disableButton = true;
		
		var balance = [];
		var balanceArray = [];
		
		for(var i=0;i<responseDrop.length;i++)
		{
			var inward = {};
			var outward = {};
			
		
			var transData = responseDrop[i];
			
			if(transData.transactionType == 'Inward'){
				
				if(balanceArray.length == 0){
					
					inward.qty = parseInt(transData.qty);
					inward.price = transData.price * transData.qty;
					inward.date = transData.transactionDate;
					inward.jfId = transData.jfId;
					
					balanceArray.push(inward);
				}
				else{
					 
					if(balanceArray[0].qty < 0)
					{	
						var outward1 = {};
						outward1.qty = 0;  //4
						outward1.date = transData.transactionDate;
						outward1.jfId = transData.jfId;
				
						inward.qty = parseInt(transData.qty);
						
						inward.date = transData.transactionDate;
						inward.jfId = transData.jfId;
						var balanceLength = balanceArray.length;
						var index=0;
						for(var j=0;j<balanceLength;j++)
						{
							var diff = inward.qty + balanceArray[index].qty;
							
							if(diff==0 || diff>0)
							{
								inward.qty = diff;
								
								if(j == (balanceLength - 1) && inward.qty > 0)
								{
									inward.price = inward.qty * transData.price;
									balanceArray[0] = inward;
								}
								else{
									
									balanceArray.splice(index,1);
								
								}
								
							}
							else if(diff<0)
							{
								//var purchasePrice=balanceArray[index].price/balanceArray[index].qty;
								outward1.qty = balanceArray[index].qty + inward.qty;
								outward1.price = 1000;
								var demo = {};
								demo = angular.copy(outward1);
								balanceArray[index] = demo;
								inward.qty = 0;
								index++;
							}
							else
							{
								
							}
							
						}
					}
					else{
						
						inward.qty = parseInt(transData.qty);
						inward.price = transData.price * transData.qty;
						inward.date = transData.transactionDate;
						inward.jfId = transData.jfId;
						
						balanceArray.push(inward);
					}
				}
				
			}
			else if(transData.transactionType == 'Outward')
			{	
				var outward1 = {};
				outward1.qty = 0;  //4
				outward1.price = transData.price;
				outward1.date = transData.transactionDate;
				outward1.jfId = transData.jfId;
				
				//console.log(transData.qty);
				//console.log(balanceArray);
				
				outward.qty = parseInt(transData.qty);  //4
				outward.price = transData.price;
				outward.date = transData.transactionDate;
				outward.jfId = transData.jfId;
				
				//console.log(balanceArray);
				if(balanceArray.length == 0){
					
					
					var minusObject = {};
					minusObject.qty = -Math.abs(transData.qty);  //4
					minusObject.price = transData.price;
					minusObject.date = transData.transactionDate;
					minusObject.jfId = transData.jfId;
					balanceArray.push(minusObject);
				}
				else{
					
				
					if(balanceArray[0].qty > outward.qty)
					{
						var purchasePrice=balanceArray[0].price/balanceArray[0].qty;
						outward.qty = balanceArray[0].qty - outward.qty;
						outward.price = outward.qty * purchasePrice;
						balanceArray[0] = outward;
					}
					else if(balanceArray[0].qty == outward.qty)
					{
						balanceArray.splice(0,1);
					}
					else if(balanceArray[0].qty < outward.qty)
					{
						
						if(balanceArray[0].qty < 0){
							
							var minusObject = {};
							minusObject.qty = -Math.abs(outward.qty);  //4
							minusObject.price = outward.price;
							minusObject.date = transData.transactionDate;
							minusObject.jfId = transData.jfId;
						
							balanceArray.push(minusObject);
							
						}
						else{
							
							var balanceLength = balanceArray.length;
							var index=0;
							for(var j=0;j<balanceLength;j++)
							{
						
								var diff = outward.qty - balanceArray[index].qty;
								if(diff==0 || diff>0)
								{
									outward.qty = diff;
									
									if(j == (balanceLength - 1) && outward.qty > 0)
									{
											outward1.qty =  -Math.abs(outward.qty);
										balanceArray[0] = outward1;
									}
									else{
										
										balanceArray.splice(index,1);
									
									}
								
								}
								else if(diff<0)
								{
									var purchasePrice=balanceArray[index].price/balanceArray[index].qty;
									outward1.qty = balanceArray[index].qty - outward.qty;
									outward1.price = outward1.qty * purchasePrice;
									var demo = {};
									demo = angular.copy(outward1);
									balanceArray[index] = demo;
									outward.qty = 0;
									index++;
								}
								else
								{
									
								}
							}
						}
						
					}
				}
				 
			}
	
			 balance[i] = balanceArray.slice(0);
			
			 responseDrop[i]["balance"] = balance[i];
		}
		
		
		//console.log(responseDrop);
		
		if(flag == 0){
			
			$scope.contents = responseDrop;
			
			$scope.contents.sort(function(a, b){
				
				var entDate = a.transactionDate.split("-").reverse().join("-");
							var toDate = b.transactionDate.split("-").reverse().join("-");
							var dateA=new Date(entDate), dateB=new Date(toDate);
							
				//var dateA=new Date(a.transactionDate), dateB=new Date(b.transactionDate);
				return dateB-dateA; 
			});
			
			data= $scope.contents;
			
			//console.log('if');
			$scope.TableData();
			flag = 1;
		}
		else{
			
			data= responseDrop;
			//console.log('else');
			vm.tableParams.reload();
			vm.tableParams.total(data.length);
			 vm.tableParams.page(1);
		}
		
		//$scope.getArray = $scope.contents; // CSV Export
		
		//$scope.getArray = data;
	}
 
 
$scope.TableData = function(){
	
  vm.tableParams = new ngTableParams({
      page: 1,            // show first page
      count: 10,          // count per page
      sorting: {
          date: 'asc'     // initial sorting
      }
  }, {
	  // counts: [],
      total: data.length,
      getData: function($defer, params) {
          
        var orderedData;
        if(params.sorting().date === 'asc'){
          data.sort(function (a, b) {
			  var entDate = a.transactionDate.split("-").reverse().join("-");
						var toDate = b.transactionDate.split("-").reverse().join("-");
						var dateA=new Date(entDate), dateB=new Date(toDate);
         // var dateA = new Date(a.date), dateB = new Date(b.date);
            return dateA - dateB; //sort by date descending
          });
          orderedData = data;
        } else if(params.sorting().date === 'desc') {
          data.sort(function (a, b) {
			  var entDate = a.transactionDate.split("-").reverse().join("-");
						var toDate = b.transactionDate.split("-").reverse().join("-");
						var dateA=new Date(entDate), dateB=new Date(toDate);
          //var dateA = new Date(a.date), dateB = new Date(b.date);
            return dateB - dateA; //sort by date descending
          });
          orderedData = data;
        } else if(!params.sorting().date){
          if (params.filter().term) {
            orderedData = params.filter() ? $filter('filter')(data, params.filter().term) : data;
          } else {
            orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
          }
          
        }
        $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
		
		 $scope.totalData = data.length;
		$scope.pageNumber = params.page();
		$scope.itemsPerPage = params.count();
		$scope.totalPages = Math.ceil($scope.totalData/params.count());
        
      }
  });
  //$scope.getArray = data;
}
$scope.itemizeTrnModal = function(item,type,balance,size)
  {
  	if (Modalopened) return;
  	var productObject = {};
  	productObject.productId = item.product.productId;
	toaster.pop('wait', 'Please Wait', 'popup opening....',600000);
	if (type == 'register') {
		productObject.jfId = item.jfId;
		var stockType = 'stockRegister';
	}else if (type == 'balance') {
		
		productObject.jfId = balance.jfId;
		productObject.fromDate = $scope.displayFromDate;
		productObject.toDate = item.createdAt;
		var stockType = 'stockBalance';
	}
	var modalInstance = $modal.open({
	  templateUrl: 'app/views/PopupModal/Accounting/ItemizeStockModal.html',
	  controller: 'AccItemizeStockModalController as table',
	  size: size,
	  resolve:{
		  productId: function(){
			  return productObject;
		  },
		  stockType: function(){
			  return stockType;
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
  
  $scope.edit_comp = function()
  {
	  alert('Edit');
  }
  
  $scope.delete_comp = function()
  {
	  alert('Delete');
  }
  
	$scope.generatePdf = function(operation){
	 
		toaster.clear();
		toaster.pop('wait', 'Please Wait', operation.toUpperCase()+' Loading...',60000);
		
		getData.operation = operation;
		delete getData.authenticationToken;
		
		getData.productId = $scope.allProductModel.productId;
		//console.log(getData);
		//return false;
		apiCall.getCallHeader(apiPath.getProductByCompany+CompanyID+'/transaction/details',getData).then(function(responseDrop){
		
			//console.log(responseDrop);
			toaster.clear();
			
			if(angular.isObject(responseDrop)  && responseDrop.hasOwnProperty('documentPath')){
				
				var pdfPath = erpPath+responseDrop.documentPath;
				if(operation == 'pdf'){
					$window.open(pdfPath, '_blank');
				}
				else{
					$window.open(pdfPath,"_self");
				}
			}
			else{
				
				if(responseDrop.status == 500){
					
					toaster.pop('warning', 'Opps!', responseDrop.statusText);
				}
				else{
					toaster.pop('warning', 'Opps!', responseDrop);
				}
				
				//alert('Something Wrong');
			}
		
		});
	}
	$scope.goToBillPage = function(trnType,jfId,companyId)
	{
		var headerCr = {'Content-Type': undefined,'companyId':companyId};
		var path;
		var gotoUrl;
		if (trnType == 'purchase') {
			path = apiPath.postPurchaseBill+'/'+jfId;
			gotoUrl = 'app.PurchaseBill';
		}else if (trnType == 'sales') {
			path = apiPath.postBill+'/'+jfId;
			gotoUrl = 'app.WholesaleBill';
		}
		apiCall.getCallHeader(path,headerCr).then(function(response){
          	getSetFactory.set(response[0]);
          	$state.go(gotoUrl);
        });
	}
}
InvStockController.$inject = ["$rootScope","$scope", "$filter", "ngTableParams","getSetFactory","apiCall","apiPath","$window","apiResponse","toaster","fetchArrayService","$modal","$state"];