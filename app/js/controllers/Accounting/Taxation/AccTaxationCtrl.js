
/**=========================================================
 * Module: AccTaxationController.js
 * Controller for ngTables
 =========================================================*/

App.controller('AccTaxationController', AccTaxationController);

function AccTaxationController($rootScope,$scope, $filter, ngTableParams,apiCall,apiPath,apiResponse,toaster,getSetFactory,$window,headerType) {
  'use strict';
  var vm = this;
	//$scope.brandradio="";
	
	var erpPath = $rootScope.erpPath;
	$scope.dateFormat =  $rootScope.dateFormats; //Date Format
	
  var data = [];
  $scope.data2 = [];
  $scope.data3 = [];
  $scope.tableHeaders = [];
  $scope.gstr2TotalRow = {};
  $scope.gstr2Data = {};
  var numericFields = ['invoice_value', 'taxable_value', 'integrated_tax', 'central_tax', 'state_tax', 'cess'];
  $scope.selectedTab = '';
  $scope.gstr3bTotal = {
  	outward: {
  		taxable_value: 0,
  		integrated_tax: 0,
  		central_tax: 0,
  		state_tax: 0,
  		cess: 0
  	},
  	inter_state_supplies: {
  		unregistered_taxable: 0,
  		unregistered_tax: 0,
  		composition_taxable: 0,
  		composition_tax: 0,
  		uin_taxable: 0,
  		uin_tax: 0
  	},
  	exempt_inward: {
  		inter_state_supplies: 0,
  		intra_state_supplies: 0
  	}
  };
	var flag = 0;
	$scope.gstr3bData = {};
	$scope.headerType = headerType;
	
	$scope.filterCompanyId = $rootScope.accView.companyId != undefined ? $rootScope.accView.companyId : $rootScope.$storage.authUser.defaultCompanyId;
	$scope.displayfromDate = $rootScope.accView.fromDate;
	$scope.displaytoDate = $rootScope.accView.toDate;
	
	/** Display Company and date **/
		apiCall.getCall(apiPath.getAllCompany+'/'+$scope.filterCompanyId).then(function(res){
			
			$scope.companyData = res;
			$scope.displayCompany = res.companyName;
			toaster.clear();
			toaster.pop('wait', 'Please Wait', 'Data Loading....',30000);
			
		});
		
	/** End **/
	
	// console.log($scope.filterCompanyId);
	// console.log($scope.displayfromDate);
	// console.log($scope.displaytoDate);
	// console.log($scope.headerType);
	// return false;
	
	/** Api Call And NgTable **/
		function totalCalcForGSTR3B(response) 
		{

			for (var ouwardCount = 0; ouwardCount < response.outward.length; ouwardCount++) 
			{
				$scope.gstr3bTotal.outward.taxable_value += response.outward[ouwardCount].taxable_value;
				$scope.gstr3bTotal.outward.integrated_tax += response.outward[ouwardCount].integrated_tax;
				$scope.gstr3bTotal.outward.central_tax += response.outward[ouwardCount].central_tax;
				$scope.gstr3bTotal.outward.state_tax += response.outward[ouwardCount].state_tax;
				$scope.gstr3bTotal.outward.cess += response.outward[ouwardCount].cess;
			}
			var interStateCount;
			for (interStateCount in response.inter_state_supplies) 
			{
				$scope.gstr3bTotal.inter_state_supplies.unregistered_taxable += response.inter_state_supplies[interStateCount].unregistered_taxable;
				$scope.gstr3bTotal.inter_state_supplies.unregistered_tax += response.inter_state_supplies[interStateCount].unregistered_tax;
				$scope.gstr3bTotal.inter_state_supplies.composition_taxable += response.inter_state_supplies[interStateCount].composition_taxable;
				$scope.gstr3bTotal.inter_state_supplies.composition_tax += response.inter_state_supplies[interStateCount].composition_tax;
				$scope.gstr3bTotal.inter_state_supplies.uin_taxable += response.inter_state_supplies[interStateCount].uin_taxable;
				$scope.gstr3bTotal.inter_state_supplies.uin_tax += response.inter_state_supplies[interStateCount].uin_tax;
			}
			for (var exemptCount = 0; exemptCount < response.exempt_inward.length; exemptCount++) 
			{
				$scope.gstr3bTotal.exempt_inward.inter_state_supplies += response.exempt_inward[exemptCount].inter_state_supplies;
				$scope.gstr3bTotal.exempt_inward.intra_state_supplies += response.exempt_inward[exemptCount].intra_state_supplies;
			}
			toaster.clear();
		}
		function calculate_GSTR3B(response)
		{
			var returnArray = [];
			var tempObj = {};
			  	tempObj.perticular = "(a) Outward taxable supplies (other than zero rated, nil rated and exempted)";
			  	tempObj.totalTax = 0;
			  	tempObj.igst = 0;
			  	tempObj.cgst = 0;
			  	tempObj.sgst = 0;
			  	tempObj.cess = 0;

			var cnt = response.length;
			var i = 0; 
			while(i < cnt) 
			{
			  	tempObj.cgst = tempObj.cgst + parseFloat(response[i].totalCgst); 
			  	tempObj.sgst = tempObj.sgst + parseFloat(response[i].totalSgst); 
			  	tempObj.igst = tempObj.igst + parseFloat(response[i].totalIgst); 
			  	tempObj.totalTax = tempObj.totalTax + parseFloat(response[i].tax); 
			  	i++;
			}

			returnArray.push(tempObj);
			
			var tempObj = {};
			  	tempObj.perticular = "(b) outward supplies, (Nil rated, exempted, Zero Tax Sales)";
			  	tempObj.totalTax = 0;
			  	tempObj.igst = 0;
			  	tempObj.cgst = 0;
			  	tempObj.sgst = 0;
			  	tempObj.cess = 0;

			returnArray.push(tempObj);

			console.log('returnArray1.',returnArray);

			return returnArray;
		}

		function calculate_GSTR3B_inward (response) 
		{
			var returnArray = [];
			var tempObj = {};
			  	tempObj.perticular = "(a) Inward taxable supplies (other than zero rated, nil rated and exempted)";
			  	tempObj.totalTax = 0;
			  	tempObj.igst = 0;
			  	tempObj.cgst = 0;
			  	tempObj.sgst = 0;
			  	tempObj.cess = 0;

			var cnt = response.length;
			var i = 0; 
			while(i < cnt) 
			{
			  	tempObj.cgst = tempObj.cgst + parseFloat(response[i].totalCgst); 
			  	tempObj.sgst = tempObj.sgst + parseFloat(response[i].totalSgst); 
			  	tempObj.igst = tempObj.igst + parseFloat(response[i].totalIgst); 
			  	tempObj.totalTax = tempObj.totalTax + parseFloat(response[i].totalTax); 
			  	i++;
			}

			returnArray.push(tempObj);
			
			var tempObj = {};
			  	tempObj.perticular = "(B) Inward Taxable supplies (liable to reverse charge) URD Purchas";
			  	tempObj.totalTax = 0;
			  	tempObj.igst = 0;
			  	tempObj.cgst = 0;
			  	tempObj.sgst = 0;
			  	tempObj.cess = 0;

			returnArray.push(tempObj);

			var tempObj = {};
			  	tempObj.perticular = "(c) Inward supplies, (Zero rated, Nil rated, exempted)";
			  	tempObj.totalTax = 0;
			  	tempObj.igst = 0;
			  	tempObj.cgst = 0;
			  	tempObj.sgst = 0;
			  	tempObj.cess = 0;

			returnArray.push(tempObj);

			console.log('returnArray2.',returnArray);

			return returnArray;

		}

		function calculate_GSTR3B_interState(response)
		{
			var returnArray = [];
			var tempObj = {};
			  	tempObj.perticular = "(a) Inter-State Taxable Supplies made to Unregistered Persons";
			  	tempObj.placeOfSupply = 0;
			  	tempObj.totalTax = 0;
			  	tempObj.integratedTax = 0;

			returnArray.push(tempObj);

			var tempObj = {};
				tempObj.perticular = "(b) Nil Rated Supplies made to Unregistered Persons Zero Tax Sales";
			  	tempObj.placeOfSupply = 0;
			  	tempObj.totalTax = 0;
			  	tempObj.integratedTax = 0;

			returnArray.push(tempObj);

			console.log('returnArray3.',returnArray);

			return returnArray;
		}

		$scope.getProduct = function(path,headerData,flag = 0)
		{
		
			toaster.clear();
			toaster.pop('wait', 'Please Wait', 'Data Loading....',60000);
				
			apiCall.getCallHeader(path,headerData).then(function(response){
				
				toaster.clear();
				
				if(angular.isArray(response))
				{
					if(flag == 1)
					{
							data = response;
					}
					else if(flag==2)
					{
						$scope.data2 = response;
					}
					else if(flag==3)
					{
						$scope.data3 = response;
					}
					// console.log(data2);
					// console.log(data);
					$scope.exportPdfHidden = true;
				}
				else if(angular.isObject(response))
				{
					if ($scope.headerType == 'GST Return3b')
					{
						$scope.gstr3bData = response;
						totalCalcForGSTR3B(response);
					}
					else if ($scope.headerType == 'GST Return2')
					{
						$scope.gstr2Data = response;
						$scope.selectedTab = Object.keys(response)[0];
						$scope.tableHeaders = Object.keys($scope.gstr2Data[$scope.selectedTab][0]);
						calculate_GSTR2($scope.gstr2Data[$scope.selectedTab]);
					}
					if(response.hasOwnProperty('imps'))
					{
						$scope.data2 = response.imps;
					}
					
					if(response.hasOwnProperty('b2b')){
						data = response.b2b;
						$scope.data3 = response.b2b;
						
					}
					if(response.hasOwnProperty('gstr1Invoice')){
						data = response.gstr1Invoice;
						$scope.data3 = response.gstr1Invoice;
					}

					/* GSTR3B */
					// 	if(response.hasOwnProperty('inward'))
					// 	{
					// 		$scope.data2 = response.inward;
					// 	}
						
					// 	if(response.hasOwnProperty('outward'))
					// 	{
					// 		data = response.outward;
					// 	}

					// 	if(response.hasOwnProperty('innerState'))
					// 	{
					// 		$scope.data3 = response.innerState;
					// 	}

					// 	$scope.TableData2();
					// 	$scope.TableData3();
					// /* End */
					

					$scope.exportPdfHidden = true;

				}
				else{

					if(apiResponse.noContent == response || apiResponse.notFound == response){
						if(flag==1)
						{
							data=[];
							// data3=[];
						}
						else if(flag==2)
						{
							$scope.data2=[];	
							// data3=[];	
						}
						else if(flag==3)
						{
							$scope.data3=[];	
							// data2=[];
						}
						toaster.pop('alert', 'Opps!!', 'No Data Available');
						$scope.exportPdfHidden = false;
					}
				}

				if(flag == 1)
				{
					$scope.TableData();
				}
				else if(flag==2)
				{
					$scope.TableData2();
				}
				else if(flag==3)
				{
					$scope.TableData3();
				}

			});

		}
		$scope.getIncomeExpenseData = function(path,headerData)
		{
			apiCall.getCallHeader(path,headerData).then(function(response){
				if(angular.isArray(response) || angular.isObject(response)){
					$scope.incomeExpenseDetail = response;
				}
				else 
				{
					if(apiResponse.noContent == response || apiResponse.notFound == response)
					{
						$scope.incomeExpenseDetail = 0;
					}
				}
				console.log(response);
			});
		}


		$scope.additionOfValue = function(value1,value2)
		{
			return parseFloat(value1)+parseFloat(value2);
		}

		$scope.substractionOfValue = function(value1,value2,value3)
		{
			return (parseFloat(value1)+parseFloat(value2))-parseFloat(value3);
		}


		$scope.TableData = function(){
		  $scope.tableParams = new ngTableParams({
			  page: 1,            // show first page
			  count: 10,          // count per page
			  sorting: {
				  invoiceNumber: 'desc'     // initial sorting
			  }
		  }, {
			  // counts: [],
			  total: data.length, // length of data
			  getData: function($defer, params) {
			  	// use build-in angular filter
				  if(!$.isEmptyObject(params.$params.filter) && ((typeof(params.$params.filter.invoiceNumber) != "undefined" && params.$params.filter.invoiceNumber != "")  || (typeof(params.$params.filter.salesType) != "undefined" && params.$params.filter.salesType != "") || (typeof(params.$params.filter.clientName) != "undefined" && params.$params.filter.clientName != "") || (typeof(params.$params.filter.advance) != "undefined" && params.$params.filter.advance != "") || (typeof(params.$params.filter.balance) != "undefined" && params.$params.filter.balance != "") || (typeof(params.$params.filter.tax) != "undefined" && params.$params.filter.tax != "") || (typeof(params.$params.filter.grandTotal) != "undefined" && params.$params.filter.grandTotal != "")))
				  {
						 var orderedData = params.filter() ?
						 $filter('filter')(data, params.filter()) :
						 data;
						  vm.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
						  params.total(orderedData.length); // set total for recalc pagination
						  $defer.resolve(vm.users);
				  }
				else
				{
					params.total(data.length);
				}
				 
				 if(!$.isEmptyObject(params.$params.sorting))
				  {
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
		}
		
		$scope.TableData2 = function(){
			 
		  $scope.tableParams2 = new ngTableParams({
			  page: 1,            // show first page
			  count: 10,          // count per page
			  sorting: {
				  billNumber: 'desc'     // initial sorting
			  }
		  }, {
			  // counts: [],
			  total: $scope.data2.length, // length of data
			  getData: function($defer, params) {
				  // use build-in angular filter
				  if(!$.isEmptyObject(params.$params.filter) && ((typeof(params.$params.filter.billNumber) != "undefined" && params.$params.filter.billNumber != "")  || (typeof(params.$params.filter.salesType) != "undefined" && params.$params.filter.salesType != "") || (typeof(params.$params.filter.clientName) != "undefined" && params.$params.filter.clientName != "") || (typeof(params.$params.filter.advance) != "undefined" && params.$params.filter.advance != "") || (typeof(params.$params.filter.balance) != "undefined" && params.$params.filter.balance != "") || (typeof(params.$params.filter.tax) != "undefined" && params.$params.filter.tax != "") || (typeof(params.$params.filter.grandTotal) != "undefined" && params.$params.filter.grandTotal != "") || (typeof(params.$params.filter.additionalTax) != "undefined" && params.$params.filter.additionalTax != "")))
				  {
						 var orderedData = params.filter() ?
						 $filter('filter')($scope.data2, params.filter()) :
						 $scope.data2;
						  vm.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
						  params.total(orderedData.length); // set total for recalc pagination
						  $defer.resolve(vm.users);
				  }
				else
				{
					params.total($scope.data2.length);
				}
				 
				 if(!$.isEmptyObject(params.$params.sorting))
				  {
					  var orderedData = params.sorting() ?
							  $filter('orderBy')($scope.data2, params.orderBy()) :
							  $scope.data2;
					  $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				  }
				
				$scope.totalData2 = $scope.data2.length;
				$scope.pageNumber2 = params.page();
				$scope.itemsPerPage2 = params.count();
				$scope.totalPages2 = Math.ceil($scope.totalData2/params.count());
				  }
		  });
		}
		

		$scope.TableData3 = function(){
			 // console.log($scope.data3);
		  $scope.tableParams3 = new ngTableParams({
			  page: 1,            // show first page
			  count: 1000,          // count per page
			  sorting: {
				  productName: 'desc'     // initial sorting
			  }
		  }, {
			  // counts: [],
			  total: $scope.data3.length, // length of data
			  getData: function($defer, params) {
				  // use build-in angular filter
				  if(!$.isEmptyObject(params.$params.filter) && ((typeof(params.$params.filter.productName) != "undefined" && params.$params.filter.productName != "")))
				  {
				  	var orderedData = params.filter() ?
				  	$filter('filter')($scope.data3, params.filter()) :$scope.data3;
				  	vm.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
						  params.total(orderedData.length); // set total for recalc pagination
						  $defer.resolve(vm.users);
						}
						else
						{
							params.total($scope.data3.length);
						}

						if(!$.isEmptyObject(params.$params.sorting))
						{
							var orderedData = params.sorting() ?
							$filter('orderBy')($scope.data3, params.orderBy()) :
							$scope.data3;
							$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
						}

						$scope.totalData3 = $scope.data3.length;
						$scope.pageNumber3 = params.page();
						$scope.itemsPerPage3 = params.count();
						$scope.totalPages3 = Math.ceil($scope.totalData3/params.count());
					}
		  });
		 // vm
		}
	/** End **/
	var headerData = {'Content-Type': undefined,'fromDate':$scope.displayfromDate,'toDate':$scope.displaytoDate};
	var getJrnlPath;
	if($scope.headerType == 'salesTaxation'){
		
		getJrnlPath = apiPath.getSalesTax+$scope.filterCompanyId;
		$scope.getProduct(getJrnlPath,headerData,1);
	}
	else if($scope.headerType == 'purchaseTaxation'){
		
		getJrnlPath = apiPath.getPurchaseTax+$scope.filterCompanyId;
		$scope.getProduct(getJrnlPath,headerData,1);
	}
	else if($scope.headerType == 'purchaseDetailTaxation'){
		
		getJrnlPath = apiPath.getPurchaseDetail+$scope.filterCompanyId;
		$scope.getProduct(getJrnlPath,headerData,1);
	}
	else if($scope.headerType == 'GST Return'){
		// getJrnlPath = apiPath.getGstReturn+$scope.filterCompanyId;
		getJrnlPath = apiPath.getSalesTax+$scope.filterCompanyId;
		
		var getJrnlPath2 = apiPath.getPurchaseTax+$scope.filterCompanyId;
		$scope.getProduct(getJrnlPath2,headerData,2);
		
		var getJrnlPath3 = apiPath.getSalesTax+$scope.filterCompanyId;
		$scope.getProduct(getJrnlPath3,headerData,1);
		
		var getJrnlPath4 = apiPath.getStockData+$scope.filterCompanyId;
		$scope.getProduct(getJrnlPath4,headerData,3);

		var getJrnlPath5 = apiPath.getIncomeExpenseData+$scope.filterCompanyId;
		$scope.getIncomeExpenseData(getJrnlPath5,headerData);
	}
	else if($scope.headerType == 'GST Return2')
	{
		getJrnlPath = apiPath.getGstReturn2+$scope.filterCompanyId;
		$scope.getProduct(getJrnlPath,headerData,1);
	}
	else if($scope.headerType == 'GST Return3')
	{
		getJrnlPath = apiPath.getGstReturn3+$scope.filterCompanyId;
		$scope.getProduct(getJrnlPath,headerData,1);
	}
	else if($scope.headerType == 'GST Return3b')
	{
		getJrnlPath = apiPath.getGstReturn3b+$scope.filterCompanyId;
		$scope.getProduct(getJrnlPath,headerData,1);
	}
	
	$scope.changeActiveTab = function(tab)
	{
		$scope.selectedTab = tab;
		if ($scope.gstr2Data[tab].length) 
		{
			$scope.tableHeaders = Object.keys($scope.gstr2Data[tab][0]);
		}
		calculate_GSTR2($scope.gstr2Data[tab]);
	}
	$scope.fixHeading = function(title)
	{
		return title.replace(/_/g,' ');
	}
	$scope.fixValue = function(title, key)
	{
		if (numericFields.indexOf(key) >= 0) 
		{
			title = $filter('setDecimal')(title,2);
		}
		return title;
	}
	$scope.fixValueCss = function(key)
	{
		if (numericFields.indexOf(key) >= 0) 
		{
			return 'text-align:right;'
		}
		return 'text-align:left;';
	}

	function calculate_GSTR2(gstrRes)
	{
		$scope.gstr2TotalRow = {};
		$scope.gstr2TotalRow[$scope.tableHeaders[0]] = 'Total';
		for (var j = 1; j < $scope.tableHeaders.length; j++) 
		{
			if (numericFields.indexOf($scope.tableHeaders[j]) >= 0) 
			{
				$scope.gstr2TotalRow[$scope.tableHeaders[j]] = 0;
			}
			else
			{
				$scope.gstr2TotalRow[$scope.tableHeaders[j]] = '-';
			}
		}
		for (var i = 0; i < gstrRes.length; i++) 
		{
			$.each(gstrRes[i], function(key, val) 
			// for(const [key, val] of gstrRes[i])
			{
				if (numericFields.indexOf(key) >= 0) 
				{
					$scope.gstr2TotalRow[key] += parseFloat(val);
				}
			});
		}
	}

	$scope.refreshTable = function(){
		
		// $scope.tableParams.reload();
		// $scope.tableParams.page(1);
		// $scope.tableParams2.reload();
		// $scope.tableParams2.page(1);
		// $scope.tableParams3.reload();
		//$scope.tableParams3.page(1);
	}
	//Date Convert
	
	$scope.dateConvert = function(entryDate){
		if(entryDate === undefined){
            return false;
        }
		var entDate = entryDate.split("-").reverse().join("-");
		return entDate; 
	}
	
  /*** Pdf ***/
	
		$scope.generatePdf = function(operation){
			
			toaster.clear();
			toaster.pop('wait', 'Please Wait', operation.toUpperCase()+' Loading...');
			var getData = {"Content-Type": undefined,'fromDate':$scope.displayfromDate,'toDate':$scope.displaytoDate};
			getData.operation = operation;
			
			apiCall.getCallHeader(getJrnlPath,getData).then(function(responseDrop){
			
				//console.log(responseDrop);
				toaster.clear();
				
				if(angular.isObject(responseDrop)  && responseDrop.hasOwnProperty('documentPath')){
					var pdfPath = erpPath+responseDrop.documentPath;
					$window.open(pdfPath,"_self");
				}
				else{
					
					if(responseDrop.status == 500){
						toaster.pop('warning', 'Opps!', responseDrop.statusText);
					}
					else{
						toaster.pop('warning', 'Opps!', responseDrop);
					}
				}
			});
		}
	
	/*** End Pdf ***/

}
AccTaxationController.$inject = ["$rootScope","$scope", "$filter", "ngTableParams","apiCall","apiPath","apiResponse","toaster","getSetFactory","$window","headerType"];