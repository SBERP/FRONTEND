
/**=========================================================
 * Module: InvStockCtrl.js
 * Controller for ngTables
 =========================================================*/
	
App.controller('PriceListRetailSalesController', PriceListRetailSalesController);

function PriceListRetailSalesController($rootScope,$scope, $filter, ngTableParams,getSetFactory,apiCall,apiPath,saleType,$window,productArrayFactory,toaster,apiResponse,fetchArrayService,productFactory) {
  'use strict';
  var vm = this;
	//$scope.brandradio="";
	 var erpPath = $rootScope.erpPath; //Erp Path
	 
	$scope.saleType = saleType;
	
	$scope.disableButton = true;
 	var data = [];
 
	var getData = getSetFactory.get();
	getSetFactory.blank();
	//console.log(getData);
	// return false;
	
	//var getData = { "Content-Type": undefined, "fromDate": "14-01-2017", "toDate": "30-03-2017", "companyId": "46", "productId": "908" };
	//var CompanyID = getData.companyId;
	
	function loadCompanyData(companyId,callback)
	{
		//Get Documents Images
		apiCall.getCall(apiPath.getAllCompany+'/'+companyId).then( function (response) {
			callback(response);
		});
	}

	var CompanyID = getData.companyId;

	loadCompanyData(CompanyID,function(resCompany){
		$scope.displayCompany = resCompany.companyName;
	});
	

	var noOfDecimalPoints = parseInt(getData.noOfDecimalPoints);
	
	delete getData.companyId;
	delete getData.noOfDecimalPoints;
	
	
	$scope.enableAlterLanguage = false;
	$scope.alterLanguageKey = "productName";
	/* Setting data for hide/show Color & Size */
		$scope.setting_color = false;
		$scope.setting_size = false;
		if ($rootScope.$storage.settingOptionArray.length > 0)
		{
			var product_setting = fetchArrayService.getfilteredSingleObject($rootScope.$storage.settingOptionArray,'product','settingType');
			var language_setting = fetchArrayService.getfilteredSingleObject($rootScope.$storage.settingOptionArray,'language','settingType');

			if (angular.isObject(product_setting))
			{
				if(product_setting.productColorStatus == "enable") 
				{
					$scope.setting_color = true;
				}

				if(product_setting.productSizeStatus == "enable") 
				{
					$scope.setting_size = true;	
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
			apiCall.getCall(apiPath.settingOption).then(function(response2)
			{
				if(angular.isObject(response2) || angular.isArray(response2))
				{
					var responseLength = response2.length;
					for(var arrayData=0;arrayData<responseLength;arrayData++)
					{
						if(response2[arrayData].hasOwnProperty("product")) {

							arrayData1 = response2[arrayData];
							if(arrayData1.productColorStatus == "enable") 
							{
								$scope.setting_color = true;
							}

							if(arrayData1.productSizeStatus == "enable") 
							{
								$scope.setting_size = true;	
							}
						}
						if (response2[arrayData].settingType=="language") {
							var arrayData1 = response2[arrayData];
							$scope.enableAlterLanguage = arrayData1.languageSettingType=="hindi" ? true : false;
							if ($scope.enableAlterLanguage) {
								$scope.alterLanguageKey = "altProductName";
							}
						}
					}
				}
			});
		}
		
	/* End Setting */


	/*****  Tree Data  *****/
	
	
	var tree;
	var rawTreeData2=[{"categoryId":"","productParentCategoryId":"","categoryName":"","groupName":"","productName":"","color":"","size":"","price":"","mrp":"","qty":""}];

	/* Check Setting for Color and Size */
		if ($scope.setting_color) {
	        var colorObj = {
	        	"color":""
			};
			// rawTreeData2.splice(5,0,colorObj);
			rawTreeData2[0].color = "";
		}

		if ($scope.setting_size) {
	        var sizeObj = {
	        	"size":""
			};
			rawTreeData2[0].size = "";
			if($scope.setting_color){
				// rawTreeData2.splice(6,0,sizeObj);
			}
			else{
				// rawTreeData2.splice(5,0,sizeObj);
			}
		}
	/* End */

        var myTreeData = getTree(rawTreeData2, 'categoryId', 'productParentCategoryId');
		$scope.tree_data = myTreeData;
        $scope.my_tree = tree = {};
		
	 $scope.expanding_property = {
            field: "categoryName",
            displayName: "Category/Group Name",
            sortable: false,
            filterable: false,
            cellTemplate: "<i>{{row.branch[expandingProperty.field]}}</i>"
        };
		
        $scope.col_defs = [
			{
                field: "groupName",
				displayName: "Product Name"
            },
			{
                field: "price",
				displayName: "Price"
            },
			{
                field: "mrp",
				displayName: "MRP"
            },
			{
                field: "qty",
				displayName: "Quantity"
            }
        ];

        if ($scope.setting_color) {
        	var colorObj = {
				field: "color",
				displayName: "Color"
			};
			$scope.col_defs.splice(1,0,colorObj);
        }

        if ($scope.setting_size) {
	        var sizeObj = {
				field: "size",
				displayName: "Size"
			};

			if($scope.setting_color){
				$scope.col_defs.splice(2,0,sizeObj);
			}
			else{
				$scope.col_defs.splice(1,0,sizeObj);
			}
		}
	
	/*****  End   *****/
	
	
	var treeArrayData = [];
	// console.log("getData..",getData);
	apiCall.getCallHeader(apiPath.getProductByCompany+CompanyID,getData).then(function(responseAll){
	// productFactory.getProductByCompany(CompanyID).then(function (responseAll) {

		productFactory.getProductAPIObjects(responseAll).then(function(responseDrop)
		{
			if(apiResponse.notFound == responseDrop){
				
				toaster.pop('info', 'Message', 'No Data Found Go To Search');
				$scope.disableButton = false;
			
			}
			else{
				var cnt= responseDrop.length;
				var categoryArray = [];
				var csvArray = [];
				
				for(var i=0;i<cnt;i++){
					
					var objectData = {};
					var flag=0;
					var apiData = responseDrop[i];
					
					if($scope.saleType == "whole_sales"){

						var purchaseprice = $filter('setDecimal')(productArrayFactory.calculate(apiData.purchasePrice,0,apiData.wholesaleMargin) + parseFloat(apiData.wholesaleMarginFlat),noOfDecimalPoints);
						
						//var vat =0;
						// var vat =  $filter('setDecimal')(productArrayFactory.calculateTax(purchaseprice,apiData.vat,0),noOfDecimalPoints);
						
						// var additionalTax =  $filter('setDecimal')(productArrayFactory.calculateTax(purchaseprice,apiData.additionalTax,0),noOfDecimalPoints);
						
						// var finalAmount =  $filter('setDecimal')(productArrayFactory.calculate(purchaseprice,apiData.vat,0) + additionalTax,noOfDecimalPoints);
					}
						
					
					for(var arrayData=0;arrayData<categoryArray.length;arrayData++)
					{
						
						if(apiData.productCategory.productCategoryId == categoryArray[arrayData])
						{
							flag=1;
							
							objectData.categoryId = Math.random();
							objectData.productParentCategoryId = apiData.productCategory.productCategoryId;
							// objectData.categoryName =  apiData.productName+' ('+apiData.color+' | '+apiData.size+')';
							objectData.categoryName =  apiData.productGroup.productGroupName;
							
							// objectData.groupName = apiData.productGroup.productGroupName;
							objectData.groupName = apiData[$scope.alterLanguageKey] || apiData.productName;
							
							$scope.setting_color ? objectData.color = apiData.color : '';
							$scope.setting_size ? objectData.size = apiData.size : '';
							 
							objectData.price = purchaseprice;
							objectData.mrp = apiData.mrp;
							objectData.qty = apiData.quantity;
							// objectData.vat = vat;
							// objectData.additionalTax = additionalTax;
							// objectData.amount = 0;
							
							treeArrayData.push(objectData);
						
							break;
						}
					}
					if(flag==0)
					{
						categoryArray.push(apiData.productCategory.productCategoryId);
						
						var demo = {};
						demo.categoryId = apiData.productCategory.productCategoryId;
						demo.categoryName = apiData.productCategory.productCategoryName;
						demo.productParentCategoryId = apiData.productCategory.productParentCategoryId;
						treeArrayData.push(demo);
						
						objectData.categoryId = Math.random();
						objectData.productParentCategoryId = apiData.productCategory.productCategoryId;
						// objectData.categoryName = apiData.productName+' ('+apiData.color+' | '+apiData.size+')';
						objectData.categoryName = apiData.productGroup.productGroupName;
						
						// objectData.groupName = apiData.productGroup.productGroupName;
						objectData.groupName = apiData[$scope.alterLanguageKey] || apiData.productName;
						$scope.setting_color ? objectData.color = apiData.color : '';
						$scope.setting_size ? objectData.size = apiData.size : '';
						
						objectData.price = purchaseprice;
						objectData.mrp = apiData.mrp;
						objectData.qty = apiData.quantity;
						// objectData.vat = vat;
						// objectData.additionalTax = additionalTax;
						// objectData.amount = 0;
						
						treeArrayData.push(objectData);
					}
					
					/** CSV Data **/
					
					var csvObject = {};
					
					csvObject.categoryName = apiData.productCategory.productCategoryName;
					csvObject.groupName = apiData.productGroup.productGroupName;
					csvObject.productName = apiData[$scope.alterLanguageKey] || apiData.productName;
					$scope.setting_color ? csvObject.color = apiData.color : '';
					$scope.setting_size ? csvObject.size = apiData.size : '';
					
					csvObject.price = purchaseprice;
					csvObject.mrp = apiData.mrp;
					csvObject.qty = apiData.quantity;
					// csvObject.vat = vat;
					// csvObject.additionalTax = additionalTax;
					// csvObject.amount = 0;
					
					csvArray.push(csvObject);
					
					/** End **/
				
				}
				
				// console.log("categoryArray...",categoryArray);
				// console.log("treeArrayData...",treeArrayData);
				
				$scope.getArray = csvArray;
				
				var myTreeData2 = getTree(treeArrayData, 'categoryId', 'productParentCategoryId');
				// console.log("myTreeData2...",myTreeData2);
				$scope.tree_data = myTreeData2;
					
					
				//data = responseDrop;
				
				//$scope.TableData();
			}
		});
	});
	
	
 
	

  // SORTING
  // ----------------------------------- 

  // var data = [
      // {name: "Product1",  category: "Glass", group: "Cup"  },
	  // {name: "Product2",  category: "Glass", group: "Cup" },
	  // {name: "Product3",  category: "Glass", group: "Cup" },
	  // {name: "Product4",  category: "Glass", group: "Cup" },
	  // {name: "Product5",  category: "Glass", group: "Cup" },
	  // {name: "Product6",  category: "Glass", group: "Cup" },
	  // {name: "Product7",  category: "Glass", group: "Cup"},
	  // {name: "Product8",  category: "Glass", group: "Cup"},
	  // {name: "Product9",  category: "Glass", group: "Cup" },
	  // {name: "Product10",  category: "Glass", group: "Cup" },
	  // {name: "Product11",  category: "Glass", group: "Cup" },
	  // {name: "Product12",  category: "Glass", group: "Cup" }
      
  // ];
  
	$scope.TableData = function(){
	
		vm.tableParams = new ngTableParams({
			  page: 1,            // show first page
			  count: 10,          // count per page
			  sorting: {
				  productName: 'asc'     // initial sorting
			  }
		  },{
			  // counts: [],
			  total: data.length, // length of data
			  getData: function($defer, params) {
				 
				  if(!$.isEmptyObject(params.$params.filter) && ((typeof(params.$params.filter.productName) != "undefined" && params.$params.filter.productName != "")  || (typeof(params.$params.filter.retailPrice) != "undefined" && params.$params.filter.retailPrice != "") || (typeof(params.$params.filter.vat) != "undefined" && params.$params.filter.vat != "") || (typeof(params.$params.filter.finalAmount) != "undefined" && params.$params.filter.finalAmount != "") ))
				  {
						 var orderedData = params.filter() ?
						 $filter('filter')(data, params.filter()) :
						 data;

						  vm.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

						  params.total(orderedData.length); // set total for recalc pagination
						  $defer.resolve(vm.users);
				  

				  }
				  else{
					  
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
				
			}
		});

	}

  // FILTERS
  // ----------------------------------- 

  vm.tableParams2 = new ngTableParams({
      page: 1,            // show first page
      count: 10,          // count per page
      filter: {
          name: '',
          age: ''
          // name: 'M'       // initial filter
      }
  }, {
      total: data.length, // length of data
      getData: function($defer, params) {
          // use build-in angular filter
          var orderedData = params.filter() ?
                 $filter('filter')(data, params.filter()) :
                 data;

          vm.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

          params.total(orderedData.length); // set total for recalc pagination
          $defer.resolve(vm.users);
      }
  });

  // SELECT ROWS
  // ----------------------------------- 

  vm.data = data;

  vm.tableParams3 = new ngTableParams({
      page: 1,            // show first page
      count: 10          // count per page
  }, {
      total: data.length, // length of data
      getData: function ($defer, params) {
          // use build-in angular filter
          var filteredData = params.filter() ?
                  $filter('filter')(data, params.filter()) :
                  data;
          var orderedData = params.sorting() ?
                  $filter('orderBy')(filteredData, params.orderBy()) :
                  data;

          params.total(orderedData.length); // set total for recalc pagination
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }
  });

  vm.changeSelection = function(user) {
      // console.info(user);
  };

  // EXPORT CSV
  // -----------------------------------  

  var data4 = [{name: "Moroni", age: 50},
      {name: "Tiancum", age: 43},
      {name: "Jacob", age: 27},
      {name: "Nephi", age: 29},
      {name: "Enos", age: 34},
      {name: "Tiancum", age: 43},
      {name: "Jacob", age: 27},
      {name: "Nephi", age: 29},
      {name: "Enos", age: 34},
      {name: "Tiancum", age: 43},
      {name: "Jacob", age: 27},
      {name: "Nephi", age: 29},
      {name: "Enos", age: 34},
      {name: "Tiancum", age: 43},
      {name: "Jacob", age: 27},
      {name: "Nephi", age: 29},
      {name: "Enos", age: 34}];

  vm.tableParams4 = new ngTableParams({
      page: 1,            // show first page
      count: 10           // count per page
  }, {
      total: data4.length, // length of data4
      getData: function($defer, params) {
          $defer.resolve(data4.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }
  });
  
	$scope.generatePdf = function(operation){
	 
		toaster.clear();
		toaster.pop('wait', 'Please Wait', operation.toUpperCase()+' Loading...');
		
		getData.operation = operation;
		getData.salesType = $scope.saleType;
		
		apiCall.getCallHeader(apiPath.getProductByCompany+CompanyID+'/priceList',getData).then(function(responseDrop){
		
			//console.log(responseDrop);
			toaster.clear();
			
			if(angular.isObject(responseDrop) && responseDrop.hasOwnProperty('documentPath')){
				
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
	
	function getTree(data, primaryIdName, parentIdName) {
            if (!data || data.length == 0 || !primaryIdName || !parentIdName)
                return [];

            var tree = [],
                rootIds = [],
                item = data[0],
                primaryKey = item[primaryIdName],
                treeObjs = {},
                parentId,
                parent,
                len = data.length,
                i = 0;

            while (i < len) {
                item = data[i++];
                primaryKey = item[primaryIdName];
                treeObjs[primaryKey] = item;
                parentId = item[parentIdName];

                if (parentId) {
                    parent = treeObjs[parentId];

                    if (parent.children) {
                        parent.children.push(item);
                    } else {
                        parent.children = [item];
                    }
                } else {
                    rootIds.push(primaryKey);
                }
            }

            for (var i = 0; i < rootIds.length; i++) {
                tree.push(treeObjs[rootIds[i]]);
            }
            ;

            return tree;
        }
  

}
PriceListRetailSalesController.$inject = ["$rootScope","$scope", "$filter", "ngTableParams","getSetFactory","apiCall","apiPath","saleType","$window","productArrayFactory","toaster","apiResponse","fetchArrayService","productFactory"];