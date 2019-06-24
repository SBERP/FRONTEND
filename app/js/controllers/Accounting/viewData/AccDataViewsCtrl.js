
/**=========================================================
 * Module: BranchCtrl.js
 * Controller for ngTables
 =========================================================*/

 App.controller('AccViewDataController', AccViewDataController);

 function AccViewDataController($rootScope,$scope, $filter, $http, ngTableParams,apiCall,apiPath,flotOptions, colors,$timeout,getSetFactory,$state,headerType,$modal,$window,toaster,apiResponse,apiDateFormate, productFactory) {
 	'use strict';
 	var vm = this;
 	var data = [];
 	$scope.paidData = [];
 	$scope.unPaidData = [];
 	var formdata = new FormData();
 	$scope.billData = [];
 	$scope.purchaseBillData = [];

 	$scope.filteredItems;
 	var Modalopened = false;

	$scope.erpPath = $rootScope.erpPath; //Erp Path
	
	$scope.dateFormat =  $rootScope.dateFormats; //Date Format

	/** Display Company and date **/
	apiCall.getCall(apiPath.getAllCompany+'/'+$rootScope.accView.companyId).then(function(res)
	{
		$scope.displayCompany = res.companyName;
		toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Data Loading....',30000);
	});

	if ($rootScope.accView.branchId) 
	{
		apiCall.getCall(apiPath.getAllBranch+'/'+$rootScope.accView.branchId).then(function(res)
		{
			$scope.displayBranch = res.branchName;
		});
	}

		// $scope.displayCompany = $rootScope.accView.companyId;
		$scope.displayfromDate = $rootScope.accView.fromDate;
		$scope.displaytoDate = $rootScope.accView.toDate;
		/** End **/
  // An array of boolean to tell the directive which series we want to show
  $scope.areaSeries = [true, true];
  vm.chartAreaFlotChart  = flotOptions['area'];
  
  vm.chartPieFlotChart  = flotOptions['pie'];
  
  $scope.headerType = headerType;

	//alert(headerType);
	
	if($scope.headerType == 'sales'){
		
		var getJrnlPath = apiPath.getLedgerJrnl+$rootScope.accView.companyId;
		var headerData = {'Content-Type': undefined,'fromDate':$rootScope.accView.fromDate,'toDate':$rootScope.accView.toDate,'type':$rootScope.accView.salesType};
	}
	else if($scope.headerType == 'Wholesales'){
		
		var getJrnlPath = apiPath.getBill+$rootScope.accView.companyId;
		var headerData = {'Content-Type': undefined,'fromDate':$rootScope.accView.fromDate,'toDate':$rootScope.accView.toDate,'salestype':'whole_sales'};
		if ($rootScope.accView.branchId) {
			headerData.branchId = $rootScope.accView.branchId;
		}
	}
	else if($scope.headerType == 'Retailsales'){
		
		var getJrnlPath = apiPath.getBill+$rootScope.accView.companyId;
		var headerData = {'Content-Type': undefined,'fromDate':$rootScope.accView.fromDate,'toDate':$rootScope.accView.toDate,'salestype':'retail_sales'};
	}
	else if($scope.headerType == 'Sales Orders'){
		
		var getJrnlPath = apiPath.getBill+$rootScope.accView.companyId;
		var headerData = {'Content-Type': undefined,'fromDate':$rootScope.accView.fromDate,'toDate':$rootScope.accView.toDate,'salestype':'whole_sales','isSalesOrder': 'ok'};
	}
	else if($scope.headerType == 'Quotations'){
		
		var getJrnlPath = apiPath.postQuotationBill;
		var headerData = {'Content-Type': undefined,'fromDate':$rootScope.accView.fromDate,'toDate':$rootScope.accView.toDate,'companyId':$rootScope.accView.companyId};
	}
	else if($scope.headerType == 'purchase'){
		
		var getJrnlPath = apiPath.getLedgerJrnl+$rootScope.accView.companyId;
		var headerData = {'Content-Type': undefined,'fromDate':$rootScope.accView.fromDate,'toDate':$rootScope.accView.toDate,'type':'purchase'};
	}
	else if($scope.headerType == 'Tax-Purchase'){
		
		var getJrnlPath = apiPath.PurchaseBillByCompany+$rootScope.accView.companyId;
		var headerData = {'Content-Type': undefined,'fromDate':$rootScope.accView.fromDate,'toDate':$rootScope.accView.toDate};
	}
	else if($scope.headerType == 'payment'){
		
		var getJrnlPath = apiPath.getJrnlTrnByCompany+$rootScope.accView.companyId;
		var headerData = {'Content-Type': undefined,'journalType':'payment','fromDate':$rootScope.accView.fromDate,'toDate':$rootScope.accView.toDate};
	}
	else if($scope.headerType == 'receipt'){
		
		var getJrnlPath = apiPath.getJrnlTrnByCompany+$rootScope.accView.companyId;
		// var headerData = {'Content-Type': undefined,'fromDate':$rootScope.accView.fromDate,'toDate':$rootScope.accView.toDate,'type':'sales'};
		var headerData = {'Content-Type': undefined,'journalType':'receipt','fromDate':$rootScope.accView.fromDate,'toDate':$rootScope.accView.toDate};
	}
	else if($scope.headerType == 'specialJournal'){
		
		var getJrnlPath = apiPath.getJrnlByCompany+$rootScope.accView.companyId;
		var headerData = {'Content-Type': undefined,'journalType':'special_journal','fromDate':$rootScope.accView.fromDate,'toDate':$rootScope.accView.toDate};
	}

	// console.log($rootScope.accView.companyId);
	// console.log($rootScope.accView.fromDate);
	// console.log($rootScope.accView.toDate);
	var settingResponse = [];
	$scope.isLanguageHindi = false;

	$scope.getOptionSettingData = function() {
		apiCall.getCall(apiPath.settingOption).then(function(response) {
			settingResponse = response;
			var responseLength = settingResponse.length;
			for(var arrayData=0;arrayData<responseLength;arrayData++)
			{
				if(angular.isObject(response) || angular.isArray(response))
				{
					if(response[arrayData].settingType=="language")
					{
						var arrayData1 = response[arrayData];
						$scope.isLanguageHindi = arrayData1.languageSettingType=="hindi" ? true : false;
					}
				}
			}
		});
	}

	function getTotalValue (fData)
	{
		$scope.totalAmountDisplay = $filter('setDecimal')(fData.reduce((a, b) => a + parseFloat(b['total']), 0),2);
		$scope.totalAdvanceDisplay = $filter('setDecimal')(fData.reduce((a, b) => a + parseFloat(b['advance']), 0),2);
		$scope.totalBalanceDisplay = $filter('setDecimal')(fData.reduce((a, b) => a + parseFloat(b['balance']), 0),2);
	}

	$scope.currentActiveSalestab = 0;  // Currently Open Tab is "All" Tab
	$scope.firstTabActive = true;
	$scope.secondTabActive = false;
	$scope.thirdTabActive = false;

	$scope.onSalesBillTabSelect = function(index)
	{
		$scope.totalAmountDisplay = 0;
		$scope.totalAdvanceDisplay = 0;
		$scope.totalBalanceDisplay = 0;
		/* Uncheck all Checkbox */
		$scope.clientFlag=0;
		$scope.selectedBoxArray = [];
		var cnt  = data.length;
		for(var k=0;k<cnt;k++) {
			data[k].selected = false;
		}
		/* End  */
	  		// data = [];
	  		vm.tableParams.total(data.length);
	  		vm.tableParams.reload();
	  		vm.tableParams.page(1);

	  		switch(index)
	  		{
	  			case 0:
	  			$scope.currentActiveSalestab = 0;
	  			$scope.firstTabActive = true;
	  			$scope.secondTabActive = false;
	  			$scope.thirdTabActive = false;
	  			if (angular.isArray($scope.allSalesData)) {
	  				if ($scope.allSalesData.length > 0) {
	  					data = angular.copy($scope.allSalesData);
	  					getTotalValue(data);
	  				} else {
	  					data = [];
	  				}
	  			} else {
	  				data = [];
	  			}
	  			break;

	  			case 1:
	  			$scope.currentActiveSalestab = 1;
	  			$scope.secondTabActive = true;
	  			$scope.firstTabActive = false;
	  			$scope.thirdTabActive = false;
	  			if (angular.isArray($scope.paidData)) {
	  				if ($scope.paidData.length > 0) {
	  					data = angular.copy($scope.paidData);
	  					getTotalValue(data);
	  				} else {
	  					data = [];
	  				}
	  			} else {
	  				data = [];
	  			}

	  			break;

	  			case 2:
	  			$scope.currentActiveSalestab = 2;
	  			$scope.thirdTabActive = true;
	  			$scope.firstTabActive = false;
	  			$scope.secondTabActive = false;
	  			if (angular.isArray($scope.unPaidData)) {
	  				if ($scope.unPaidData.length > 0) {
	  					data = angular.copy($scope.unPaidData);
	  					getTotalValue(data);
	  				} else {
	  					data = [];
	  				}
	  			} else {
	  				data = [];
	  			}
	  			break;

	  			default:
	  			$scope.currentActiveSalestab = 0;
	  			$scope.firstTabActive = true;
	  			$scope.secondTabActive = false;
	  			$scope.thirdTabActive = false;
	  			data = angular.copy(data);
	  			getTotalValue(data);
	  		}

	  		vm.tableParams.total(data.length);
	  		vm.tableParams.reload();
	  		vm.tableParams.page(1);
	  	}

	  	$scope.loadInit = function(onDateChange = null) 
	  	{
	  		toaster.clear();
	  		toaster.pop('wait', 'Please Wait', 'Data Loading....',30000);

			$scope.getOptionSettingData(); //Load Setting Data

			if (onDateChange != null)
			{
				$rootScope.accView.fromDate = moment(vm.dt1).format(apiDateFormate);
				$rootScope.accView.toDate = moment(vm.dt2).format(apiDateFormate);

				headerData = {'Content-Type': undefined,'fromDate':$rootScope.accView.fromDate,'toDate':$rootScope.accView.toDate,'salestype':'whole_sales'};
				if ($rootScope.accView.branchId) {
					headerData.branchId = $rootScope.accView.branchId;
				}
			}

			apiCall.getCallHeader(getJrnlPath,headerData).then(function(response){
				$scope.reLoadPdfData(response);
			}).catch(function (reason) {
				 // err
				 if (reason.status === 500) {
					// do something
					alert('Encountered server error');
				}
			});

		}
		
		$scope.loadInit();


		$scope.displayProduct = function(productArray)
		{
			var productArrayJS = JSON.parse(productArray);
			var productArray = productArrayJS.inventory;
			var phtml = "";

			var cnt = productArray.length;
			var i = 0;
		// phtml += `<ul>`;
		while(i < cnt){
			// console.log(productArray[i].productName);
			//phtml = phtml + ` <li> `+productArray[i].productName+` </li> `;
		}

		// phtml += `</ul>`;
		return phtml;
	}
	
	$scope.TableData = function(){


		vm.tableParams = new ngTableParams({
		  page: 1,            // show first page
		  count: 10,          // count per page
		  sorting: {
			  ledgerName: 'asc'     // initial sorting
			}
		}, {
		  // counts: [],
		  total: data.length, // length of data
		  getData: function($defer, params) {

		  	/** NgTable **/
			  // if(!$.isEmptyObject(params.$params.filter) && ((typeof(params.$params.filter.ledgerName) != "undefined" && params.$params.filter.ledgerName != "")  || (typeof(params.$params.filter.entryDate) != "undefined" && params.$params.filter.entryDate != "") || (typeof(params.$params.filter.amount) != "undefined" && params.$params.filter.amount != "")|| (typeof(params.$params.filter.amountTypeCredit) != "undefined" && params.$params.filter.amountTypeCredit != "")|| (typeof(params.$params.filter.amountTypeDebit) != "undefined" && params.$params.filter.amountTypeDebit != "")))
			  // {
					 // var orderedData = params.filter() ?
					 // $filter('filter')(data, params.filter()) :
					 // data;

					  // vm.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

					  // params.total(orderedData.length); // set total for recalc pagination
					  // $defer.resolve(vm.users);


			  // }
			  // else{

				   // params.total(data.length);

			  // }

			 // if(!$.isEmptyObject(params.$params.sorting))
			  // {

				  // var orderedData = params.sorting() ?
						  // $filter('orderBy')(data, params.orderBy()) :
						  // data;

				  // $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
			  // }
			  
			// $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
			/** ngTable **/
			params.total(data.length);
			var orderedData;

			if(params.sorting().date === 'asc'){

				data.sort(function (a, b) {

					var entDate = a.entryDate.split("-").reverse().join("-");
					var toDate = b.entryDate.split("-").reverse().join("-");
					var dateA=new Date(entDate), dateB=new Date(toDate);

				//var dateA = new Date(a.date), dateB = new Date(b.date);
				return dateA - dateB; //sort by date descending
			});
				orderedData = data;

			} else if(params.sorting().date === 'desc') {

				data.sort(function (a, b) {
					var entDate = a.entryDate.split("-").reverse().join("-");
					var toDate = b.entryDate.split("-").reverse().join("-");
					var dateA=new Date(entDate), dateB=new Date(toDate);

				//var dateA = new Date(a.date), dateB = new Date(b.date);
				return dateB - dateA; //sort by date descending
			});
				orderedData = data;

			} else if(!params.sorting().date){

			  // if (params.filter().term) {
			  	orderedData = params.filter() ? $filter('filter')(data, params.filter()) : data;
			  // } else {
			  	orderedData = params.sorting() ? $filter('orderBy')(orderedData, params.orderBy()) : orderedData;
			  // }
			  
			}
			orderedData = params.filter() ? $filter('filter')(orderedData, params.filter()) : orderedData;
			getTotalValue(orderedData);
			$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
			
			$scope.totalData = data.length;
			$scope.pageNumber = params.page();
			$scope.itemsPerPage = params.count();
			$scope.totalPages = Math.ceil($scope.totalData/params.count());
			
		}
	});

	}

	$scope.columnHideShow = [
	{
		displayName : "Branch",
		itemKey: "branchCheckbox",
		branchCheckbox: true
	},
	{
		displayName : "Products",
		itemKey: "productCheckbox",
		productCheckbox: true
	}];

	$scope.saleTableData = function()
	{
		vm.tableParams = new ngTableParams({
		  page: 1,            // show first page
		  count: 10,          // count per page
		  sorting: {
		  	date : 'asc'
		  }
		}, {
		  //counts: [],
		  dataset: data,
		  total: data.length, // length of data
		  getData: function($defer, params) {
		  	params.total(data.length);

		  	if(!$scope.displayBranch)
		  	{
		  		params.branchNameFlag = $scope.columnHideShow[0].branchCheckbox;
		  	}
		  	else{
		  		params.branchNameFlag = false;
		  	}

		  	params.productsFlag = $scope.columnHideShow[1].productCheckbox;
		  	if ($scope.headerType == 'Sales Orders' || $scope.headerType == 'Quotations') {
		  		params.refundFlag = false;
		  	}

		  	var orderedData;

		  	if(params.sorting().date === 'asc'){

		  		data.sort(function (a, b) {

		  			var entDate = a.entryDate.split("-").reverse().join("-");
		  			var toDate = b.entryDate.split("-").reverse().join("-");
		  			var dateA=new Date(entDate), dateB=new Date(toDate);

				return dateA - dateB; //sort by date descending
			});
		  		orderedData = data;

		  	} else if(params.sorting().date === 'desc') {

		  		data.sort(function (a, b) {

		  			var entDate = a.entryDate.split("-").reverse().join("-");
		  			var toDate = b.entryDate.split("-").reverse().join("-");
		  			var dateA=new Date(entDate), dateB=new Date(toDate);
				return dateB - dateA; //sort by date descending
			});
		  		orderedData = data;

		  	}
		  	else if(!params.sorting().date){

			  // if (params.filter()) {
			  	orderedData = params.filter() ? $filter('filter')(data, params.filter()) : data;
			  // } else {
			  	orderedData = params.sorting() ? $filter('orderBy')(orderedData, params.orderBy()) : orderedData;
			  // }
			  
			}
			orderedData = params.filter() ? $filter('filter')(orderedData, params.filter()) : orderedData;
			getTotalValue(orderedData);
			$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
			
			/** New Sort Code **/
					// var filteredData = params.filter() ?
	    //          	$filter('filter')(data, params.filter()) :
	    //           	data;

	    //           	// console.log('fill',filteredData);
				 //  	var orderedData = params.sorting() ?
					// 	$filter('orderBy')(filteredData, params.orderBy()) :
					// 	data;

				 //  	params.total(orderedData.length); // set total for recalc pagination
				 //  	$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				 /** End **/

				 $scope.filteredItems = orderedData;	
				 $scope.totalData = data.length;
				 $scope.pageNumber = params.page();
				 $scope.itemsPerPage = params.count();
				 $scope.totalPages = Math.ceil($scope.totalData/params.count());
				}
			});

		vm.tableParams2 = new ngTableParams({
		  page: 1,            // show first page
		  count: 10,          // count per page
		  sorting: {   // initial sorting
		  }
		}, {
		  //counts: [],
		  total: $scope.paidData.length, // length of data
		  getData: function($defer, params) {

		  	if(!$scope.displayBranch){
		  		params.branchNameFlag = true;
		  	}
		  	else{
		  		params.branchNameFlag = false;
		  	}

			//   var orderedData;

			// if(params.sorting().date === 'asc'){

			//   $scope.paidData.sort(function (a, b) {

			//  var entDate = a.entryDate.split("-").reverse().join("-");
			// 			var toDate = b.entryDate.split("-").reverse().join("-");
			// 			var dateA=new Date(entDate), dateB=new Date(toDate);

			// 	return dateA - dateB; //sort by date descending
			//   });
			//   orderedData = $scope.paidData;

			// } else if(params.sorting().date === 'desc') {

			//   $scope.paidData.sort(function (a, b) {

			// 	 var entDate = a.entryDate.split("-").reverse().join("-");
			// 			var toDate = b.entryDate.split("-").reverse().join("-");
			// 			var dateA=new Date(entDate), dateB=new Date(toDate);
			// 	return dateB - dateA; //sort by date descending
			//   });
			//   orderedData = $scope.paidData;

			// }
			// else if(!params.sorting().date){

			//   if (params.filter().term) {
			// 	orderedData = params.filter() ? $filter('filter')($scope.paidData, params.filter().term) : $scope.paidData;
			//   } else {
			// 	orderedData = params.sorting() ? $filter('orderBy')($scope.paidData, params.orderBy()) : $scope.paidData;
			//   }

			// }

			/** New Sort Code **/
			var filteredData = params.filter() ?
			$filter('filter')(data, params.filter()) :
			data;

	              	// console.log('fill',filteredData);
	              	var orderedData = params.sorting() ?
	              	$filter('orderBy')(filteredData, params.orderBy()) :
	              	data;
	              	getTotalValue(orderedData);
				  	params.total(orderedData.length); // set total for recalc pagination
				  	$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				  	/** End **/


				  	$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));

				  	$scope.totalData2 = $scope.paidData.length;
				  	$scope.pageNumber2 = params.page();
				  	$scope.itemsPerPage2 = params.count();
				  	$scope.totalPages2 = Math.ceil($scope.totalData2/params.count());
				  }
				});


		vm.tableParams3 = new ngTableParams({
		  page: 1,            // show first page
		  count: 10,          // count per page
		  sorting: {    // initial sorting
		  }
		}, {
		  //counts: [],
		  total: $scope.unPaidData.length, // length of data
		  getData: function($defer, params) {

		  	if(!$scope.displayBranch){
		  		params.branchNameFlag = true;
		  	}
		  	else{
		  		params.branchNameFlag = false;
		  	}

			//   var orderedData;

			// if(params.sorting().date === 'asc'){

			//   $scope.unPaidData.sort(function (a, b) {

			//  var entDate = a.entryDate.split("-").reverse().join("-");
			// 			var toDate = b.entryDate.split("-").reverse().join("-");
			// 			var dateA=new Date(entDate), dateB=new Date(toDate);

			// 	return dateA - dateB; //sort by date descending
			//   });
			//   orderedData = $scope.unPaidData;

			// } else if(params.sorting().date === 'desc') {

			//   $scope.unPaidData.sort(function (a, b) {

			// 	 var entDate = a.entryDate.split("-").reverse().join("-");
			// 			var toDate = b.entryDate.split("-").reverse().join("-");
			// 			var dateA=new Date(entDate), dateB=new Date(toDate);
			// 	return dateB - dateA; //sort by date descending
			//   });
			//   orderedData = $scope.unPaidData;

			// }
			// else if(!params.sorting().date){

			//   if (params.filter().term) {
			// 	orderedData = params.filter() ? $filter('filter')($scope.unPaidData, params.filter().term) : $scope.unPaidData;
			//   } else {
			// 	orderedData = params.sorting() ? $filter('orderBy')($scope.unPaidData, params.orderBy()) : $scope.unPaidData;
			//   }

			// }

			/** New Sort Code **/
			var filteredData = params.filter() ?
			$filter('filter')(data, params.filter()) :
			data;
			getTotalValue(filteredData);
	              	// console.log('fill',filteredData);
	              	var orderedData = params.sorting() ?
	              	$filter('orderBy')(filteredData, params.orderBy()) :
	              	data;

				  	params.total(orderedData.length); // set total for recalc pagination
				  	$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				  	/** End **/


				  	$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));

				  	$scope.totalData3 = $scope.unPaidData.length;
				  	$scope.pageNumber3 = params.page();
				  	$scope.itemsPerPage3 = params.count();
				  	$scope.totalPages3 = Math.ceil($scope.totalData3/params.count());
				  }
				});
	}


	$scope.editDataView= function(id)
	{
		getSetFactory.set(id);

		if($scope.headerType == 'sales'){
			
			$state.go("app.AccSales");
			
		}
		if($scope.headerType == 'Sales Orders'){
			$state.go("app.AccSalesOrder");
		}
		if($scope.headerType == 'Quotations'){
			$state.go("app.QuotationPrint");
		}
		else if($scope.headerType == 'purchase'){
			
			$state.go("app.AccPurchase");
		}
		else if($scope.headerType == 'payment'){
			
			$state.go("app.AccPayment");
		}
		else if($scope.headerType == 'receipt'){
			
			$state.go("app.AccReceipt");
		}
		else if($scope.headerType == 'specialJournal'){
			
			$state.go("app.AccSpecialJrnl");
		}

	}
	
	/** Edit Bill **/
	
	if($scope.headerType == 'Wholesales' || $scope.headerType == 'Retailsales' || $scope.headerType == 'Tax-Purchase' || $scope.headerType == 'Sales Orders' || $scope.headerType == 'Quotations'){
		
		$scope.editDataViewSales = function(id){
			
			//alert(id);
			
			// $scope.singleBillData = $scope.returnSingleData(id);
			
			// console.log($scope.singleBillData);
			if($scope.headerType == 'Tax-Purchase'){
				getSetFactory.set($scope.returnSinglePurchaseData(id));
			}
			else{
				getSetFactory.set($scope.returnSingleData(id));
			}
			
			//console.log(getSetFactory.get());
			
			if($scope.headerType == 'Retailsales'){
				$state.go("app.RetailsaleBill");
			}
			else if($scope.headerType == 'Wholesales'){
				$state.go("app.WholesaleBill");
			}
			else if($scope.headerType == 'Tax-Purchase'){
				$state.go("app.PurchaseBill");
			}
			else if($scope.headerType == 'Sales Orders'){
				$state.go("app.AccSalesOrder");
			}
			else if($scope.headerType == 'Quotations'){
				$state.go("app.QuotationPrint");
			}
			
			//getSetFactory.blank();
			
		}
	}
	/** End Edit Bill **/
	
	$scope.deleteDataView = function(id)
	{

	// var deletePath = apiPath.getAllBranch+'/'+parseInt(branch_id);

	// apiCall.deleteCall(deletePath).then(function(deleteres){
		
		// console.log(deleteres);

	// });
}

$scope.deleteBill = function(size,id,isPurchaseBill = 'no')
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

		// return false;
		/**Delete Code **/
		if (isPurchaseBill == 'yes'){
			var deletePath = apiPath.postPurchaseBill+'/'+id;
		}else if (isPurchaseBill == 'quote') {
			var deletePath = apiPath.postQuotationBill+'/'+id+'/quote';
		}
		else{
			var deletePath = apiPath.postBill+'/'+id;
		}

		apiCall.deleteCall(deletePath).then(function(deleteres){

				//console.log(deleteres);
				if(apiResponse.ok == deleteres){
					
					$scope.loadInit();

					toaster.pop('success', 'Title', 'Data Successfully Deleted');
				}
				else{
					toaster.pop('warning', '', deleteres);
				}

			});
		/** End **/

		Modalopened = false;
		
	}, function () {

		console.log('Cancel');	
		Modalopened = false;

	});


}


$scope.returnSingleData = function(saleId)
{
	var tempObject = {};

	for(var i=0;i<$scope.billData.length;i++)
	{
		var billdata = $scope.billData[i];
		if(billdata.saleId == saleId){
			tempObject = billdata;
		}
	}
	return tempObject;
}

$scope.returnSinglePurchaseData = function(purchaseId)
{
	var tempObject = {};

	for(var i=0;i<$scope.purchaseBillData.length;i++)
	{
		var billdata = $scope.purchaseBillData[i];
		if(billdata.purchaseId == purchaseId){
			tempObject = billdata;
		}
	}
	return tempObject;
}

	//Date Convert
	
	$scope.dateConvert = function(entryDate){
		
		var entDate = entryDate.split("-").reverse().join("-");
		
		return entDate; 
	}
	
	/** Reload Load Data **/
	$scope.reLoadPdfData = function(response)
	{
		toaster.clear();

		$scope.allSalesData = [];
		$scope.paidData = [];
		$scope.unPaidData = [];
		$scope.totalAmountDisplay = 0;
		$scope.totalAdvanceDisplay = 0;
		$scope.totalBalanceDisplay = 0;

		if(apiResponse.notFound == response)
		{
			if(vm.tableParams) {
				$scope.onSalesBillTabSelect($scope.currentActiveSalestab);
			} else {
				$scope.saleTableData();
			}
				//data = [];
				toaster.pop('alert', 'Opps!!', 'No Data Found');
			}
			else{

				data = response;
				// console.log('refresh');
				if($scope.headerType == 'Wholesales' || $scope.headerType == 'Retailsales' || $scope.headerType == 'Tax-Purchase' || $scope.headerType == 'Sales Orders' || $scope.headerType == 'Quotations') {
					
					if ($scope.headerType == 'Tax-Purchase') {
						$scope.purchaseBillData = response;
					} else {
						$scope.billData = response;
					}
					var cnt = data.length;
					if (cnt > 0) {
						(function billAmountFix(p)
						{
							$scope.totalAmountDisplay = $filter('setDecimal')( parseFloat($scope.totalAmountDisplay) + parseFloat(data[p].total),2);
							$scope.totalAdvanceDisplay = $filter('setDecimal')( parseFloat($scope.totalAdvanceDisplay) + parseFloat(data[p].balance),2);
							$scope.totalBalanceDisplay = $filter('setDecimal')( parseFloat($scope.totalBalanceDisplay) + parseFloat(data[p].advance),2);
							if ($scope.headerType == 'Wholesales' || $scope.headerType == 'Sales Orders' || $scope.headerType == 'Quotations') {
								if (!$rootScope.accView.branchId)  {
									if (angular.isObject(data[p].branch)) {
										data[p].branchName = data[p].branch.branchName;
									}
									else{
										data[p].branchName = '-';
									}
								}
							}
							data[p].repeatIcon = false;
							data[p].imageIcon = false;
							data[p].pdfIcon = false;
							data[p].singlePdfIcon = false;
							data[p].displayProduct = [];
							var productArrays = JSON.parse(data[p].productArray);
								var invCnt = productArrays.inventory.length;
								(function displayProductList(invIndex,billIndex){
									if(productArrays.inventory[invIndex] != undefined && productArrays.inventory[invIndex] != null && "productId" in productArrays.inventory[invIndex] && productArrays.inventory[invIndex].productId)
									{
										productFactory.getSingleProduct(productArrays.inventory[invIndex].productId).then(function(proResponse) {
											if(angular.isObject(proResponse)) 
											{
												if ("displayProduct" in data[billIndex]) 
												{
													if (angular.isArray(data[billIndex].displayProduct)) 
													{
														data[billIndex].displayProduct.push(angular.copy(proResponse));
													} 
													else 
													{
														data[billIndex].displayProduct = [];
													}
												} 
												else 
												{
													data[billIndex].displayProduct = [];
												}
												if (invIndex == invCnt - 1) 
												{
													pushedIntoArray(billIndex);
													billIndex++;
													if (billIndex < cnt) {
														billAmountFix(billIndex);
													}else{
														loadSorting();
													}

												}
												invIndex++;
												if (invIndex < invCnt) {
													displayProductList(invIndex,billIndex);
												}
											}
											else
											{
												productArrays.inventory[invIndex].productName = '<em class="text-danger">(deleted)</em>';
												productArrays.inventory[invIndex].altProductName = '<em class="text-danger">(deleted)</em>';
												data[billIndex].displayProduct.push(productArrays.inventory[invIndex]);
												if (invIndex == invCnt - 1) 
												{
													pushedIntoArray(billIndex);
													billIndex++;
													if (billIndex < cnt) {
														billAmountFix(billIndex);
													}else{
														loadSorting();
													}

												}
												invIndex++;
												if (invIndex < invCnt) {
													displayProductList(invIndex,billIndex);
												}
											}
										});
									}
									else
									{
										if (invIndex == invCnt - 1) 
										{
											pushedIntoArray(billIndex);
											billIndex++;
											if (billIndex < cnt) {
												billAmountFix(billIndex);
											}else{
												loadSorting();
											}
										}
									}

								})(0,p);

						})(0);
					}
				}
				else{

					vm.pieChartData = [{ "color" : "#6cc539",
					"data" : "0",
					"label" : "Debit"
				},
				{ "color" : "#00b4ff",
				"data" : "0",
				"label" : "Credit"
			}];
			vm.pieFlotCharts = [{
				"label": "Debit",
				"color": "#6cc539",
				"data": [
				["Jan", "0"],
				["Feb", "0"],
				["Mar", "0"],
				["Apr", "0"],
				["May", "0"],
				["Jun", "0"],
				["Jul", "0"],
				["Aug", "0"],
				["Sep", "0"],
				["Oct", "0"],
				["Nov", "0"],
				["Dec", "0"]
				]
			},{
				"label": "Credit",
				"color": "#00b4ff",
				"data": [
				["Jan", "0"],
				["Feb", "0"],
				["Mar", "0"],
				["Apr", "0"],
				["May", "0"],
				["Jun", "0"],
				["Jul", "0"],
				["Aug", "0"],
				["Sep", "0"],
				["Oct", "0"],
				["Nov", "0"],
				["Dec", "0"]
				]
			}];
			if ($scope.headerType == 'payment' || $scope.headerType == 'receipt') {
				var dataCnt = data.length;
				var i = 0;
				(function paymentReceiptLoop(i) {
		  					// for (var j = 0; j < data[i].creditArray.length; j++) {
		  						vm.pieChartData[0]["data"] = parseInt(vm.pieChartData[0]["data"]) + parseFloat(data[i].creditAmount);
		  						var date = data[i].entryDate;
		  						var splitedate = date.split("-").reverse().join("-");
		  						var getdate = new Date(splitedate);
		  						var month = getdate.getMonth();
		  						vm.pieFlotCharts[0]["data"][month][1] = parseInt(vm.pieFlotCharts[0]["data"][month][1]) + parseFloat(data[i].creditAmount);
		  					// }
		  					// for (var k = 0; k < data[i].debitArray.length; k++) {
		  						vm.pieChartData[1]["data"] = parseInt(vm.pieChartData[1]["data"]) + parseFloat(data[i].debitAmount);

		  						var date2 = data[i].entryDate;
		  						var splitedate2 = date2.split("-").reverse().join("-");
		  						var getdate2 = new Date(splitedate2);
		  						var month2 = getdate2.getMonth();
		  						vm.pieFlotCharts[1]["data"][month2][1] = parseInt(vm.pieFlotCharts[1]["data"][month2][1]) + parseFloat(data[i].debitAmount);
		  					// }
		  					i++;
		  					if (i < dataCnt) {
		  						paymentReceiptLoop(i);
		  					}
		  				})(0);
		  			}
		  			else{
		  				for (var i = 0; i < data.length; i++) {

		  					if(data[i].amountType=='debit'){

		  						vm.pieChartData[0]["data"] = parseInt(vm.pieChartData[0]["data"]) + parseFloat(data[i].amount);
		  						var date = data[i].entryDate;
		  						var splitedate = date.split("-").reverse().join("-");
		  						var getdate = new Date(splitedate);
		  						var month = getdate.getMonth();

		  						vm.pieFlotCharts[0]["data"][month][1] = parseInt(vm.pieFlotCharts[0]["data"][month][1]) + parseFloat(data[i].amount);

								//console.log(vm.pieFlotCharts[0]["data"][0][1] = parseInt(vm.pieFlotCharts[0]["data"][0][1]) + parseInt(data[i].amount));

							}
							else{
								vm.pieChartData[1]["data"] = parseInt(vm.pieChartData[1]["data"]) + parseFloat(data[i].amount);
								
								var date = data[i].entryDate;
								var splitedate = date.split("-").reverse().join("-");
								var getdate = new Date(splitedate);
								var month = getdate.getMonth();
								
								vm.pieFlotCharts[1]["data"][month][1] = parseInt(vm.pieFlotCharts[1]["data"][month][1]) + parseFloat(data[i].amount);

								//vm.pieFlotCharts[1]["data"] = parseInt(vm.pieFlotCharts[1]["data"]) + parseInt(data[i].amount);
							}
						}
					}
					
					//console.log(vm.pieFlotCharts);
					
					$scope.contents = data;
					
					
					$scope.contents.sort(function(a, b){
						var entDate = a.entryDate.split("-").reverse().join("-");
						var toDate = b.entryDate.split("-").reverse().join("-");
						var dateA=new Date(entDate), dateB=new Date(toDate);
						return dateB-dateA; 
					});
					
					data= $scope.contents;
					
					$scope.TableData();
					// for (var i = 0; i < data.length; i++) {
					  // data[i].cityName = ""; //initialization of new property 
					  // data[i].cityName = data[i].city.cityName;  //set the data from nested obj into new property
					// }
				}

			}
		}
		/** End Reaload Pdf Data **/

		function pushedIntoArray (p) {
			var fileCnt = data[p].file.length;

			var flag = 0;
			var imageFlag = 0;

			for(var k=0;k<fileCnt;k++) {

				if(data[p].file[k].documentFormat == 'pdf' && (data[p].file[k].documentType == 'bill' ||data[p].file[k].documentType == 'quotation'))
				{
					flag++;
				}

				if(data[p].file[k].documentFormat == 'jpg' || data[p].file[k].documentFormat == 'jpeg' || data[p].file[k].documentFormat == 'png'){

					imageFlag = 1;
				}
			}

			if(flag == 0){
				data[p].repeatIcon = true;
			}
			else if(flag == 1){
				data[p].singlePdfIcon = true;
			}
			else{
				data[p].pdfIcon = true;
			}

			if(imageFlag == 1){
				data[p].imageIcon = true;
			}

			if ($scope.headerType != 'Tax-Purchase'){
				data[p].invoiceNumber = data[p].invoiceNumber;
				data[p].clientName = data[p].client.clientName;
			}
			else{
				data[p].ledgerName = data[p].vendor.ledgerName;
			}

			if(data[p].balance >= 1)
			{
				$scope.unPaidData.push(data[p]);
			}
			else{
				$scope.paidData.push(data[p]);
			}
		}

		function loadSorting () 
		{
			$scope.contents1 = data;

			if ($scope.headerType != 'Tax-Purchase') {

				$scope.contents1.sort(function(a, b) {
				// var entDate = a.entryDate.split("-").reverse().join("-");
				// var toDate = b.entryDate.split("-").reverse().join("-");
				// var dateA=new Date(entDate), dateB=new Date(toDate);
				var parseA = parseInt(a.invoiceNumber);
				var parseB = parseInt(b.invoiceNumber);
				return parseA - parseB;
			});

				data= $scope.contents1;
				$scope.allSalesData = $scope.contents1;

				$scope.contents2 = $scope.unPaidData;

				$scope.contents2.sort(function(a, b) {
				// var entDate = a.entryDate.split("-").reverse().join("-");
				// var toDate = b.entryDate.split("-").reverse().join("-");
				// var dateA=new Date(entDate), dateB=new Date(toDate);
				var parseA = parseInt(a.invoiceNumber);
				var parseB = parseInt(b.invoiceNumber);
				return parseA - parseB; 
			});

				$scope.unPaidData = $scope.contents2;

				$scope.contents3 = $scope.paidData;

				$scope.contents3.sort(function(a, b) {
				// var entDate = a.entryDate.split("-").reverse().join("-");
				// var toDate = b.entryDate.split("-").reverse().join("-");
				// var dateA=new Date(entDate), dateB=new Date(toDate);
				var parseA = parseInt(a.invoiceNumber);
				var parseB = parseInt(b.invoiceNumber);
				return parseA - parseB; 
			});

				$scope.paidData= $scope.contents3;
			}
			else if($scope.headerType == 'Tax-Purchase')
			{
				$scope.contents1.sort(function(a, b){
					var parseA = parseInt(a.billNumber);
					var parseB = parseInt(b.billNumber);
					return parseA - parseB; 
				});

				data= $scope.contents1;
				$scope.allSalesData = angular.copy($scope.contents1);

				$scope.contents2 = $scope.unPaidData;

				$scope.contents2.sort(function(a, b){
					var parseA = parseInt(a.billNumber);
					var parseB = parseInt(b.billNumber);
					return parseA - parseB; 
				});

				$scope.unPaidData = $scope.contents2;

				$scope.contents3 = $scope.paidData;

				$scope.contents3.sort(function(a, b){
					var parseA = parseInt(a.billNumber);
					var parseB = parseInt(b.billNumber);
					return parseA - parseB; 
				});

				$scope.paidData= $scope.contents3;
			}

			if(vm.tableParams)
			{
				var activeTab = $scope.currentActiveSalestab;
			// if (activeTab == 0){
			// 	$scope.onSalesBillTabSelect(activeTab+1);
			// } else if (activeTab == 1) {
			// 	$scope.onSalesBillTabSelect(activeTab+1);
			// } else if (activeTab == 2) {
			// 	$scope.onSalesBillTabSelect(activeTab-1);
			// }

			setTimeout(function() {
				$scope.onSalesBillTabSelect(activeTab);
			}, 1000);
			
		}
		else{
			$scope.saleTableData();
		}
	}
	/** Regenerate Pdf **/

	$scope.reGeneratePdf = function(sId){

			//alert(sId);
			var reFormData = new FormData();
			reFormData.append('saleId',sId);
			
			apiCall.postCall(apiPath.reGeneratePdf,reFormData).then(function(response){

				//console.log(response);
				
				if(angular.isObject(response)){
					
					toaster.pop('success', 'Title', 'Generate Pdf Successfully');
					
					var pdfPath = $scope.erpPath+response.documentPath;
					$window.open(pdfPath, '_blank');
					
					$scope.loadInit();
				}
				else{
					
					alert(response);
				}
				
			});
			
		}
		
		/** End Regenerate Pdf **/

	/**
	Image Gallery  Modal 
	**/
	
	$scope.openImageGallery = function (size,saleId,isPurchaseBill = 'no') {

		if (Modalopened) return;
		
		if(isPurchaseBill == 'yes'){
			$scope.singleBillData = $scope.returnSinglePurchaseData(saleId);
		}
		else{
			$scope.singleBillData = $scope.returnSingleData(saleId);
		}
		// console.log('ddaaattaaa',$scope.singleBillData);
		var modalInstance = $modal.open({
			templateUrl: 'app/views/PopupModal/Accounting/imageGalleryModal/imageGalleryModalContent.html',
			controller: imageGalleryModalCtrl,
			size: size,
			resolve:{
				billData: function(){

					return $scope.singleBillData;
				},
				formatType: function(){

					return 'image';
				},
				transType: function(){

					return 'none';
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
	End Image Gallery  Modal 
	**/
	
	/**
	Pdf  Modal 
	**/
	
	$scope.openPdf = function (size,saleId) {

		if (Modalopened) return;
		
		$scope.singleBillData = $scope.returnSingleData(saleId);
		
		var modalInstance = $modal.open({
			templateUrl: 'app/views/PopupModal/Accounting/imageGalleryModal/imageGalleryModalContent.html',
			controller: imageGalleryModalCtrl,
			size: size,
			resolve:{
				billData: function(){

					return $scope.singleBillData;
				},
				formatType: function(){

					return 'pdf';
				},
				transType: function(){

					return 'none';
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
	End Pdf  Modal 
	**/
	
	
	/**
	Payment  Modal 
	**/
	
	$scope.openPayment = function (size,saleId,transaction) {

		if (Modalopened) return;
		
		$scope.singleBillData = $scope.returnSingleData(saleId);
		
		var modalInstance = $modal.open({
			templateUrl: 'app/views/PopupModal/Accounting/imageGalleryModal/imageGalleryModalContent.html',
			controller: 'imageGalleryModalCtrl as fromData',
			size: size,
			resolve:{
				billData: function(){

					return $scope.singleBillData;
				},
				formatType: function(){

					return 'payment';
				},
				transType: function(){

					return transaction;
				}
			}
		});

		Modalopened = true;

		modalInstance.result.then(function (msg) {

			if(msg == 'payment'){
				
				msg = 'Payment';
			}
			else{
				msg = 'Refund';
			}
			
			toaster.pop('success', 'Title', msg+' Successfully Done');
			/** Reload Load Data **/
			$scope.loadInit('yes');
			/** End **/
			
			console.log('success');
			Modalopened = false;
			
		}, function () {
			
			console.log('Cancel');
			Modalopened = false;
			
		});
		

	};
	
	/**
	End Payment  Modal 
	**/
	
	$scope.sortComment = function(comment) {
		var getResdate = comment.entryDate;
		var splitedate = getResdate.split("-").reverse().join("-");
		var date = new Date(splitedate);
		return date;
	};

	/* Date-picker Filter */

		// Datepicker
	  // ----------------------------------- 
	  this.minStart = new Date(0,0,1);
	  this.maxStart = new Date();

	  this.today = function() {

	    // this.dt1 = new Date();
	    this.dt1 = new Date(moment($rootScope.accView.fromDate,apiDateFormate).format('YYYY-MM-DD'));
	    if($scope.viewDataTypePath == 'CrmClientFilterView'){
	    	this.dt1 = null;
	    }
	};


	this.today();

	this.today2 = function() {
		if($scope.viewDataTypePath == 'GST Return'){
			this.dt2 = new Date();
			this.dt1.setMonth( this.dt1.getMonth() - 1);
		}
		else{
			 // this.dt2 = this.dt1;
			 this.dt2 = new Date(moment($rootScope.accView.toDate,apiDateFormate).format('YYYY-MM-DD'));
			}
			if($scope.viewDataTypePath == 'CrmClientFilterView'){
				this.dt2 = null;
			}
		};
		this.today2();
		
		/** JObcard **/
		
		this.todayJobcard = function() {
			this.jobcardDate1 = new Date();
			if($scope.viewDataTypePath == 'CrmClientFilterView'){
				this.jobcardDate1 = null;
			}
		};


		this.todayJobcard();

		this.todayJobcard2 = function() {
			this.jobcardDate2 = this.jobcardDate1;
			if($scope.viewDataTypePath == 'CrmClientFilterView'){
				this.jobcardDate2 = null;
			}
		};
		this.todayJobcard2();

		/** End **/
		
		this.check = function()
		{

			this.dt2 = this.dt1;
		};

		this.clear = function () {
			this.dt1 = null;
		};

	  // Disable weekend selection
	  this.disabled = function(date, mode) {

	    return false; //( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
	};

	  // this.toggleMin = function() {
	    // this.minDate = this.minDate ? null : new Date();
	  // };
	  // this.toggleMin();

	  this.openStart = function($event) {

	  	$event.preventDefault();
	  	$event.stopPropagation();

	  	this.openedStart = true;
	  };
	  
	  this.openEnd = function($event) {
	  	$event.preventDefault();
	  	$event.stopPropagation();

	  	this.openedEnd = true;
	  };
	  
	  /** JObcard **/
	  this.openStartJobcard = function($event) {

	  	$event.preventDefault();
	  	$event.stopPropagation();

	  	this.openedStartJobcard = true;
	  };
	  
	  this.openEndJobcard = function($event) {
	  	$event.preventDefault();
	  	$event.stopPropagation();

	  	this.openedEndJobcard = true;
	  };
	  /** End **/
	  this.dateOptions = {
	  	formatYear: 'yy',
	  	startingDay: 1
	  };

	  this.initDate = new Date('2016-15-20');
	  var dateFormats = $rootScope.dateFormats; //Date Format
	  // this.formats = ['dd-MMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
	  this.format = dateFormats;

	  /* End */

	  /* Print Multiple PDF */
	  $scope.selectedBoxArray = [];
	  $scope.clientFlag=0;
		// $scope.parentCheckBox = false;

		$scope.changeBox = function(box,pData){
			
			if(box == true){
				$scope.selectedBoxArray.push(pData);
			}
			else{
				var index = $scope.selectedBoxArray.indexOf(pData);
				$scope.selectedBoxArray.splice(index,1);
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
				$scope.clientFlag=1;
				$scope.selectedBoxArray = [];
				$scope.selectedBoxArray = $scope.filteredItems;
				if(Array.isArray($scope.selectedBoxArray))
				{
					var cnt  = $scope.selectedBoxArray.length;
					for(var k=0;k<cnt;k++){
						$scope.selectedBoxArray[k].selected = true;
					}
				}
				
			}
		}

		$scope.multiPdfPrint = function()
		{
			var selectedArray = $scope.selectedBoxArray;
			var uniqueArray = selectedArray.map(function(obj) { return obj['saleId']; });
			var saleIds = uniqueArray.join(',');
			var headerData = {contentType: undefined,'saleId' : saleIds};
			apiCall.getCallHeader(apiPath.multipleBillPrint,headerData).then(function(responsePath){
				if (angular.isObject(responsePath)) {
					if(responsePath.hasOwnProperty('documentPath')) {
						var pdfPath = $scope.erpPath+responsePath.documentPath;
						$scope.directPrintPdf(pdfPath);
					}
				}
			});
		}

		$scope.directPrintPdf = function(pdfUrlPath)
		{
			/** Print **/
			$http({
				url : pdfUrlPath,
				method : 'GET',
				headers : {
					'Content-type' : 'application/pdf'
				},
				responseType : 'arraybuffer'
			}).success(function(data, status, headers, config) {
				var pdfFile = new Blob([ data ], {
					type : 'application/pdf'
				});
				var pdfUrl = URL.createObjectURL(pdfFile);
				$scope.content = $sce.trustAsResourceUrl(pdfUrl);
				
				var printwWindow = $window.open(pdfUrl);
				printwWindow.print();
			}).error(function(data, status, headers, config) {
				alert('Sorry, something went wrong')
			});
			/** End **/
		}

		/* End */
	}
	AccViewDataController.$inject = ["$rootScope","$scope", "$filter","$http", "ngTableParams","apiCall","apiPath","flotOptions","colors","$timeout","getSetFactory","$state","headerType","$modal","$window","toaster","apiResponse","apiDateFormate","productFactory"];